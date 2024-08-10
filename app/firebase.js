// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBfgG7-tY8Nnjtpj9sJCEY5hFektZtLL-Q",
    authDomain: "chatbot-2ad9e.firebaseapp.com",
    projectId: "chatbot-2ad9e",
    storageBucket: "chatbot-2ad9e.appspot.com",
    messagingSenderId: "763850353573",
    appId: "1:763850353573:web:85ea0ff802de2c9bf0564c",
    measurementId: "G-QY44SB3SZC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Firebase authentication functions
const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    console.error('Error during sign in:', error);
  }
};

const logOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error during sign out:', error);
  }
};

export { auth, signInWithGoogle, logOut };