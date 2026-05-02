/**
 * @vitest-environment jsdom
 * Tests for the Firebase Module (js/firebase.js)
 */
import { describe, it, expect, vi, beforeAll } from 'vitest';

// Mock global firebase object
const mockFirestoreDoc = {
  set: vi.fn().mockResolvedValue(undefined),
  get: vi.fn().mockResolvedValue({ exists: false, data: () => ({}) }),
};

const mockFirestoreCollection = {
  doc: vi.fn().mockReturnValue(mockFirestoreDoc),
};

const mockFirestore = {
  settings: vi.fn(),
  enablePersistence: vi.fn().mockResolvedValue(undefined),
  collection: vi.fn().mockReturnValue(mockFirestoreCollection),
};

// Make the collection().doc().collection() chain work
mockFirestoreDoc.collection = vi.fn().mockReturnValue(mockFirestoreCollection);

const mockAuth = {
  signInAnonymously: vi.fn().mockResolvedValue({ user: { uid: 'anon-123' } }),
  signInWithPopup: vi.fn().mockResolvedValue({
    user: { uid: 'google-456', displayName: 'Test User', email: 'test@example.com', photoURL: '', isAnonymous: false },
  }),
  signOut: vi.fn().mockResolvedValue(undefined),
  onAuthStateChanged: vi.fn((cb) => { cb(null); return vi.fn(); }),
};

const mockAnalytics = { logEvent: vi.fn() };

global.firebase = {
  apps: [],
  initializeApp: vi.fn(),
  firestore: Object.assign(vi.fn().mockReturnValue(mockFirestore), {
    CACHE_SIZE_UNLIMITED: -1,
    FieldValue: { serverTimestamp: vi.fn(), increment: vi.fn() },
  }),
  auth: Object.assign(vi.fn().mockReturnValue(mockAuth), {
    GoogleAuthProvider: vi.fn().mockImplementation(() => ({
      addScope: vi.fn(),
    })),
  }),
  analytics: vi.fn().mockReturnValue(mockAnalytics),
  performance: vi.fn(),
};

import {
  initFirebase,
  signInWithGoogle,
  signInAnonymously,
  signOut,
  getCurrentUid,
  onAuthStateChanged,
  saveUserProfile,
  saveQuizScoreToFirestore,
  saveWizardProgressToFirestore,
  loadUserProgress,
  saveToFirestore,
  loadFromFirestore,
  logAnalyticsEvent,
  getFirebaseServices,
} from '../js/firebase.js';

describe('Firebase Module', () => {
  beforeAll(() => {
    initFirebase();
  });

  describe('initFirebase()', () => {
    it('returns service references', () => {
      const svc = initFirebase();
      expect(svc).toHaveProperty('db');
      expect(svc).toHaveProperty('auth');
      expect(svc).toHaveProperty('analytics');
    });

    it('initializes Firebase app', () => {
      expect(global.firebase.initializeApp).toHaveBeenCalled();
    });
  });

  describe('signInWithGoogle()', () => {
    it('returns a user profile on success', async () => {
      const profile = await signInWithGoogle();
      expect(profile).not.toBeNull();
      expect(profile.uid).toBe('google-456');
      expect(profile.provider).toBe('google');
    });
  });

  describe('signInAnonymously()', () => {
    it('returns a UID on success', async () => {
      const uid = await signInAnonymously();
      expect(uid).toBe('anon-123');
    });
  });

  describe('signOut()', () => {
    it('signs out without throwing', async () => {
      await expect(signOut()).resolves.not.toThrow();
    });
  });

  describe('getCurrentUid()', () => {
    it('returns a string uid after sign-in', () => {
      const uid = getCurrentUid();
      expect(typeof uid === 'string' || uid === null).toBe(true);
    });
  });

  describe('onAuthStateChanged()', () => {
    it('returns an unsubscribe function', () => {
      const unsub = onAuthStateChanged(vi.fn());
      expect(typeof unsub === 'function' || unsub === null).toBe(true);
    });
  });

  describe('Firestore: saveUserProfile()', () => {
    it('saves a profile and returns true', async () => {
      const result = await saveUserProfile({
        uid: 'test-uid',
        displayName: 'Test',
        email: 'test@test.com',
        provider: 'google',
      });
      expect(result).toBe(true);
    });

    it('returns false when profile is null', async () => {
      const result = await saveUserProfile(null);
      expect(result).toBe(false);
    });
  });

  describe('Firestore: saveQuizScoreToFirestore()', () => {
    it('saves a quiz score', async () => {
      const result = await saveQuizScoreToFirestore('test-uid', 5);
      expect(result).toBe(true);
    });

    it('returns false without uid', async () => {
      const result = await saveQuizScoreToFirestore(null, 5);
      expect(result).toBe(false);
    });
  });

  describe('Firestore: saveWizardProgressToFirestore()', () => {
    it('saves wizard progress', async () => {
      const result = await saveWizardProgressToFirestore('test-uid', { step1: true });
      expect(result).toBe(true);
    });
  });

  describe('Firestore: loadUserProgress()', () => {
    it('returns progress object', async () => {
      const result = await loadUserProgress('test-uid');
      expect(result).toHaveProperty('quizScore');
      expect(result).toHaveProperty('wizardProgress');
    });

    it('returns null without uid', async () => {
      const result = await loadUserProgress(null);
      expect(result).toBeNull();
    });
  });

  describe('Firestore: saveToFirestore()', () => {
    it('saves generic data', async () => {
      const result = await saveToFirestore('test-uid', { key: 'value' });
      expect(result).toBe(true);
    });
  });

  describe('Firestore: loadFromFirestore()', () => {
    it('returns null for non-existent user', async () => {
      const result = await loadFromFirestore('test-uid');
      // doc.exists is false in our mock
      expect(result).toBeNull();
    });
  });

  describe('logAnalyticsEvent()', () => {
    it('logs an event without throwing', () => {
      expect(() => logAnalyticsEvent('test_event', { k: 'v' })).not.toThrow();
    });
  });

  describe('getFirebaseServices()', () => {
    it('returns current references', () => {
      const svc = getFirebaseServices();
      expect(svc.db).not.toBeNull();
      expect(svc.auth).not.toBeNull();
    });
  });
});
