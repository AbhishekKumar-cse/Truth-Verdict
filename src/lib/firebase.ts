import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "truth-lens-z6wwx.firebaseapp.com",
  projectId: "truth-lens-z6wwx",
  storageBucket: "truth-lens-z6wwx.appspot.com",
  messagingSenderId: "365383569427",
  appId: "1:365383569427:web:82156a31f284e320f785b9",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, googleProvider };
