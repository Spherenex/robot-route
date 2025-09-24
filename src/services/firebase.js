// src/services/firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyCM0tItu-glPhEllQZPz8h6_5ZsHTBiaMw",
    authDomain: "intel-gesture.firebaseapp.com",
    databaseURL: "https://intel-gesture-default-rtdb.firebaseio.com",
    projectId: "intel-gesture",
    storageBucket: "intel-gesture.firebasestorage.app",
    messagingSenderId: "696474188829",
    appId: "1:696474188829:web:ee4e918549569e4f621af4",
    measurementId: "G-1FK4E6M2VT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
