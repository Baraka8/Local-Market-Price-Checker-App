import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getFunctions, Functions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: "AIzaSyCqek7UnRY-ksN7Yfz4JHYFcx7yKsl-Tis",
  authDomain: "local-market-price-checker.firebaseapp.com",
  projectId: "local-market-price-checker",
  storageBucket: "local-market-price-checker.firebasestorage.app",
  messagingSenderId: "835907874852",
  appId: "1:835907874852:web:309af6dbbf7d278d8328b1",
  measurementId: "G-8F881GJ54H"
};

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let functions: Functions;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  functions = getFunctions(app);
} else {
  app = getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  functions = getFunctions(app);
}

export { app, auth, db, storage, functions };
