/**
 * VoteWise — Confetti Animation Module
 *
 * Canvas-based confetti particle system for celebration effects.
 * Triggers on perfect quiz scores and pride badge interactions.
 *
 * @module confetti
 * @version 2.1.0
 * @license MIT
 */

import { CONFETTI_PARTICLE_COUNT } from './constants.js';

/**
 * @typedef {Object} Particle
 * @property {number} x - Horizontal position
 * @property {number} y - Vertical position
 * @property {number} r - Particle radius
 * @property {number} dx - Horizontal velocity
 * @property {number} dy - Vertical velocity
 * @property {string} color - Hex color string
 * @property {number} tilt - Tilt angle offset
 * @property {number} tiltAngle - Current tilt angle
 * @property {number} tiltAngleInc - Tilt angle increment per frame
 */

/** @type {string[]} Google brand colors used for confetti particles */
const COLORS = ['#1A73E8', '#34A853', '#FBBC05', '#EA4335', '#8AB4F8'];

/**
 * Initializes the confetti system on the `#confettiCanvas` element.
 * Returns a controller object with a `fire()` method.
 *
 * @returns {{ fire: Function }|undefined} Confetti controller, or undefined if canvas not found.
 *
 * @example
 *   const confetti = initConfetti();
 *   confetti?.fire(); // Triggers confetti burst
 */
export function initConfetti() {
  const canvas = document.getElementById('confettiCanvas');
  if (!canvas) {
    return { fire: () => {} };
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return { fire: () => {} };
  }

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  /** @type {Particle[]} */
  let particles = [];

  /** @type {number|null} Current animation frame ID */
  let animationId = null;

  /**
   * Creates a burst of confetti particles from the center-bottom.
   * @returns {void}
   */
  function createParticles() {
    for (let i = 0; i < CONFETTI_PARTICLE_COUNT; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2 + 100,
        r: Math.random() * 6 + 2,
        dx: Math.random() * 10 - 5,
        dy: Math.random() * -10 - 5,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        tilt: Math.random() * 10,
        tiltAngle: 0,
        tiltAngleInc: Math.random() * 0.07 + 0.05,
      });
    }
  }

  /**
   * Renders one animation frame and removes off-screen particles.
   * Automatically stops when all particles have left the viewport.
   * @returns {void}
   */
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p, index) => {
      p.tiltAngle += p.tiltAngleInc;
      p.y += (Math.cos(p.tiltAngle) + 1 + p.r / 2) / 2;
      p.x += Math.sin(p.tiltAngle) * 2;

      ctx.beginPath();
      ctx.lineWidth = p.r;
      ctx.strokeStyle = p.color;
      ctx.moveTo(p.x + p.tilt + p.r, p.y);
      ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r);
      ctx.stroke();

      if (p.y > canvas.height) {
        particles.splice(index, 1);
      }
    });

    if (particles.length > 0) {
      animationId = requestAnimationFrame(draw);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  // Responsive canvas sizing
  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });

  return {
    /**
     * Fires a confetti burst.
     * Cancels any existing animation before starting a new one.
     * @returns {void}
     */
    fire: () => {
      cancelAnimationFrame(animationId);
      particles = [];
      createParticles();
      draw();
    },
  };
}
