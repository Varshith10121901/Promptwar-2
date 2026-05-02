/**
 * VoteWise — Confetti Module Tests
 *
 * @module confetti.test
 * @version 2.1.0
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../js/constants.js', () => ({
  CONFETTI_PARTICLE_COUNT: 50,
}));

import { initConfetti } from '../js/confetti.js';

describe('Confetti Module', () => {
  let canvas;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    canvas.id = 'confettiCanvas';
    document.body.innerHTML = '';
    document.body.appendChild(canvas);
  });

  describe('initConfetti()', () => {
    it('returns an object with a fire method', () => {
      const confetti = initConfetti();
      expect(confetti).toBeDefined();
      expect(typeof confetti.fire).toBe('function');
    });

    it('fire() does not throw', () => {
      const confetti = initConfetti();
      expect(() => confetti.fire()).not.toThrow();
    });

    it('returns null-safe object when canvas is missing', () => {
      document.body.innerHTML = '';
      const confetti = initConfetti();
      // Should handle missing canvas gracefully
      expect(confetti).toBeDefined();
    });
  });
});
