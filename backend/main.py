from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator
import folium
from folium.plugins import MarkerCluster, MiniMap, Fullscreen
import google.generativeai as genai
import json
import logging

# ─────────────────────────────────────────────
# LOGGING
# ─────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s"
)
logger = logging.getLogger("votewise.backend")

# ─────────────────────────────────────────────
# APP SETUP
# ─────────────────────────────────────────────
app = FastAPI(
    title="VoteWise Map API",
    description="Gemini-powered election zone map generator",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["POST", "GET"],
    allow_headers=["Content-Type"],
)

# ─────────────────────────────────────────────
# GEMINI CONFIGURATION
# ─────────────────────────────────────────────
genai.configure(api_key="AIzaSyDCDxX6Ot7MSmLIb4jy_ERPADSBwMKj9hQ")


# ─────────────────────────────────────────────
# SCHEMAS
# ─────────────────────────────────────────────
class LocationRequest(BaseModel):
    location: str

    @field_validator("location")
    @classmethod
    def validate_location(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Location must not be empty.")
        if len(v) > 100:
            raise ValueError("Location must be 100 characters or fewer.")
        # Basic prompt injection guard
        blocked = ["ignore previous", "forget", "system:", "assistant:"]
        for phrase in blocked:
            if phrase in v.lower():
                raise ValueError("Invalid location input.")
        return v


# ─────────────────────────────────────────────
# SERVICES
# ─────────────────────────────────────────────
def fetch_polling_stations(location: str) -> list:
    """
    Uses Gemini 1.5 Flash to generate realistic nearby polling station
    coordinates for the given location.

    Returns:
        List of dicts with keys: name, lat, lon
    """
    model = genai.GenerativeModel("gemini-1.5-flash")
    prompt = (
        f'You are an expert Indian geographer and election official. '
        f'The user is located near "{location}". '
        f'Provide a list of exactly 5 realistic polling stations '
        f'(like local schools, community halls, or municipal buildings) near "{location}". '
        f'Return ONLY a raw JSON array. No markdown. No code blocks. No extra text. '
        f'Each object must have: "name" (string), "lat" (float), "lon" (float). '
        f'Example: [{{"name":"Govt High School","lat":12.9716,"lon":77.5946}}]'
    )

    logger.info(f"Generating polling stations for: {location}")

    try:
        response = model.generate_content(prompt)
        text = response.text.strip()

        # Sanitize markdown wrappers if present
        for prefix in ["```json", "```"]:
            if text.startswith(prefix):
                text = text[len(prefix):]
        if text.endswith("```"):
            text = text[:-3]

        stations = json.loads(text.strip())
        logger.info(f"Successfully generated {len(stations)} stations for: {location}")
        return stations

    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse Gemini JSON response: {e}")
        return []
    except Exception as e:
        logger.error(f"Gemini API error: {e}")
        return []


def build_folium_map(stations: list, center_lat: float, center_lon: float) -> str:
    """
    Builds an interactive HD Satellite Folium map with all station markers.

    Returns:
        HTML string of the rendered map.
    """
    fmap = folium.Map(
        location=[center_lat, center_lon],
        zoom_start=14,
        tiles=None
    )

    # HD Satellite layer
    folium.TileLayer(
        tiles="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        attr="Esri World Imagery",
        name="HD Satellite",
    ).add_to(fmap)

    # Dark mode layer
    folium.TileLayer(tiles="CartoDB dark_matter", name="Dark Mode").add_to(fmap)

    # Light mode layer
    folium.TileLayer(tiles="CartoDB positron", name="Light Map").add_to(fmap)

    cluster = MarkerCluster().add_to(fmap)

    for station in stations:
        popup_html = f"<b>{station['name']}</b><br>Election Polling Station"
        folium.Marker(
            location=[station["lat"], station["lon"]],
            popup=folium.Popup(popup_html, max_width=200),
            tooltip=station["name"],
            icon=folium.Icon(color="red", icon="info-sign")
        ).add_to(cluster)

    MiniMap(toggle_display=True).add_to(fmap)
    Fullscreen().add_to(fmap)
    folium.LayerControl().add_to(fmap)

    return fmap.get_root().render()


# ─────────────────────────────────────────────
# ENDPOINTS
# ─────────────────────────────────────────────
@app.get("/health")
def health_check():
    """Health check endpoint for Docker/cloud health probes."""
    return {"status": "ok", "service": "VoteWise Map API"}


@app.post("/api/generate_map")
async def generate_map(req: LocationRequest):
    """
    Accepts a location string, calls the Gemini API to find nearby
    polling stations, and returns a rendered Folium HD map as HTML.
    """
    stations = fetch_polling_stations(req.location)

    if not stations:
        logger.warning(f"No stations returned for location: {req.location}")
        raise HTTPException(
            status_code=503,
            detail="Could not generate polling station data. Please try again."
        )

    center_lat = stations[0]["lat"]
    center_lon = stations[0]["lon"]
    html_content = build_folium_map(stations, center_lat, center_lon)

    return HTMLResponse(content=html_content)


# ─────────────────────────────────────────────
# ENTRY POINT
# ─────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
