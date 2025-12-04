import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyDtqPDt8Ix_yOJ50oqCMWyYy89G5RjvQYg",
    authDomain: "neleujimaseyo.firebaseapp.com",
    projectId: "neleujimaseyo",
    storageBucket: "neleujimaseyo.firebasestorage.app",
    messagingSenderId: "982487378024",
    appId: "1:982487378024:web:55773e4fae04784e45f3dd",
    measurementId: "G-0DRRZXHH6V"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const database = getDatabase(app);