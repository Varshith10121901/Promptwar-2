/**
 * @vitest-environment jsdom
 * Tests for the Router Module (js/router.js)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Set up DOM mocks before importing
document.body.innerHTML = `
  <aside class="sidebar" id="sidebar">
    <nav class="sidebar-nav">
      <a href="#home" class="nav-item active" data-page="home">Home</a>
      <a href="#timeline" class="nav-item" data-page="timeline">Timeline</a>
      <a href="#login" class="nav-item" data-page="login">Login</a>
    </nav>
  </aside>
  <main id="mainContent">
    <section class="page active" id="homePage">Home</section>
    <section class="page" id="timelinePage">Timeline</section>
    <section class="page" id="loginPage">Login</section>
  </main>
`;

import { initRouter } from '../js/router.js';

describe('Router Module', () => {
  let mockAuthCheck;
  let mockOnPageLoad;

  beforeEach(() => {
    mockAuthCheck = vi.fn().mockReturnValue(false);
    mockOnPageLoad = vi.fn();
    window.location.hash = '';
  });

  describe('initRouter()', () => {
    it('initializes without throwing', () => {
      expect(() => initRouter(mockAuthCheck, mockOnPageLoad)).not.toThrow();
    });

    it('sets up hashchange listener', () => {
      const spy = vi.spyOn(window, 'addEventListener');
      initRouter(mockAuthCheck, mockOnPageLoad);
      expect(spy).toHaveBeenCalledWith('hashchange', expect.any(Function));
      spy.mockRestore();
    });
  });

  describe('Navigation', () => {
    it('calls onPageLoad when hash changes', () => {
      initRouter(mockAuthCheck, mockOnPageLoad);
      window.location.hash = '#timeline';
      window.dispatchEvent(new HashChangeEvent('hashchange'));
      expect(mockOnPageLoad).toHaveBeenCalled();
    });

    it('redirects to login when accessing protected pages unauthenticated', () => {
      mockAuthCheck.mockReturnValue(false);
      initRouter(mockAuthCheck, mockOnPageLoad);
      window.location.hash = '#dashboard';
      window.dispatchEvent(new HashChangeEvent('hashchange'));
      // Should redirect to login
      expect(window.location.hash).toContain('login');
    });
  });
});
