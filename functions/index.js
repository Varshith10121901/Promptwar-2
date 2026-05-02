/**
 * VoteWise Cloud Functions (v2.1.0)
 *
 * Serverless endpoints deployed to Google Cloud Functions (Firebase).
 * Provides Gemini AI-powered features that run server-side.
 *
 * Functions:
 *   1. generateVotingSummary — Personalized voting readiness report via Gemini 2.5 Flash
 *   2. onUserCreated — Firestore trigger for new user default document setup
 *
 * Architecture:
 *   - Firebase Functions v2 (2nd gen, Cloud Run-backed)
 *   - Firebase Admin SDK for Firestore access
 *   - Google Generative AI SDK for Gemini integration
 *
 * @module functions
 * @version 2.1.0
 * @license MIT
 * @see https://firebase.google.com/docs/functions
 */

const { onRequest } = require('firebase-functions/v2/https');
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// ─── Constants ────────────────────────────────────────

/** @type {string} Gemini model identifier */
const GEMINI_MODEL = 'gemini-2.5-flash';

/** @type {number} Maximum summary length in words */
const MAX_SUMMARY_WORDS = 200;

/** @type {number} Default total wizard steps */
const DEFAULT_TOTAL_STEPS = 5;

/** @type {string} Cloud Function deployment region */
const DEPLOY_REGION = 'us-central1';

// ─── Firebase Init ────────────────────────────────────

initializeApp();

/** @type {FirebaseFirestore.Firestore} Firestore database reference */
const db = getFirestore();

// ─── Helper Functions ─────────────────────────────────

/**
 * Safely reads a Firestore document and returns its data or a fallback.
 *
 * @param {FirebaseFirestore.DocumentReference} docRef - Firestore document reference.
 * @param {Object} fallback - Default value if document doesn't exist.
 * @returns {Promise<Object>} Document data or fallback.
 */
async function safeDocRead(docRef, fallback = {}) {
  const snap = await docRef.get();
  return snap.exists ? snap.data() : fallback;
}

/**
 * Builds the Gemini prompt for voting readiness summary generation.
 *
 * @param {string} displayName - User's display name.
 * @param {string} location - User's location/region.
 * @param {number} quizScore - User's best quiz score.
 * @param {number} completedSteps - Number of wizard steps completed.
 * @param {number} totalSteps - Total wizard steps available.
 * @returns {string} Formatted prompt string for Gemini.
 */
function buildSummaryPrompt(displayName, location, quizScore, completedSteps, totalSteps) {
  return `You are a friendly election readiness advisor.
A voter named "${displayName}" from "${location}" has:
- Quiz score: ${quizScore}/5
- Voting preparation: ${completedSteps}/${totalSteps} steps completed

Generate a personalized 3-paragraph voting readiness summary:
1. Their current readiness level (Beginner/Prepared/Expert)
2. What they've done well
3. Specific next steps they should take before election day

Keep it encouraging, actionable, and under ${MAX_SUMMARY_WORDS} words.`;
}

// ─── Cloud Function: generateVotingSummary ────────────

/**
 * Generates a personalized voting readiness summary using Gemini AI.
 *
 * Reads the user's quiz scores, wizard progress, and region from
 * Firestore, then uses Gemini 2.5 Flash to create a tailored report
 * with actionable recommendations.
 *
 * @name generateVotingSummary
 * @type {HttpsFunction}
 *
 * @param {Object} req - HTTP request with JSON body `{ uid: string }`.
 * @param {Object} res - HTTP response with the generated summary.
 *
 * @example
 *   POST /generateVotingSummary
 *   Body: { "uid": "firebase-user-id-123" }
 *
 *   Response: {
 *     "summary": "...",
 *     "readiness": { "quizScore": 4, "wizardComplete": 3, "wizardTotal": 5 }
 *   }
 */
exports.generateVotingSummary = onRequest(
  { cors: true, region: DEPLOY_REGION },
  async (req, res) => {
    try {
      // ─── Input Validation ─────────────────
      const { uid } = req.body;

      if (!uid || typeof uid !== 'string') {
        res.status(400).json({ error: 'Missing or invalid uid.' });
        return;
      }

      // ─── Firestore Data Fetch ─────────────
      const userRef = db.collection('users').doc(uid);
      const progressRef = userRef.collection('progress');

      const [userData, quizData, wizardData] = await Promise.all([
        safeDocRead(userRef, {}),
        safeDocRead(progressRef.doc('quiz'), { bestScore: 0 }),
        safeDocRead(progressRef.doc('wizard'), { steps: {} }),
      ]);

      // ─── Compute Readiness Metrics ────────
      const completedSteps = Object.values(wizardData.steps || {}).filter(Boolean).length;
      const totalSteps = Object.keys(wizardData.steps || {}).length || DEFAULT_TOTAL_STEPS;

      // ─── Gemini AI Generation ─────────────
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        res.status(500).json({ error: 'Gemini API key not configured.' });
        return;
      }

      const prompt = buildSummaryPrompt(
        userData.displayName || 'Citizen',
        userData.location || 'India',
        quizData.bestScore || 0,
        completedSteps,
        totalSteps
      );

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
      const result = await model.generateContent(prompt);
      const summary = result.response.text();

      // ─── Persist Summary to Firestore ─────
      await progressRef.doc('summary').set({
        text: summary,
        generatedAt: new Date(),
      });

      // ─── Response ─────────────────────────
      res.status(200).json({
        summary,
        readiness: {
          quizScore: quizData.bestScore || 0,
          wizardComplete: completedSteps,
          wizardTotal: totalSteps,
        },
      });
    } catch (error) {
      console.error('[generateVotingSummary] Error:', error);
      res.status(500).json({ error: 'Failed to generate summary.' });
    }
  }
);

// ─── Cloud Function: onUserCreated ────────────────────

/**
 * Firestore trigger: runs when a new user document is created.
 * Initializes default progress documents (quiz + wizard) for the user.
 *
 * @name onUserCreated
 * @type {FirestoreFunction}
 *
 * @param {Object} event - Firestore document creation event.
 * @param {Object} event.params - Event parameters containing userId.
 */
exports.onUserCreated = onDocumentCreated(
  'users/{userId}',
  async (event) => {
    const userId = event.params.userId;

    try {
      const progressRef = db
        .collection('users')
        .doc(userId)
        .collection('progress');

      await Promise.all([
        progressRef.doc('quiz').set({
          bestScore: 0,
          attempts: 0,
          createdAt: new Date(),
        }),
        progressRef.doc('wizard').set({
          steps: {},
          createdAt: new Date(),
        }),
      ]);

      console.info(`[onUserCreated] Defaults set for: ${userId}`);
    } catch (error) {
      console.error(`[onUserCreated] Error for ${userId}:`, error);
    }
  }
);
