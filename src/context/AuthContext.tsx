import React, { createContext, useContext, useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import { ref, get, set } from "firebase/database";
import { auth, db } from "../lib/firebase";
import { User } from "../types";
import { handleDatabaseError } from "../lib/firestoreErrors";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (
    name: string,
    email: string,
    password: string,
    confirmPassword: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function formatAuthError(err: any): string {
  const code = err?.code || "";
  switch (code) {
    case "auth/email-already-in-use":
      return "This email is already registered. Please sign in instead.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/weak-password":
      return "Password is too weak. Must be at least 6 characters.";
    case "auth/user-not-found":
      return "No account exists with this email address.";
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Incorrect email or password. Please try again.";
    case "auth/too-many-requests":
      return "Too many unsuccessful attempts. Please try again shortly.";
    case "auth/network-request-failed":
      return "Network connection issue. Please check your internet connection.";
    default:
      return err?.message || "Authentication failed. Please try again.";
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem("flipkart_user");
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("flipkart_token");
  });
  const [loading, setLoading] = useState(true);

  // Sync Firebase Authentication state and Realtime Database user profile
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken();
          setToken(idToken);
          localStorage.setItem("flipkart_token", idToken);

          // Retrieve or sync profile from Realtime Database: users/{uid}
          const userRef = ref(db, `users/${firebaseUser.uid}`);
          let userRole: "admin" | "customer" =
            firebaseUser.email?.toLowerCase() === "hargudetejas17@gmail.com"
              ? "admin"
              : "customer";
          let displayName = firebaseUser.displayName || "";

          try {
            const snap = await get(userRef);
            if (snap.exists()) {
              const data = snap.val();
              if (data.role) userRole = data.role;
              if (data.name) displayName = data.name;
            } else {
              // Create user record in Realtime Database if not present
              const initialData = {
                id: firebaseUser.uid,
                name: displayName || firebaseUser.email?.split("@")[0] || "User",
                email: firebaseUser.email || "",
                role: userRole,
                createdAt: new Date().toISOString()
              };
              await set(userRef, initialData);
            }
          } catch (docErr) {
            handleDatabaseError(docErr, "read", `users/${firebaseUser.uid}`);
          }

          const appUser: User = {
            id: firebaseUser.uid,
            name: displayName || firebaseUser.email?.split("@")[0] || "User",
            email: firebaseUser.email || "",
            role: userRole
          };

          setUser(appUser);
          localStorage.setItem("flipkart_user", JSON.stringify(appUser));
        } catch (tokenErr) {
          console.error("Error retrieving user auth token:", tokenErr);
        }
      } else {
        // User is signed out
        setUser(null);
        setToken(null);
        localStorage.removeItem("flipkart_token");
        localStorage.removeItem("flipkart_user");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      const idToken = await firebaseUser.getIdToken();

      let userRole: "admin" | "customer" =
        firebaseUser.email?.toLowerCase() === "hargudetejas17@gmail.com"
          ? "admin"
          : "customer";
      let displayName = firebaseUser.displayName || "";

      try {
        const snap = await get(ref(db, `users/${firebaseUser.uid}`));
        if (snap.exists()) {
          const data = snap.val();
          if (data.role) userRole = data.role;
          if (data.name) displayName = data.name;
        }
      } catch (err) {
        // Soft fallback
      }

      const appUser: User = {
        id: firebaseUser.uid,
        name: displayName || firebaseUser.email?.split("@")[0] || "User",
        email: firebaseUser.email || "",
        role: userRole
      };

      setToken(idToken);
      setUser(appUser);
      localStorage.setItem("flipkart_token", idToken);
      localStorage.setItem("flipkart_user", JSON.stringify(appUser));

      return { success: true };
    } catch (err: any) {
      console.error("Firebase Login Error:", err);
      return { success: false, error: formatAuthError(err) };
    }
  };

  const signup = async (
    name: string,
    email: string,
    password: string,
    confirmPassword: string
  ) => {
    if (password !== confirmPassword) {
      return { success: false, error: "Passwords do not match" };
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      const idToken = await firebaseUser.getIdToken();

      const userRole: "admin" | "customer" =
        email.toLowerCase() === "hargudetejas17@gmail.com" ? "admin" : "customer";

      const newUserDoc = {
        id: firebaseUser.uid,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role: userRole,
        createdAt: new Date().toISOString()
      };

      try {
        await set(ref(db, `users/${firebaseUser.uid}`), newUserDoc);
      } catch (docErr) {
        handleDatabaseError(docErr, "create", `users/${firebaseUser.uid}`);
      }

      const appUser: User = {
        id: firebaseUser.uid,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role: userRole
      };

      setToken(idToken);
      setUser(appUser);
      localStorage.setItem("flipkart_token", idToken);
      localStorage.setItem("flipkart_user", JSON.stringify(appUser));

      return { success: true };
    } catch (err: any) {
      console.error("Firebase Signup Error:", err);
      return { success: false, error: formatAuthError(err) };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Firebase Signout Error:", e);
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem("flipkart_token");
    localStorage.removeItem("flipkart_user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        signup,
        logout,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
