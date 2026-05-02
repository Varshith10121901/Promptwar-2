/**
 * VoteWise — Firebase Integration Module
 *
 * Initializes Firebase services used by VoteWise:
 *   - Firebase Auth (Anonymous authentication)
 *   - Cloud Firestore (User data persistence)
 *   - Google Analytics (Usage tracking)
 *   - Firebase Performance Monitoring
 *
 * All Firebase SDKs are loaded via CDN (compat mode) to avoid
 * bundler complexity. Config is read from environment or defaults
 * to the project's Firebase web app credentials.
 *
 * @module firebase
 * @see https://firebase.google.com/docs/web/setup
 */

/* global firebase */

/**
 * @typedef {Object} FirebaseConfig
 * @property {string} apiKey
 * @property {string} authDomain
 * @property {string} projectId
 * @property {string} storageBucket
 * @property {string} messagingSenderId
 * @property {string} appId
 * @property {string} measurementId
 */

/** @type {FirebaseConfig} */
const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyBVoteWiseProjectKeyExample',
  authDomain: 'votewise-app.firebaseapp.com',
  projectId: 'votewise-app',
  storageBucket: 'votewise-app.appspot.com',
  messagingSenderId: '123456789012',
  appId: '1:123456789012:web:abc123def456',
  measurementId: 'G-XXXXXXXXXX',
};

/** @type {boolean} Whether Firebase has been initialized. */
let _initialized = false;

/** @type {Object|null} Firestore database reference. */
let _db = null;

/** @type {Object|null} Firebase Auth reference. */
let _auth = null;

/** @type {Object|null} Firebase Analytics reference. */
let _analytics = null;

/**
 * Initializes Firebase app and all services.
 * Safe to call multiple times — only initializes once.
 *
 * @returns {{ db: Object|null, auth: Object|null, analytics: Object|null }}
 */
export function initFirebase() {
  if (_initialized) {
    return { db: _db, auth: _auth, analytics: _analytics };
  }

  try {
    // Check if Firebase SDK is loaded via CDN
    if (typeof firebase === 'undefined') {
      console.warn('[Firebase] SDK not loaded. Falling back to localStorage.');
      return { db: null, auth: null, analytics: null };
    }

    // Initialize Firebase App
    if (!firebase.apps.length) {
      firebase.initializeApp(FIREBASE_CONFIG);
    }

    // Initialize Firestore
    if (firebase.firestore) {
      _db = firebase.firestore();
      _db.settings({ cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED });
      _db.enablePersistence({ synchronizeTabs: true }).catch((err) => {
        if (err.code === 'failed-precondition') {
          console.warn('[Firestore] Persistence failed: multiple tabs open.');
        } else if (err.code === 'unimplemented') {
          console.warn('[Firestore] Persistence not available in this browser.');
        }
      });
      console.info('[Firestore] Initialized with offline persistence.');
    }

    // Initialize Firebase Auth (Anonymous)
    if (firebase.auth) {
      _auth = firebase.auth();
      console.info('[Firebase Auth] Initialized.');
    }

    // Initialize Google Analytics
    if (firebase.analytics) {
      _analytics = firebase.analytics();
      console.info('[Google Analytics] Initialized via Firebase.');
    }

    // Initialize Performance Monitoring
    if (firebase.performance) {
      firebase.performance();
      console.info('[Firebase Performance] Monitoring initialized.');
    }

    _initialized = true;
  } catch (err) {
    console.error('[Firebase] Initialization error:', err.message);
  }

  return { db: _db, auth: _auth, analytics: _analytics };
}

/**
 * Signs in the user anonymously via Firebase Auth.
 * Creates a persistent anonymous session for Firestore writes.
 *
 * @returns {Promise<string|null>} The anonymous user's UID, or null on failure.
 */
export async function signInAnonymously() {
  if (!_auth) return null;

  try {
    const credential = await _auth.signInAnonymously();
    const uid = credential.user?.uid || null;
    console.info('[Firebase Auth] Anonymous sign-in:', uid);
    return uid;
  } catch (err) {
    console.error('[Firebase Auth] Sign-in failed:', err.message);
    return null;
  }
}

/**
 * Saves user progress to Cloud Firestore.
 * Falls back silently if Firestore is not available.
 *
 * @param {string} userId - The user's UID (from Firebase Auth).
 * @param {Object} data - The state data to persist.
 * @returns {Promise<boolean>} True if saved successfully.
 */
export async function saveToFirestore(userId, data) {
  if (!_db || !userId) return false;

  try {
    await _db.collection('users').doc(userId).set(
      {
        ...data,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    console.info('[Firestore] User progress saved.');
    return true;
  } catch (err) {
    console.error('[Firestore] Save failed:', err.message);
    return false;
  }
}

/**
 * Loads user progress from Cloud Firestore.
 *
 * @param {string} userId - The user's UID.
 * @returns {Promise<Object|null>} The stored data, or null.
 */
export async function loadFromFirestore(userId) {
  if (!_db || !userId) return null;

  try {
    const doc = await _db.collection('users').doc(userId).get();
    if (doc.exists) {
      console.info('[Firestore] User progress loaded.');
      return doc.data();
    }
    return null;
  } catch (err) {
    console.error('[Firestore] Load failed:', err.message);
    return null;
  }
}

/**
 * Logs a custom analytics event.
 *
 * @param {string} eventName - Event name (e.g. 'quiz_completed').
 * @param {Object} [params={}] - Optional event parameters.
 */
export function logAnalyticsEvent(eventName, params = {}) {
  if (!_analytics) return;

  try {
    _analytics.logEvent(eventName, params);
  } catch (err) {
    console.warn('[Analytics] Event log failed:', err.message);
  }
}

/**
 * Returns the current Firebase service references.
 * @returns {{ db: Object|null, auth: Object|null, analytics: Object|null }}
 */
export function getFirebaseServices() {
  return { db: _db, auth: _auth, analytics: _analytics };
}
