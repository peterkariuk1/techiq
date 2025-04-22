// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDELh5CBwYm6jsvGVzbKWspivkJ0ix5jfQ",
  authDomain: "loris-6a176.firebaseapp.com",
  projectId: "loris-6a176",
  storageBucket: "loris-6a176.firebasestorage.app",
  messagingSenderId: "306385472572",
  appId: "1:306385472572:web:7a9776aefd0783b15b8739"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
export { app, auth, db };