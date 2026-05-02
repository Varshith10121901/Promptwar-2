/**
 * VoteWise — API Module
 *
 * Centralized, sanitized API communication layer.
 * All fetch calls to the Python FastAPI backend go through this module.
 * No raw `fetch()` calls should exist elsewhere in the codebase.
 *
 * Security:
 *   - Input sanitization with length cap
 *   - Prompt injection detection (defense-in-depth)
 *   - Structured error handling with user-friendly messages
 *
 * @module api
 * @version 2.1.0
 * @license MIT
 */

import { API_BASE_URL, MAX_LOCATION_LENGTH, BLOCKED_INJECTION_PHRASES } from './constants.js';

// ─── Private Helpers ──────────────────────────────────

/**
 * Generic fetch wrapper with structured error handling.
 * All API calls must go through this function.
 *
 * @param {string} endpoint - API endpoint path (e.g. '/api/generate_map').
 * @param {RequestInit} [options={}] - Standard Fetch API options.
 * @returns {Promise<Response>} The raw fetch Response object.
 * @throws {Error} On non-OK responses or network failures.
 */
async function fetchWithError(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  /** @type {Response} */
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
 * Applies three layers of defense:
 *   1. Type and emptiness validation
 *   2. Length truncation (100 chars max)
 *   3. Prompt injection pattern detection
 *
 * @param {string} location - Raw location input from the user.
 * @returns {string} Sanitized location string safe for API consumption.
 * @throws {Error} If input is empty, invalid, or contains injection patterns.
 */
function sanitizeLocation(location) {
  if (!location || typeof location !== 'string') {
    throw new Error('Location must be a non-empty string.');
  }

  const trimmed = location.trim().slice(0, MAX_LOCATION_LENGTH);
  if (trimmed.length === 0) {
    throw new Error('Location must be a non-empty string.');
  }

  // Defense-in-depth: block LLM prompt injection attempts
  const lowerInput = trimmed.toLowerCase();
  for (const phrase of BLOCKED_INJECTION_PHRASES) {
    if (lowerInput.includes(phrase)) {
      throw new Error('Invalid location input detected.');
    }
  }

  return trimmed;
}

// ─── Public API ───────────────────────────────────────

/**
 * Calls the Gemini-powered backend to generate an HD election map.
 * The backend uses Gemini 2.5 Flash to generate realistic polling stations,
 * then renders them on an interactive Folium/Leaflet map.
 *
 * @param {string} location - User's native city or place name.
 * @returns {Promise<string>} Resolves with the Folium map HTML string.
 * @throws {Error} If the backend is unreachable or input is invalid.
 *
 * @example
 *   const html = await fetchElectionMap('Bangalore, India');
 *   document.getElementById('mapFrame').srcdoc = html;
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
 * Checks the backend health status.
 * Used by monitoring, Docker healthchecks, and the dashboard.
 *
 * @returns {Promise<{status: string, service: string}>} Health response object.
 * @throws {Error} If the backend is unreachable.
 *
 * @example
 *   const health = await checkHealth();
 *   console.log(health.status); // 'ok'
 */
export async function checkHealth() {
  const response = await fetchWithError('/health', { method: 'GET' });
  return response.json();
}
