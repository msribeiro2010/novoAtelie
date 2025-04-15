import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAJx27xeXmK6I76WssOx1-aqG6xPMh3KAQ",
  authDomain: "atelierosa-d24ae.firebaseapp.com",
  projectId: "atelierosa-d24ae",
  storageBucket: "atelierosa-d24ae.firebasestorage.app",
  messagingSenderId: "611164481852",
  appId: "1:611164481852:web:2ac3b1edc58202e5e11639",
  measurementId: "G-32D9JGHYSL"

};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
