import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDHpKpknj2cTtQ2vwe84Uws5HI2SgMbYL8",
  authDomain: "dayplanner-ed69e.firebaseapp.com",
  projectId: "dayplanner-ed69e",
  storageBucket: "dayplanner-ed69e.firebasestorage.app",
  messagingSenderId: "243140453844",
  appId: "1:243140453844:web:f14c3375976ac5dcdce241"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;