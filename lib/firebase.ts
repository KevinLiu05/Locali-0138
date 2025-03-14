// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"
import { getStorage } from "firebase/storage"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCz8SrI_susItRP7XSEZqzIF_rir_ZLeTE",
  authDomain: "locali-eed92.firebaseapp.com",
  projectId: "locali-eed92",
  storageBucket: "locali-eed92.firebasestorage.app",
  messagingSenderId: "462221244538",
  appId: "1:462221244538:web:24fd1d13da7cc81af7a3c3",
}

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
const db = getFirestore(app)
const auth = getAuth(app)
const storage = getStorage(app)

export { app, db, auth, storage }

