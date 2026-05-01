/**
 * @vitest-environment jsdom
 * API Module Tests — Mocks fetch to avoid real network calls.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchElectionMap } from '../js/api.js';

const MOCK_HTML = '<html><body>Map HTML</body></html>';

describe('API Module — fetchElectionMap()', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns HTML string on a successful request', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => MOCK_HTML,
    });

    const result = await fetchElectionMap('Bangalore');
    expect(result).toBe(MOCK_HTML);
  });

  it('sends POST request to the correct endpoint', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => MOCK_HTML,
    });

    await fetchElectionMap('Mumbai');
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/generate_map',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ location: 'Mumbai' }),
      })
    );
  });

  it('throws an error when response is not ok', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      text: async () => 'Service Unavailable',
    });

    await expect(fetchElectionMap('Hubli')).rejects.toThrow('Map generation failed (503)');
  });

  it('throws an error for empty location string', async () => {
    await expect(fetchElectionMap('')).rejects.toThrow('Location must be a non-empty string');
  });

  it('throws an error for null location', async () => {
    await expect(fetchElectionMap(null)).rejects.toThrow();
  });

  it('truncates location to 100 characters before sending', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => MOCK_HTML,
    });

    const longLocation = 'A'.repeat(200);
    await fetchElectionMap(longLocation);

    const sentBody = JSON.parse(fetch.mock.calls[0][1].body);
    expect(sentBody.location.length).toBeLessThanOrEqual(100);
  });
});
