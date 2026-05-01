/**
 * VoteWise — API Module
 *
 * Centralized, sanitized API calls to the Python FastAPI backend.
 * All fetch logic lives here — no raw fetch() calls elsewhere in the app.
 */

const API_BASE = 'http://localhost:8000';

/**
 * Generic fetch wrapper with error handling and input sanitization.
 * @param {string} endpoint - API endpoint path (e.g. '/api/generate_map').
 * @param {Object} options - Fetch options (method, body, etc.).
 * @returns {Promise<Response>} - The raw fetch Response object.
 * @throws {Error} - On non-OK responses or network failures.
 */
async function fetchWithError(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown server error');
    throw new Error(`API Error (${response.status}): ${errorText}`);
  }

  return response;
}

/**
 * Sanitizes a location string before sending to the backend.
 * Trims whitespace, caps length, and blocks prompt injection phrases.
 *
 * @param {string} location - Raw location input from the user.
 * @returns {string} - Sanitized location string.
 * @throws {Error} - If the location is empty or contains injection patterns.
 */
function sanitizeLocation(location) {
  if (!location || typeof location !== 'string') {
    throw new Error('Location must be a non-empty string.');
  }

  const trimmed = location.trim().slice(0, 100);
  if (trimmed.length === 0) {
    throw new Error('Location must be a non-empty string.');
  }

  // Client-side prompt injection guard (defense-in-depth)
  const blocked = ['ignore previous', 'forget', 'system:', 'assistant:', 'you are now'];
  for (const phrase of blocked) {
    if (trimmed.toLowerCase().includes(phrase)) {
      throw new Error('Invalid location input detected.');
    }
  }

  return trimmed;
}

/**
 * Calls the Gemini-powered backend to generate an HD election map.
 *
 * @param {string} location - User's native city/place.
 * @returns {Promise<string>} - Resolves with the Folium map HTML.
 * @throws {Error} - If backend is unreachable or input is invalid.
 */
export async function fetchElectionMap(location) {
  const sanitized = sanitizeLocation(location);

  const response = await fetchWithError('/api/generate_map', {
    method: 'POST',
    body: JSON.stringify({ location: sanitized }),
  });

  return response.text();
}

/**
 * Checks backend health.
 * @returns {Promise<Object>} - { status: 'ok', service: '...' }
 */
export async function checkHealth() {
  const response = await fetchWithError('/health', { method: 'GET' });
  return response.json();
}
