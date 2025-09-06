import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  "projectId": "truth-lens-1",
  "appId": "1:755035155214:web:23ed09256e942f9d84055f",
  "storageBucket": "truth-lens-1.firebasestorage.app",
  "apiKey": "AIzaSyB3Xn2M1y-tlN2KQI_WUbPd89GlJfcA-9s",
  "authDomain": "truth-lens-1.firebaseapp.com",
  "messagingSenderId": "755035155214"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, googleProvider };
