// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage"; // Firebase Storage를 추가로 import

const firebaseConfig = {
  apiKey: "AIzaSyBWIjEJJiVnyCUrr4VhMyR4Z_VJwNaer_s",
  authDomain: "hard-to-get-994d6.firebaseapp.com",
  databaseURL:
    "https://hard-to-get-994d6-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "hard-to-get-994d6",
  storageBucket: "hard-to-get-994d6.appspot.com",
  messagingSenderId: "1041079778185",
  appId: "1:1041079778185:web:3a8dbbc9abaf3aa4597f58",
  measurementId: "G-9S2R38G4RL",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
export const analytics = getAnalytics(app);
export const storage = getStorage(app); // Firebase Storage 초기화 및 export
