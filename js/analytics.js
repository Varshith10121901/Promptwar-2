/**
 * VoteWise — Google Analytics Integration
 *
 * Lightweight Google Analytics 4 (gtag.js) wrapper.
 * Sends page views, custom events, and user engagement metrics
 * to Google Analytics for usage tracking and insights.
 *
 * This module works alongside the Firebase Analytics integration
 * but provides direct gtag.js access for fine-grained control.
 *
 * @module analytics
 * @version 2.1.0
 * @license MIT
 * @see https://developers.google.com/analytics/devguides/collection/ga4
 */

/* global gtag */

import { GA_MEASUREMENT_ID } from './constants.js';

/** @type {boolean} Whether analytics has been initialized */
let _gaInitialized = false;

/**
 * Initializes Google Analytics by injecting the gtag.js script.
 * Safe to call multiple times — only injects once.
 */
export function initGoogleAnalytics() {
  if (_gaInitialized) {return;}

  try {
    // Create and inject the gtag.js script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    // Initialize the dataLayer and gtag function
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID, {
      send_page_view: false, // We send page views manually
      cookie_flags: 'SameSite=None;Secure',
    });

    _gaInitialized = true;
    console.info('[Google Analytics] Initialized:', GA_MEASUREMENT_ID);
  } catch (err) {
    console.warn('[Google Analytics] Init failed:', err.message);
  }
}

/**
 * Tracks a page view in Google Analytics.
 *
 * @param {string} pagePath - The page path (e.g. '/quiz', '/dashboard').
 * @param {string} [pageTitle] - Optional page title.
 */
export function trackPageView(pagePath, pageTitle) {
  if (!_gaInitialized || typeof gtag === 'undefined') {return;}

  gtag('event', 'page_view', {
    page_path: pagePath,
    page_title: pageTitle || document.title,
  });
}

/**
 * Tracks a custom event in Google Analytics.
 *
 * @param {string} eventName - Event name (e.g. 'quiz_completed').
 * @param {Object} [params={}] - Optional event parameters.
 */
export function trackEvent(eventName, params = {}) {
  if (!_gaInitialized || typeof gtag === 'undefined') {return;}

  gtag('event', eventName, {
    ...params,
    event_category: params.category || 'engagement',
  });
}

/**
 * Tracks user engagement timing.
 *
 * @param {string} name - Timing metric name.
 * @param {number} value - Duration in milliseconds.
 */
export function trackTiming(name, value) {
  if (!_gaInitialized || typeof gtag === 'undefined') {return;}

  gtag('event', 'timing_complete', {
    name,
    value: Math.round(value),
    event_category: 'performance',
  });
}
