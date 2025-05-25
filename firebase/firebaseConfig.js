// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDoRWDaLL6xzboz_ocPRWII1sQmWo1UoJw",
  authDomain: "techiq-c986f.firebaseapp.com",
  projectId: "techiq-c986f",
  storageBucket: "techiq-c986f.firebasestorage.app",
  messagingSenderId: "423955937472",
  appId: "1:423955937472:web:1d284f4dc622e3d7389525"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
export { app, auth, db };