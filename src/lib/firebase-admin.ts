import admin from "firebase-admin";

function getServiceAccountFromEnv() {
  const sa = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!sa) {
    // In a local environment, we can fallback to the old method for convenience.
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

    if (!clientEmail || !privateKey || !projectId) {
      throw new Error("Missing Firebase admin credentials. Set FIREBASE_SERVICE_ACCOUNT or FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, and NEXT_PUBLIC_FIREBASE_PROJECT_ID.");
    }
    return {
      projectId,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, "\n")
    };
  }
  try {
    return JSON.parse(sa);
  } catch (err) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT must be valid JSON.");
  }
}

if (!admin.apps.length) {
  const serviceAccount = getServiceAccountFromEnv();
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
