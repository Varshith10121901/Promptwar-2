"""
Shared pytest fixtures for VoteWise backend tests.
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from main import app


@pytest.fixture
def client():
    """FastAPI test client."""
    return TestClient(app)


@pytest.fixture
def mock_gemini_stations():
    """Returns a valid list of mock polling station dicts."""
    return [
        {"name": "Govt High School, Hubli", "lat": 15.3647, "lon": 75.1240},
        {"name": "City Municipal Hall", "lat": 15.3660, "lon": 75.1255},
        {"name": "Dharwad Community Center", "lat": 15.3670, "lon": 75.1265},
        {"name": "Vidyanagar Public School", "lat": 15.3680, "lon": 75.1275},
        {"name": "Keshwapur Ward Office", "lat": 15.3690, "lon": 75.1285},
    ]


@pytest.fixture
def mock_gemini_response(mock_gemini_stations):
    """Mocks the google.generativeai model to return a clean JSON response."""
    import json
    mock_response = MagicMock()
    mock_response.text = json.dumps(mock_gemini_stations)

    mock_model = MagicMock()
    mock_model.generate_content.return_value = mock_response

    with patch("main.genai.GenerativeModel", return_value=mock_model):
        yield mock_model
