// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
//import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAC7dbS7YlUkpUgHTeNRfCjloSxkRT6DOw",
  authDomain: "ai-chatbot-7e7c1.firebaseapp.com",
  projectId: "ai-chatbot-7e7c1",
  storageBucket: "ai-chatbot-7e7c1.appspot.com",
  messagingSenderId: "61377578605",
  appId: "1:61377578605:web:f8c1430ac777c808ffa164",
  measurementId: "G-CPYX9GN14Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const firestore = getFirestore(app);

export { firestore };