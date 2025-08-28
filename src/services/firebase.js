// src/services/firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyAXHnvNZkb00PXbG5JidbD4PbRgf7l6Lgg",
    authDomain: "v2v-communication-d46c6.firebaseapp.com",
    databaseURL: "https://v2v-communication-d46c6-default-rtdb.firebaseio.com",
    projectId: "v2v-communication-d46c6",
    storageBucket: "v2v-communication-d46c6.firebasestorage.app",
    messagingSenderId: "536888356116",
    appId: "1:536888356116:web:c6bbab9c6faae7c84e2601",
    measurementId: "G-FXLP4KQXWM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
