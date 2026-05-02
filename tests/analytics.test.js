/**
 * @vitest-environment jsdom
 * Tests for the Analytics Module (js/analytics.js)
 */
import { describe, it, expect, beforeAll } from 'vitest';
import {
  initGoogleAnalytics,
  trackPageView,
  trackEvent,
  trackTiming,
} from '../js/analytics.js';

describe('Analytics Module', () => {
  // Initialize once — matches production singleton behavior
  beforeAll(() => {
    initGoogleAnalytics();
  });

  describe('initGoogleAnalytics()', () => {
    it('injects gtag script into the document head', () => {
      const scripts = document.head.querySelectorAll('script[src*="googletagmanager"]');
      expect(scripts.length).toBeGreaterThanOrEqual(1);
    });

    it('creates the dataLayer array', () => {
      expect(Array.isArray(window.dataLayer)).toBe(true);
    });

    it('creates the gtag function', () => {
      expect(typeof window.gtag).toBe('function');
    });
  });

  describe('trackPageView()', () => {
    it('does not throw when analytics is initialized', () => {
      expect(() => trackPageView('/test', 'Test Page')).not.toThrow();
    });

    it('pushes page_view data to dataLayer', () => {
      const before = window.dataLayer.length;
      trackPageView('/quiz', 'Quiz Page');
      expect(window.dataLayer.length).toBeGreaterThan(before);
    });
  });

  describe('trackEvent()', () => {
    it('pushes event data to the dataLayer', () => {
      const before = window.dataLayer.length;
      trackEvent('quiz_completed', { score: 5 });
      expect(window.dataLayer.length).toBeGreaterThan(before);
    });

    it('handles events without parameters', () => {
      expect(() => trackEvent('button_click')).not.toThrow();
    });
  });

  describe('trackTiming()', () => {
    it('logs timing metrics without throwing', () => {
      expect(() => trackTiming('page_load', 1234)).not.toThrow();
    });
  });
});
