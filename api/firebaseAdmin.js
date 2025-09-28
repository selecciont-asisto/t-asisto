import admin from 'firebase-admin';

// Check if the app is already initialized to prevent errors
if (!admin.apps.length) {
  try {
    // 1. Read the Base64 encoded string from Vercel's environment variables
    const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

    if (!serviceAccountBase64) {
      throw new Error('Firebase service account key is not set in environment variables.');
    }

    // 2. Decode the Base64 string back to the original JSON string
    const serviceAccountJson = Buffer.from(serviceAccountBase64, 'base64').toString('utf8');
    
    // 3. Parse the JSON string into a JavaScript object
    const serviceAccount = JSON.parse(serviceAccountJson);

    // 4. Initialize the Firebase Admin SDK with the decoded credentials
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });

    console.log("Firebase Admin SDK initialized successfully.");

  } catch (error) {
    console.error("Error initializing Firebase Admin SDK:", error);
    // Exit the process if Firebase Admin fails to initialize,
    // as it's critical for the backend functions.
    process.exit(1);
  }
}

// Export the initialized admin instance for use in other API routes
export default admin;

