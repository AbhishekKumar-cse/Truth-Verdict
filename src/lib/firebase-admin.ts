'use server';

import admin from 'firebase-admin';

// Check if the app is already initialized to prevent errors
if (!admin.apps.length) {
  admin.initializeApp({
    // Use applicationDefault to automatically use the service account credentials
    // provided by the Firebase App Hosting environment.
    credential: admin.credential.applicationDefault(),
  });
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
