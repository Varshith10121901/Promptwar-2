/**
 * VoteWise Cloud Functions
 *
 * Serverless endpoints deployed to Google Cloud Functions (Firebase).
 * Provides Gemini AI-powered features that run server-side.
 *
 * Functions:
 *   1. generateVotingSummary — Personalized voting readiness report
 *   2. onUserCreated — Firestore trigger for new user setup
 *
 * @module functions
 * @see https://firebase.google.com/docs/functions
 */

const { onRequest } = require('firebase-functions/v2/https');
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Firebase Admin
initializeApp();
const db = getFirestore();

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
 * @param {Object} req - HTTP request with { uid: string } body.
 * @param {Object} res - HTTP response with the generated summary.
 */
exports.generateVotingSummary = onRequest(
  { cors: true, region: 'us-central1' },
  async (req, res) => {
    try {
      const { uid } = req.body;

      if (!uid || typeof uid !== 'string') {
        res.status(400).json({ error: 'Missing or invalid uid.' });
        return;
      }

      // Load user data from Firestore
      const userDoc = await db.collection('users').doc(uid).get();
      const quizDoc = await db
        .collection('users').doc(uid)
        .collection('progress').doc('quiz')
        .get();
      const wizardDoc = await db
        .collection('users').doc(uid)
        .collection('progress').doc('wizard')
        .get();

      const userData = userDoc.exists ? userDoc.data() : {};
      const quizData = quizDoc.exists ? quizDoc.data() : { bestScore: 0 };
      const wizardData = wizardDoc.exists ? wizardDoc.data() : { steps: {} };

      // Count completed wizard steps
      const completedSteps = Object.values(wizardData.steps || {})
        .filter(Boolean).length;
      const totalSteps = Object.keys(wizardData.steps || {}).length || 5;

      // Build Gemini prompt
      const prompt = `You are a friendly election readiness advisor.
A voter named "${userData.displayName || 'Citizen'}" from "${userData.location || 'India'}" has:
- Quiz score: ${quizData.bestScore || 0}/5
- Voting preparation: ${completedSteps}/${totalSteps} steps completed

Generate a personalized 3-paragraph voting readiness summary:
1. Their current readiness level (Beginner/Prepared/Expert)
2. What they've done well
3. Specific next steps they should take before election day

Keep it encouraging, actionable, and under 200 words.`;

      // Call Gemini AI
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        res.status(500).json({ error: 'Gemini API key not configured.' });
        return;
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const result = await model.generateContent(prompt);
      const summary = result.response.text();

      // Save summary to Firestore
      await db.collection('users').doc(uid)
        .collection('progress').doc('summary')
        .set({
          text: summary,
          generatedAt: new Date(),
        });

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

/**
 * Firestore trigger: runs when a new user document is created.
 * Sets up default progress documents for the user.
 *
 * @name onUserCreated
 * @type {FirestoreFunction}
 */
exports.onUserCreated = onDocumentCreated(
  'users/{userId}',
  async (event) => {
    const userId = event.params.userId;

    try {
      const progressRef = db
        .collection('users').doc(userId)
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
      console.error('[onUserCreated] Error:', error);
    }
  }
);
