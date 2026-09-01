import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import {
  initializeFirestore,
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  Firestore,
} from "firebase/firestore";
import firebaseAppletConfig from "../firebase-applet-config.json";

// Validation helper
export function getFirebaseConfig() {
  const cfg = firebaseAppletConfig as Record<string, string>;
  const missingKeys: string[] = [];
  if (!cfg.apiKey) missingKeys.push("apiKey");
  if (!cfg.projectId) missingKeys.push("projectId");
  if (!cfg.appId) missingKeys.push("appId");
  if (!cfg.authDomain) missingKeys.push("authDomain");

  return {
    config: cfg,
    isValid: missingKeys.length === 0,
    missingKeys,
  };
}

const { config, isValid } = getFirebaseConfig();

export const isFirebaseConfigured = isValid;

let appInstance = null;
let authInstance: ReturnType<typeof getAuth> | null = null;
let dbInstance: Firestore | null = null;

if (isValid) {
  try {
    appInstance = getApps().length > 0 ? getApp() : initializeApp(config);
    authInstance = getAuth(appInstance);
    // Initialize Firestore with forced HTTP long-polling and disabled fetch streams to ensure immediate connection in sandboxed iframe environments
    const firestoreSettings = {
      experimentalForceLongPolling: true,
      useFetchStreams: false,
    };
    const databaseId = config.firestoreDatabaseId && config.firestoreDatabaseId !== "(default)"
      ? config.firestoreDatabaseId
      : undefined;

    try {
      if (databaseId) {
        dbInstance = initializeFirestore(appInstance, firestoreSettings, databaseId);
      } else {
        dbInstance = initializeFirestore(appInstance, firestoreSettings);
      }
    } catch {
      dbInstance = databaseId
        ? getFirestore(appInstance, databaseId)
        : getFirestore(appInstance);
    }

    console.log(`[Firebase Init] Client SDK connected to Firestore database: "${databaseId || '(default)'}"`);
  } catch (err) {
    console.error("Failed to initialize Firebase SDK:", err);
  }
}

export const app = appInstance;
export const auth = authInstance;
export const db = dbInstance;

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});

export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  onAuthStateChanged,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
};

export type { FirebaseUser };
