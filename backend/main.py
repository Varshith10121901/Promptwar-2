from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import folium
from folium.plugins import MarkerCluster, MiniMap, Fullscreen
import google.generativeai as genai
import json
import os

app = FastAPI(title="VoteWise Map API")

# Enable CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Gemini API
genai.configure(api_key="AIzaSyDCDxX6Ot7MSmLIb4jy_ERPADSBwMKj9hQ")

class LocationRequest(BaseModel):
    location: str

def generate_polling_stations(location: str):
    """Uses Gemini API to generate 5 realistic nearby polling stations for the location."""
    model = genai.GenerativeModel('gemini-1.5-flash')
    prompt = f"""
    You are an expert geographer and election official. The user is located near "{location}".
    Provide a list of 5 realistic polling stations (like local schools, community halls, or municipal buildings) located near "{location}".
    
    You MUST return ONLY a raw JSON array of objects, with no markdown formatting, no code blocks, and no extra text.
    Each object must have exactly these keys:
    "name": The name of the polling station
    "lat": The latitude coordinate as a float
    "lon": The longitude coordinate as a float
    
    Example response format:
    [
      {{"name": "Govt High School", "lat": 12.9716, "lon": 77.5946}},
      {{"name": "Community Center", "lat": 12.9720, "lon": 77.5950}}
    ]
    """
    
    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        # Clean up markdown if it was still generated
        if text.startswith("```json"):
            text = text[7:]
        if text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        
        stations = json.loads(text.strip())
        return stations
    except Exception as e:
        print("Gemini Error:", e)
        # Fallback coordinates if API fails
        return []

def build_map_html(stations, center_lat, center_lon):
    """Builds the Folium map and returns it as an HTML string."""
    fmap = folium.Map(
        location=[center_lat, center_lon],
        zoom_start=14,
        tiles=None
    )

    # 🛰️ HD Satellite (BEST)
    folium.TileLayer(
        tiles="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        attr="Esri World Imagery",
        name="🛰️ HD Satellite",
    ).add_to(fmap)

    # 🌑 Dark Mode
    folium.TileLayer(
        tiles="CartoDB dark_matter",
        name="🌑 Dark Mode",
    ).add_to(fmap)

    # 🗺️ Light Map
    folium.TileLayer(
        tiles="CartoDB positron",
        name="🗺️ Light Map",
    ).add_to(fmap)

    # Add events
    cluster = MarkerCluster().add_to(fmap)

    for st in stations:
        folium.Marker(
            location=[st["lat"], st["lon"]],
            popup=st["name"],
            tooltip=st["name"],
            icon=folium.Icon(color="red", icon="info-sign")
        ).add_to(cluster)

    # UI Features
    MiniMap(toggle_display=True).add_to(fmap)
    Fullscreen().add_to(fmap)
    folium.LayerControl().add_to(fmap)

    return fmap.get_root().render()

@app.post("/api/generate_map")
async def generate_map(req: LocationRequest):
    stations = generate_polling_stations(req.location)
    
    if not stations:
        raise HTTPException(status_code=500, detail="Failed to find nearby polling stations.")
        
    # Calculate map center from first station
    center_lat = stations[0]["lat"]
    center_lon = stations[0]["lon"]
    
    html_content = build_map_html(stations, center_lat, center_lon)
    return HTMLResponse(content=html_content)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
