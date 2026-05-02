/**
 * VoteWise — Firebase Integration Module
 *
 * Full Google Cloud integration providing:
 *   - Firebase Auth (Google Sign-In + Anonymous fallback)
 *   - Cloud Firestore (User profile, quiz scores, wizard progress)
 *   - Google Analytics (Usage tracking via Firebase)
 *   - Firebase Performance Monitoring (Web Vitals)
 *
 * All Firebase SDKs are loaded via CDN (compat mode).
 *
 * @module firebase
 * @version 2.1.0
 * @license MIT
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

/**
 * @typedef {Object} UserProfile
 * @property {string} uid - Firebase Auth UID
 * @property {string} displayName - User's display name
 * @property {string} email - User's email
 * @property {string} [photoURL] - Profile photo URL
 * @property {string} [location] - User's native location
 * @property {string} provider - Auth provider ('google' | 'anonymous' | 'form')
 */

/**
 * @typedef {Object} UserProgress
 * @property {number} quizScore - Best quiz score
 * @property {Object} wizardProgress - Wizard step completion map
 * @property {string} region - Selected region
 * @property {Array} chatHistory - Chat interaction log
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

/** @type {boolean} */
let _initialized = false;

/** @type {Object|null} Firestore database reference */
let _db = null;

/** @type {Object|null} Firebase Auth reference */
let _auth = null;

/** @type {Object|null} Firebase Analytics reference */
let _analytics = null;

/** @type {string|null} Current user UID */
let _currentUid = null;

// ─────────────────────────────────────────────
// INITIALIZATION
// ─────────────────────────────────────────────

/**
 * Initializes all Firebase services.
 * Safe to call multiple times — only initializes once.
 *
 * @returns {{ db: Object|null, auth: Object|null, analytics: Object|null }}
 */
export function initFirebase() {
  if (_initialized) {
    return { db: _db, auth: _auth, analytics: _analytics };
  }

  try {
    if (typeof firebase === 'undefined') {
      console.warn('[Firebase] SDK not loaded. Using localStorage fallback.');
      return { db: null, auth: null, analytics: null };
    }

    if (!firebase.apps.length) {
      firebase.initializeApp(FIREBASE_CONFIG);
    }

    // Cloud Firestore with offline persistence
    if (firebase.firestore) {
      _db = firebase.firestore();
      _db.settings({ cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED });
      _db.enablePersistence({ synchronizeTabs: true }).catch((err) => {
        if (err.code === 'failed-precondition') {
          console.warn('[Firestore] Multi-tab persistence unavailable.');
        } else if (err.code === 'unimplemented') {
          console.warn('[Firestore] Persistence not supported.');
        }
      });
      console.info('[Firestore] Initialized with offline persistence.');
    }

    // Firebase Auth
    if (firebase.auth) {
      _auth = firebase.auth();
      console.info('[Firebase Auth] Initialized.');
    }

    // Google Analytics
    if (firebase.analytics) {
      _analytics = firebase.analytics();
      console.info('[Google Analytics] Initialized via Firebase.');
    }

    // Performance Monitoring
    if (firebase.performance) {
      firebase.performance();
      console.info('[Firebase Performance] Monitoring active.');
    }

    _initialized = true;
  } catch (err) {
    console.error('[Firebase] Init error:', err.message);
  }

  return { db: _db, auth: _auth, analytics: _analytics };
}

// ─────────────────────────────────────────────
// AUTHENTICATION
// ─────────────────────────────────────────────

/**
 * Signs in the user with Google Sign-In (popup).
 * This is the preferred auth method for full user profile.
 *
 * @returns {Promise<UserProfile|null>} User profile or null on failure.
 */
export async function signInWithGoogle() {
  if (!_auth) { return null; }

  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');

    const result = await _auth.signInWithPopup(provider);
    const user = result.user;
    _currentUid = user.uid;

    /** @type {UserProfile} */
    const profile = {
      uid: user.uid,
      displayName: user.displayName || 'Voter',
      email: user.email || '',
      photoURL: user.photoURL || '',
      provider: 'google',
    };

    // Save profile to Firestore
    await saveUserProfile(profile);

    console.info('[Firebase Auth] Google sign-in:', user.uid);
    return profile;
  } catch (err) {
    console.error('[Firebase Auth] Google sign-in failed:', err.message);
    return null;
  }
}

/**
 * Signs in anonymously as a fallback.
 *
 * @returns {Promise<string|null>} The anonymous UID or null.
 */
export async function signInAnonymously() {
  if (!_auth) { return null; }

  try {
    const credential = await _auth.signInAnonymously();
    _currentUid = credential.user?.uid || null;
    console.info('[Firebase Auth] Anonymous sign-in:', _currentUid);
    return _currentUid;
  } catch (err) {
    console.error('[Firebase Auth] Anonymous sign-in failed:', err.message);
    return null;
  }
}

/**
 * Signs out the current user.
 *
 * @returns {Promise<void>}
 */
export async function signOut() {
  if (!_auth) { return; }

  try {
    await _auth.signOut();
    _currentUid = null;
    console.info('[Firebase Auth] Signed out.');
  } catch (err) {
    console.error('[Firebase Auth] Sign-out failed:', err.message);
  }
}

/**
 * Returns the currently signed-in user's UID.
 *
 * @returns {string|null}
 */
export function getCurrentUid() {
  return _currentUid;
}

/**
 * Listens for auth state changes.
 *
 * @param {Function} callback - Called with (user) on auth state change.
 * @returns {Function|null} Unsubscribe function, or null.
 */
export function onAuthStateChanged(callback) {
  if (!_auth) { return null; }
  return _auth.onAuthStateChanged(callback);
}

// ─────────────────────────────────────────────
// FIRESTORE: USER PROFILE
// ─────────────────────────────────────────────

/**
 * Saves or updates a user profile in Firestore.
 *
 * @param {UserProfile} profile - The user profile to persist.
 * @returns {Promise<boolean>} True if saved successfully.
 */
export async function saveUserProfile(profile) {
  if (!_db || !profile?.uid) { return false; }

  try {
    await _db.collection('users').doc(profile.uid).set(
      {
        displayName: profile.displayName,
        email: profile.email,
        photoURL: profile.photoURL || '',
        location: profile.location || '',
        provider: profile.provider,
        lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    console.info('[Firestore] User profile saved.');
    return true;
  } catch (err) {
    console.error('[Firestore] Profile save failed:', err.message);
    return false;
  }
}

// ─────────────────────────────────────────────
// FIRESTORE: QUIZ SCORES
// ─────────────────────────────────────────────

/**
 * Saves a quiz score to Firestore (only if higher than existing).
 *
 * @param {string} uid - User's UID.
 * @param {number} score - The quiz score to save.
 * @returns {Promise<boolean>} True if saved.
 */
export async function saveQuizScoreToFirestore(uid, score) {
  if (!_db || !uid) { return false; }

  try {
    const ref = _db.collection('users').doc(uid).collection('progress').doc('quiz');
    const doc = await ref.get();
    const existing = doc.exists ? (doc.data().bestScore || 0) : 0;

    if (score > existing) {
      await ref.set({
        bestScore: score,
        lastAttempt: firebase.firestore.FieldValue.serverTimestamp(),
        attempts: firebase.firestore.FieldValue.increment(1),
      }, { merge: true });
      console.info('[Firestore] Quiz score saved:', score);
    }
    return true;
  } catch (err) {
    console.error('[Firestore] Quiz score save failed:', err.message);
    return false;
  }
}

// ─────────────────────────────────────────────
// FIRESTORE: WIZARD PROGRESS
// ─────────────────────────────────────────────

/**
 * Saves wizard progress to Firestore.
 *
 * @param {string} uid - User's UID.
 * @param {Object} progress - Wizard step completion map.
 * @returns {Promise<boolean>} True if saved.
 */
export async function saveWizardProgressToFirestore(uid, progress) {
  if (!_db || !uid) { return false; }

  try {
    await _db.collection('users').doc(uid).collection('progress').doc('wizard').set(
      {
        steps: progress,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    console.info('[Firestore] Wizard progress saved.');
    return true;
  } catch (err) {
    console.error('[Firestore] Wizard save failed:', err.message);
    return false;
  }
}

// ─────────────────────────────────────────────
// FIRESTORE: FULL PROGRESS LOAD
// ─────────────────────────────────────────────

/**
 * Loads all user progress data from Firestore.
 *
 * @param {string} uid - User's UID.
 * @returns {Promise<UserProgress|null>} Progress data or null.
 */
export async function loadUserProgress(uid) {
  if (!_db || !uid) { return null; }

  try {
    const progressRef = _db.collection('users').doc(uid).collection('progress');

    const [quizDoc, wizardDoc] = await Promise.all([
      progressRef.doc('quiz').get(),
      progressRef.doc('wizard').get(),
    ]);

    /** @type {UserProgress} */
    const progress = {
      quizScore: quizDoc.exists ? (quizDoc.data().bestScore || 0) : 0,
      wizardProgress: wizardDoc.exists ? (wizardDoc.data().steps || {}) : {},
    };

    console.info('[Firestore] User progress loaded.');
    return progress;
  } catch (err) {
    console.error('[Firestore] Progress load failed:', err.message);
    return null;
  }
}

/**
 * Saves complete user state to Firestore (generic).
 *
 * @param {string} uid - User's UID.
 * @param {Object} data - State data to persist.
 * @returns {Promise<boolean>} True if saved.
 */
export async function saveToFirestore(uid, data) {
  if (!_db || !uid) { return false; }

  try {
    await _db.collection('users').doc(uid).set(
      {
        ...data,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    return true;
  } catch (err) {
    console.error('[Firestore] Save failed:', err.message);
    return false;
  }
}

/**
 * Loads user data from Firestore.
 *
 * @param {string} uid - User's UID.
 * @returns {Promise<Object|null>} Stored data or null.
 */
export async function loadFromFirestore(uid) {
  if (!_db || !uid) { return null; }

  try {
    const doc = await _db.collection('users').doc(uid).get();
    return doc.exists ? doc.data() : null;
  } catch (err) {
    console.error('[Firestore] Load failed:', err.message);
    return null;
  }
}

// ─────────────────────────────────────────────
// ANALYTICS
// ─────────────────────────────────────────────

/**
 * Logs a custom analytics event via Firebase Analytics.
 *
 * @param {string} eventName - Event name (e.g. 'quiz_completed').
 * @param {Object} [params={}] - Optional event parameters.
 */
export function logAnalyticsEvent(eventName, params = {}) {
  if (!_analytics) { return; }

  try {
    _analytics.logEvent(eventName, params);
  } catch (err) {
    console.warn('[Analytics] Event log failed:', err.message);
  }
}

/**
 * Returns the current Firebase service references.
 *
 * @returns {{ db: Object|null, auth: Object|null, analytics: Object|null }}
 */
export function getFirebaseServices() {
  return { db: _db, auth: _auth, analytics: _analytics };
}
