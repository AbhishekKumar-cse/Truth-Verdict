import admin from "firebase-admin";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const hasCredentials = process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY && process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

if (hasCredentials && !getApps().length) {
    try {
        const privateKey = process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n');

        initializeApp({
            credential: cert({
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: privateKey,
            }),
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        });
    } catch (error) {
        console.error("Firebase Admin initialization error:", error);
    }
} else if (process.env.NODE_ENV === 'development') {
    console.warn(
        "\n***********************************************************************\n" +
        "WARNING: Firebase Admin SDK credentials are not set in environment variables.\n" +
        "Server-side Firebase operations (like submitting a claim) will fail.\n" +
        "This is expected for local development if you haven't set up your .env.local file.\n" +
        "For production on Netlify, ensure all FIREBASE_* variables are set in the site settings.\n" +
        "***********************************************************************\n"
    );
}

const adminDb = getApps().length ? getFirestore() : null;

export { adminDb };
