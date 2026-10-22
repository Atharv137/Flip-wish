import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getDatabase, Database } from "firebase/database";

// Helper to safely read env variables across Vite and Next.js/Netlify
const getEnvVar = (viteKey: string, nextKey: string, fallback = ""): string => {
  // Vite client-side
  if (typeof import.meta !== "undefined" && import.meta.env) {
    if (import.meta.env[viteKey]) return import.meta.env[viteKey] as string;
    if (import.meta.env[nextKey]) return import.meta.env[nextKey] as string;
  }
  // Node / Server / Process environment fallback
  if (typeof process !== "undefined" && process.env) {
    if (process.env[nextKey]) return process.env[nextKey] as string;
    if (process.env[viteKey]) return process.env[viteKey] as string;
  }
  return fallback;
};

// Purely environment-driven configuration for Firebase Authentication & Realtime Database
const firebaseConfig = {
  apiKey: getEnvVar("VITE_FIREBASE_API_KEY", "NEXT_PUBLIC_FIREBASE_API_KEY"),
  authDomain: getEnvVar("VITE_FIREBASE_AUTH_DOMAIN", "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN", "electromart-be5a0.firebaseapp.com"),
  databaseURL: getEnvVar(
    "VITE_FIREBASE_DATABASE_URL",
    "NEXT_PUBLIC_FIREBASE_DATABASE_URL",
    "https://electromart-be5a0-default-rtdb.firebaseio.com"
  ),
  projectId: getEnvVar("VITE_FIREBASE_PROJECT_ID", "NEXT_PUBLIC_FIREBASE_PROJECT_ID", "electromart-be5a0"),
  storageBucket: getEnvVar("VITE_FIREBASE_STORAGE_BUCKET", "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET", "electromart-be5a0.firebasestorage.app"),
  messagingSenderId: getEnvVar("VITE_FIREBASE_MESSAGING_SENDER_ID", "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID", "699177750485"),
  appId: getEnvVar("VITE_FIREBASE_APP_ID", "NEXT_PUBLIC_FIREBASE_APP_ID"),
  measurementId: getEnvVar("VITE_FIREBASE_MEASUREMENT_ID", "NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID")
};

// Initialize Firebase safely only once
const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);
const db: Database = getDatabase(app);

export { app, auth, db, firebaseConfig };
