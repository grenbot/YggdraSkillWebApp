// src/firebaseConfig.ts

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore/lite';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: 'AIzaSyAiCMzek2ME2e_PC6RlgpBy-_Wq-_iny-0',
  authDomain: 'skilltreewebapp.firebaseapp.com',
  projectId: 'skilltreewebapp',
  storageBucket: 'skilltreewebapp.firebasestorage.app',
  messagingSenderId: '911747803406',
  appId: '1:911747803406:web:9005eff02e4d1cd81b8f5f',
  measurementId: 'G-RBQH9ZXYKF',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let analytics: Analytics | undefined;
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});

export { app, auth, db, analytics };
