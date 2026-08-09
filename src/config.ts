// Environment Variables & Secrets Management
// This file centralizes frontend configuration.
// It securely accesses public variables via import.meta.env
// We NEVER expose backend secrets (like DATABASE_URL or JWT_SECRET) here.

export const config = {
  apiUrl: import.meta.env.VITE_API_URL || "http://localhost:3000",
  appEnv: import.meta.env.MODE || "development",
};

export const API_URL = config.apiUrl;
