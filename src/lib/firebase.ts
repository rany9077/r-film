// src/lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { getAuth, type Auth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let auth: Auth | null = null;
let googleProvider: GoogleAuthProvider | null = null;

// 공통: 클라이언트에서만 app 생성
export function getFirebaseApp(): FirebaseApp | null {
    if (typeof window === "undefined") return null;

    if (app) return app;

    if (!firebaseConfig.apiKey) {
        console.error("[Firebase] Missing API key:", firebaseConfig);
        return null;
    }

    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    return app;
}

export function getDb(): Firestore | null {
    if (typeof window === "undefined") return null;
    if (db) return db;

    const app = getFirebaseApp();
    if (!app) return null;

    db = getFirestore(app);
    return db;
}

export function getStorageInstance(): FirebaseStorage | null {
    if (typeof window === "undefined") return null;
    if (storage) return storage;

    const app = getFirebaseApp();
    if (!app) return null;

    storage = getStorage(app);
    return storage;
}

export function getAuthInstance(): Auth | null {
    if (typeof window === "undefined") return null;
    if (auth) return auth;

    const app = getFirebaseApp();
    if (!app) return null;

    auth = getAuth(app);
    return auth;
}

export function getGoogleProvider(): GoogleAuthProvider | null {
    if (typeof window === "undefined") return null;
    if (googleProvider) return googleProvider;

    googleProvider = new GoogleAuthProvider();
    return googleProvider;
}
