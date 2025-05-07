// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBFmacdXmAPXG_0QYpE-HSfTChsO2sV_Ys",
  authDomain: "loris-5ea13.firebaseapp.com",
  projectId: "loris-5ea13",
  storageBucket: "loris-5ea13.firebasestorage.app",
  messagingSenderId: "635767531711",
  appId: "1:635767531711:web:3f72cdd80a909ecab3be0a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
export { app, auth, db };