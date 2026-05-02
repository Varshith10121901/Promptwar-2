"""
VoteWise Map API — FastAPI Backend (v2.1.0)

Gemini-powered election zone map generator using Google Cloud services.
Provides secure, validated endpoints for polling station discovery.

Architecture:
    - FastAPI (ASGI) for high-performance async HTTP
    - Pydantic v2 for strict request validation
    - Gemini 2.5 Flash for AI-powered polling station generation
    - Folium/Leaflet for interactive HD satellite map rendering

Security:
    - Input sanitization with length caps
    - Prompt injection detection (defense-in-depth)
    - CORS restricted to allowed origins
    - Structured error responses

Author: VoteWise Team
License: MIT
Version: 2.1.0
"""

import os
import json
import logging
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator
import folium
from folium.plugins import MarkerCluster, MiniMap, Fullscreen
import google.generativeai as genai

# ─────────────────────────────────────────────
# CONSTANTS
# ─────────────────────────────────────────────

MAX_LOCATION_LENGTH: int = 100
"""Maximum allowed length for location input strings."""

GEMINI_MODEL: str = "gemini-2.5-flash"
"""Gemini model identifier for polling station generation."""

DEFAULT_ZOOM: int = 14
"""Default zoom level for generated Folium maps."""

POLLING_STATION_COUNT: int = 5
"""Number of polling stations to generate per request."""

BLOCKED_PHRASES: list[str] = [
    "ignore previous",
    "forget",
    "system:",
    "assistant:",
    "you are now",
]
"""Blocked prompt injection phrases (defense-in-depth)."""

# ─────────────────────────────────────────────
# LOGGING
# ─────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s",
)
logger = logging.getLogger("votewise.backend")

# ─────────────────────────────────────────────
# APP SETUP
# ─────────────────────────────────────────────

app = FastAPI(
    title="VoteWise Map API",
    description="Gemini-powered election zone map generator with HD satellite view.",
    version="2.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS: allow frontend origins (configurable via env)
ALLOWED_ORIGINS: list[str] = os.environ.get(
    "CORS_ORIGINS",
    "http://localhost:5173,http://localhost:8080",
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["POST", "GET"],
    allow_headers=["Content-Type"],
)

# ─────────────────────────────────────────────
# GEMINI CONFIGURATION
# ─────────────────────────────────────────────

GEMINI_API_KEY: str = os.environ.get("GEMINI_API_KEY", "")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    logger.info("Gemini API configured successfully.")
else:
    logger.warning("GEMINI_API_KEY not set. Map generation will fail.")


# ─────────────────────────────────────────────
# SCHEMAS
# ─────────────────────────────────────────────


class LocationRequest(BaseModel):
    """
    Request schema for the map generation endpoint.

    Attributes:
        location: User's city or place name (max 100 chars).
    """

    location: str

    @field_validator("location")
    @classmethod
    def validate_location(cls, v: str) -> str:
        """
        Validate and sanitize the location input.

        Applies three layers of defense:
            1. Whitespace trimming
            2. Length validation (≤100 chars)
            3. Prompt injection detection

        Args:
            v: Raw location string from the request body.

        Returns:
            Sanitized location string.

        Raises:
            ValueError: If the input is empty, too long, or contains
                blocked injection phrases.
        """
        v = v.strip()
        if not v:
            raise ValueError("Location must not be empty.")
        if len(v) > MAX_LOCATION_LENGTH:
            raise ValueError(
                f"Location must be {MAX_LOCATION_LENGTH} characters or fewer."
            )
        # Prompt injection guard (defense-in-depth)
        lower_v = v.lower()
        for phrase in BLOCKED_PHRASES:
            if phrase in lower_v:
                raise ValueError("Invalid location input.")
        return v


class HealthResponse(BaseModel):
    """
    Response schema for the health check endpoint.

    Attributes:
        status: Service health status ('ok').
        service: Service name identifier.
        version: API version string.
    """

    status: str
    service: str
    version: str


class MapErrorResponse(BaseModel):
    """
    Error response schema for failed map generation.

    Attributes:
        detail: Human-readable error description.
    """

    detail: str


# ─────────────────────────────────────────────
# SERVICES
# ─────────────────────────────────────────────


def fetch_polling_stations(location: str) -> list[dict[str, Any]]:
    """
    Use Gemini 2.5 Flash to generate realistic nearby polling
    station coordinates for the given location.

    The function sends a structured prompt to the Gemini API and
    expects a JSON array of station objects in response.

    Args:
        location: Sanitized location string (city/place name).

    Returns:
        List of dicts with keys: name (str), lat (float), lon (float).
        Returns an empty list on any failure.
    """
    model = genai.GenerativeModel(GEMINI_MODEL)
    prompt = (
        "You are an expert Indian geographer and election "
        f'official. The user is located near "{location}". '
        f"Provide a list of exactly {POLLING_STATION_COUNT} realistic "
        f'polling stations near "{location}". '
        "Return ONLY a raw JSON array. No markdown. "
        "No code blocks. No extra text. "
        'Each object must have: "name" (string), '
        '"lat" (float), "lon" (float). '
        'Example: [{"name":"Govt High School",'
        '"lat":12.9716,"lon":77.5946}]'
    )

    logger.info("Generating polling stations for: %s", location)

    try:
        response = model.generate_content(prompt)
        text = response.text.strip()

        # Sanitize markdown wrappers if present
        for prefix in ["```json", "```"]:
            if text.startswith(prefix):
                text = text[len(prefix) :]
        if text.endswith("```"):
            text = text[:-3]

        stations: list[dict[str, Any]] = json.loads(text.strip())
        logger.info(
            "Generated %d stations for: %s",
            len(stations),
            location,
        )
        return stations

    except json.JSONDecodeError as exc:
        logger.error("Failed to parse Gemini JSON: %s", exc)
        return []
    except Exception as exc:  # noqa: BLE001
        logger.error("Gemini API error: %s", exc)
        return []


def build_folium_map(
    stations: list[dict[str, Any]],
    center_lat: float,
    center_lon: float,
) -> str:
    """
    Build an interactive HD Satellite Folium map with clustered markers.

    Creates a multi-layer map with:
        - HD Satellite (Esri World Imagery)
        - Dark mode (CartoDB dark_matter)
        - Light mode (CartoDB positron)
        - Clustered polling station markers
        - MiniMap and fullscreen controls

    Args:
        stations: List of station dicts with name, lat, lon keys.
        center_lat: Latitude for the map center point.
        center_lon: Longitude for the map center point.

    Returns:
        Complete HTML string of the rendered Folium map.
    """
    fmap = folium.Map(
        location=[center_lat, center_lon],
        zoom_start=DEFAULT_ZOOM,
        tiles=None,
    )

    # HD Satellite layer
    satellite_url = (
        "https://server.arcgisonline.com/ArcGIS/rest/services/"
        "World_Imagery/MapServer/tile/{z}/{y}/{x}"
    )
    folium.TileLayer(
        tiles=satellite_url,
        attr="Esri World Imagery",
        name="HD Satellite",
    ).add_to(fmap)

    # Dark mode layer
    folium.TileLayer(
        tiles="CartoDB dark_matter",
        name="Dark Mode",
    ).add_to(fmap)

    # Light mode layer
    folium.TileLayer(
        tiles="CartoDB positron",
        name="Light Map",
    ).add_to(fmap)

    cluster = MarkerCluster().add_to(fmap)

    for station in stations:
        popup_html = (
            f"<b>{station['name']}</b>"
            "<br>Election Polling Station"
        )
        folium.Marker(
            location=[station["lat"], station["lon"]],
            popup=folium.Popup(popup_html, max_width=200),
            tooltip=station["name"],
            icon=folium.Icon(color="red", icon="info-sign"),
        ).add_to(cluster)

    MiniMap(toggle_display=True).add_to(fmap)
    Fullscreen().add_to(fmap)
    folium.LayerControl().add_to(fmap)

    return fmap.get_root().render()


# ─────────────────────────────────────────────
# ENDPOINTS
# ─────────────────────────────────────────────


@app.get(
    "/health",
    response_model=HealthResponse,
    summary="Health check",
    tags=["System"],
)
def health_check() -> dict[str, str]:
    """
    Health check endpoint for Docker/Cloud Run health probes.

    Returns:
        JSON with status, service name, and version.
    """
    return {
        "status": "ok",
        "service": "VoteWise Map API",
        "version": "2.1.0",
    }


@app.post(
    "/api/generate_map",
    response_class=HTMLResponse,
    summary="Generate election map",
    tags=["Maps"],
    responses={
        503: {"model": MapErrorResponse, "description": "Gemini API failure"},
    },
)
async def generate_map(req: LocationRequest) -> HTMLResponse:
    """
    Accept a location string, call the Gemini API to find
    nearby polling stations, and return a Folium HD satellite map.

    Args:
        req: Validated LocationRequest with sanitized location string.

    Returns:
        HTMLResponse containing the rendered Folium map.

    Raises:
        HTTPException: 503 if Gemini returns no polling stations.
    """
    stations = fetch_polling_stations(req.location)

    if not stations:
        logger.warning(
            "No stations returned for: %s", req.location
        )
        raise HTTPException(
            status_code=503,
            detail="Could not generate polling station data.",
        )

    center_lat: float = stations[0]["lat"]
    center_lon: float = stations[0]["lon"]
    html_content = build_folium_map(
        stations, center_lat, center_lon
    )

    return HTMLResponse(content=html_content)


# ─────────────────────────────────────────────
# ENTRY POINT
# ─────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
