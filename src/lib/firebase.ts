import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

// Support both Vite (import.meta.env.VITE_*) and Next.js / Netlify (NEXT_PUBLIC_*)
// with fallback to the configured project electromart-be5a0
const firebaseConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ||
    (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_FIREBASE_API_KEY) ||
    "AIzaSyA2Ru-1wgJFg_qSfuRJ-OilpxzDyC9d7gg",
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN) ||
    "electromart-be5a0.firebaseapp.com",
  projectId:
    import.meta.env.VITE_FIREBASE_PROJECT_ID ||
    (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_FIREBASE_PROJECT_ID) ||
    "electromart-be5a0",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) ||
    "electromart-be5a0.firebasestorage.app",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
    (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID) ||
    "699177750485",
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_FIREBASE_APP_ID) ||
    "1:699177750485:web:5eb279f78bc2f7e548375c",
  measurementId:
    import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ||
    (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID) ||
    "G-D3JP9EG4SH"
};

// Initialize Firebase safely only once
const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

export { app, auth, db, firebaseConfig };
