import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAmMvnnSBJvXiniq7snNKnHVd6q0KgnUuc",
  authDomain: window.location.hostname === "localhost" ? "gen-lang-client-0374663187.firebaseapp.com" : window.location.hostname,
  projectId: "gen-lang-client-0374663187",
  storageBucket: "gen-lang-client-0374663187.firebasestorage.app",
  messagingSenderId: "68546674847",
  appId: "1:68546674847:web:8aed661ea0cf6b0456e2aa"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
