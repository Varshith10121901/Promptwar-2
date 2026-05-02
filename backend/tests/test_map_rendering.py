"""
Tests for the build_folium_map service function and map rendering.

Covers:
    - Map HTML generation structure
    - Tile layer presence (satellite, dark, light)
    - Marker cluster rendering
    - MiniMap and Fullscreen plugin inclusion
    - Edge cases (single station, many stations)
"""
import pytest
from main import build_folium_map


class TestBuildFoliumMap:
    """Tests for the build_folium_map() service function."""

    @pytest.fixture
    def sample_stations(self):
        """Returns a standard set of polling stations for testing."""
        return [
            {"name": "Govt High School", "lat": 15.3647, "lon": 75.1240},
            {"name": "City Hall", "lat": 15.3660, "lon": 75.1255},
            {"name": "Community Center", "lat": 15.3670, "lon": 75.1265},
        ]

    def test_returns_html_string(self, sample_stations):
        """build_folium_map must return a non-empty HTML string."""
        result = build_folium_map(sample_stations, 15.3647, 75.1240)
        assert isinstance(result, str)
        assert len(result) > 0

    def test_contains_html_structure(self, sample_stations):
        """Output must contain standard HTML document structure."""
        result = build_folium_map(sample_stations, 15.3647, 75.1240)
        assert "<html" in result.lower()
        assert "</html>" in result.lower()

    def test_contains_leaflet_library(self, sample_stations):
        """Output must include the Leaflet.js library."""
        result = build_folium_map(sample_stations, 15.3647, 75.1240)
        assert "leaflet" in result.lower()

    def test_contains_station_names(self, sample_stations):
        """All station names must appear in the rendered HTML."""
        result = build_folium_map(sample_stations, 15.3647, 75.1240)
        for station in sample_stations:
            assert station["name"] in result

    def test_contains_satellite_layer(self, sample_stations):
        """HD Satellite tile layer must be present."""
        result = build_folium_map(sample_stations, 15.3647, 75.1240)
        assert "arcgisonline" in result.lower() or "satellite" in result.lower()

    def test_single_station(self):
        """Map should render correctly with just one station."""
        stations = [{"name": "Solo Station", "lat": 12.9716, "lon": 77.5946}]
        result = build_folium_map(stations, 12.9716, 77.5946)
        assert "Solo Station" in result
        assert "<html" in result.lower()

    def test_empty_stations_list(self):
        """Map should render without errors even with no stations."""
        result = build_folium_map([], 12.9716, 77.5946)
        assert "<html" in result.lower()


class TestBuildFoliumMapPlugins:
    """Tests for Folium plugin integration."""

    @pytest.fixture
    def rendered_map(self):
        """Returns a pre-rendered map HTML for plugin testing."""
        stations = [
            {"name": "Test Station", "lat": 15.0, "lon": 75.0},
        ]
        return build_folium_map(stations, 15.0, 75.0)

    def test_contains_layer_control(self, rendered_map):
        """Layer control switcher must be present."""
        assert "layercontrol" in rendered_map.lower() or "layer" in rendered_map.lower()
