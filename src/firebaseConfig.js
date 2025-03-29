import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore/lite'; // Use Firestore Lite for Node.js
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: 'AIzaSyAiCMzek2ME2e_PC6RlgpBy-_Wq-_iny-0',
  authDomain: 'skilltreewebapp.firebaseapp.com',
  projectId: 'skilltreewebapp',
  storageBucket: 'skilltreewebapp.firebasestorage.app',
  messagingSenderId: '911747803406',
  appId: '1:911747803406:web:9005eff02e4d1cd81b8f5f',
  measurementId: 'G-RBQH9ZXYKF',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app); // Firestore Lite for Node.js
export const auth = getAuth(app);
export let analytics;
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  } else {
    console.log('Analytics not supported in this environment');
  }
});
