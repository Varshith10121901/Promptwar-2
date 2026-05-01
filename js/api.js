/**
 * VoteWise API Module
 * Centralized place for all backend API calls.
 * Provides clean error handling and consistent request patterns.
 */

const API_BASE = 'http://localhost:8000';

/**
 * Calls the Gemini-powered backend to generate an HD election map
 * for the specified location.
 *
 * @param {string} location - The user's native city/place.
 * @returns {Promise<string>} - Resolves with the Folium map HTML string.
 * @throws {Error} - If the backend is unreachable or returns a non-OK status.
 */
export async function fetchElectionMap(location) {
  if (!location || typeof location !== 'string' || location.trim().length === 0) {
    throw new Error('Location must be a non-empty string.');
  }

  // Sanitize: trim whitespace and limit length to prevent prompt injection
  const sanitizedLocation = location.trim().slice(0, 100);

  const response = await fetch(`${API_BASE}/api/generate_map`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ location: sanitizedLocation })
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown server error');
    throw new Error(`Map generation failed (${response.status}): ${errorText}`);
  }

  return response.text();
}
