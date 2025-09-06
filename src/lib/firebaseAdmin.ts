import admin from "firebase-admin";
import { getApps, initializeApp, cert, App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const hasCredentials = !!(process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY && process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);

let app: App;

if (getApps().length === 0 && hasCredentials) {
    app = initializeApp({
        credential: cert({
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
        }),
    });
} else if (getApps().length > 0) {
    app = getApps()[0];
} else {
    if (process.env.NODE_ENV !== 'test') {
        console.warn(
            "Firebase Admin SDK credentials are not set. Server-side operations will fail."
        );
    }
}

const adminDB = app! ? getFirestore(app) : null;

export { adminDB };
