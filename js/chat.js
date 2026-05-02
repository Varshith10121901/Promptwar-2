/**
 * VoteWise — Chat Module
 *
 * Handles the AI chatbot UI: rendering messages, typing indicators,
 * FAQ matching, and integration with the Gemini-powered backend.
 *
 * @module chat
 */

import { faqs, electionData } from './data.js';
import { state, addChatEntry } from './state.js';

/**
 * Refreshes Lucide icons after dynamic DOM updates.
 * @type {Function}
 */
let _updateIcons = () => {};

/**
 * Sets the icon refresh callback.
 * @param {Function} fn - The lucide.createIcons wrapper.
 */
export function setChatIconUpdater(fn) {
  _updateIcons = fn;
}

/**
 * Appends a chat message bubble to the chat window.
 * @param {HTMLElement} container - The chat messages container.
 * @param {string} text - The message text (HTML-safe).
 * @param {boolean} [isUser=false] - Whether this is a user message.
 */
export function addChatMessage(container, text, isUser = false) {
  const div = document.createElement('div');
  div.className = `message ${isUser ? 'user' : 'bot'}`;
  div.setAttribute('role', 'log');
  div.setAttribute('aria-live', 'polite');
  div.innerHTML = `
    ${!isUser ? '<div class="message-avatar"><i data-lucide="bot"></i></div>' : '<div class="message-avatar"><i data-lucide="user"></i></div>'}
    <div class="message-content">${text}</div>
  `;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  _updateIcons();
}

/**
 * Shows a typing indicator in the chat and returns its unique ID.
 * @param {HTMLElement} container - The chat messages container.
 * @returns {string} The DOM ID of the typing indicator element.
 */
export function showTypingIndicator(container) {
  const id = 'typing-' + Date.now();
  const div = document.createElement('div');
  div.className = 'message bot';
  div.id = id;
  div.setAttribute('aria-label', 'AI is typing');
  div.innerHTML = `
    <div class="message-avatar"><i data-lucide="bot"></i></div>
    <div class="typing-indicator"><span></span><span></span><span></span></div>
  `;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  _updateIcons();
  return id;
}

/**
 * Processes a user question and generates a response using FAQ matching.
 * Falls back to a default "I don't know" message if no match is found.
 *
 * @param {string} question - The user's raw question text.
 * @returns {string} The bot's response text.
 */
export function generateResponse(question) {
  const lq = question.toLowerCase();

  // Greeting check
  if (lq.includes('hello') || lq.includes('hi')) {
    return 'Hello! How can I help you prepare for the upcoming elections?';
  }

  // Election date query
  if (lq.includes('when') && lq.includes('election')) {
    const regionData = electionData[state.region];
    if (regionData) {
      return `Based on your region (${regionData.name}), the next event is ${regionData.nextEvent}.`;
    }
  }

  // FAQ matching
  const matchedFaq = faqs.find(
    (f) => lq.includes(f.category) || lq.includes(f.q.toLowerCase().split(' ')[1])
  );
  if (matchedFaq) return matchedFaq.a;

  return "I'm not sure about that. I recommend checking your local election authority's official website.";
}

/**
 * Initializes the full chat module: binds send button, enter key, and suggestion chips.
 * @param {HTMLInputElement} inputEl - The chat input element.
 * @param {HTMLElement} messagesEl - The chat messages container.
 */
export function initChat(inputEl, messagesEl) {
  if (!inputEl || !messagesEl) return;

  /**
   * Handles a user chat submission.
   * @param {string} q - The user's question text.
   */
  function handleChat(q) {
    if (!q.trim()) return;
    addChatMessage(messagesEl, q, true);
    inputEl.value = '';

    const typingId = showTypingIndicator(messagesEl);

    setTimeout(() => {
      document.getElementById(typingId)?.remove();
      const response = generateResponse(q);
      addChatMessage(messagesEl, response, false);
      addChatEntry(q, response);
    }, 1200);
  }

  document.getElementById('chatSend')?.addEventListener('click', () => handleChat(inputEl.value));
  inputEl.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleChat(inputEl.value);
  });
  document.querySelectorAll('.suggestion-chip').forEach((chip) => {
    chip.addEventListener('click', () => handleChat(chip.textContent));
  });
}
