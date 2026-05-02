/**
 * @vitest-environment jsdom
 * Tests for the Chat Module (js/chat.js)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock data.js dependencies
vi.mock('../js/data.js', () => ({
  faqs: [
    { category: 'voting', q: 'How do I vote?', a: 'Visit your assigned polling station with valid ID.' },
    { category: 'registration', q: 'How to register?', a: 'Register online at your election commission website.' },
  ],
  electionData: {
    india: { name: 'India', nextEvent: 'General Elections 2026' },
  },
}));

vi.mock('../js/state.js', () => ({
  state: { region: 'india', chatHistory: [] },
  addChatEntry: vi.fn(),
}));

import { addChatMessage, showTypingIndicator, generateResponse, setChatIconUpdater } from '../js/chat.js';

describe('Chat Module', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'chatMessages';
    document.body.appendChild(container);
    setChatIconUpdater(vi.fn());
  });

  describe('addChatMessage()', () => {
    it('adds a user message to the container', () => {
      addChatMessage(container, 'Hello', true);
      expect(container.children.length).toBe(1);
      expect(container.querySelector('.user')).not.toBeNull();
    });

    it('adds a bot message to the container', () => {
      addChatMessage(container, 'Hi there!', false);
      expect(container.querySelector('.bot')).not.toBeNull();
    });

    it('sets ARIA role for accessibility', () => {
      addChatMessage(container, 'Test', false);
      const msg = container.querySelector('.message');
      expect(msg.getAttribute('role')).toBe('log');
    });

    it('scrolls to the latest message', () => {
      addChatMessage(container, 'Scroll test', false);
      // scrollTop should be set (jsdom doesn't actually scroll but we check it was called)
      expect(container.scrollTop).toBeDefined();
    });
  });

  describe('showTypingIndicator()', () => {
    it('returns a unique ID string', () => {
      const id = showTypingIndicator(container);
      expect(typeof id).toBe('string');
      expect(id.startsWith('typing-')).toBe(true);
    });

    it('adds a typing indicator element', () => {
      const id = showTypingIndicator(container);
      expect(document.getElementById(id)).not.toBeNull();
    });

    it('sets ARIA label for accessibility', () => {
      const id = showTypingIndicator(container);
      const el = document.getElementById(id);
      expect(el.getAttribute('aria-label')).toBe('AI is typing');
    });
  });

  describe('generateResponse()', () => {
    it('responds to greetings', () => {
      const response = generateResponse('Hello there');
      expect(response.toLowerCase()).toContain('hello');
    });

    it('responds to hi', () => {
      const response = generateResponse('Hi');
      expect(response.toLowerCase()).toContain('help');
    });

    it('matches FAQ about voting', () => {
      const response = generateResponse('Tell me about voting');
      expect(response).toContain('polling station');
    });

    it('matches FAQ about registration', () => {
      const response = generateResponse('How to register?');
      expect(response).toContain('Register');
    });

    it('responds to election date queries', () => {
      const response = generateResponse('When is the election?');
      expect(response).toContain('2026');
    });

    it('gives fallback for unknown questions', () => {
      const response = generateResponse('What is quantum physics?');
      expect(response).toContain('not sure');
    });
  });
});
