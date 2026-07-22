import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "treasurytakehome-35820.firebaseapp.com",
  projectId: "treasurytakehome-35820",
  storageBucket: "treasurytakehome-35820.firebasestorage.app",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export async function saveScanResults(data: any) {
  console.log("Database Service: Writing to Firestore", data);
  
  try {
    const docRef = await addDoc(collection(db, "history"), {
      ...data,
      timestamp: serverTimestamp(),
    });

    console.log("Database Service: Successfully wrote to Firestore with ID:", docRef.id);
    
    return {
      id: docRef.id
    };
  } catch (error) {
    console.error("Database Service: Error writing to Firestore", error);
    // Return a mock ID so the app doesn't crash, but log the error
    return {
      id: "error-" + Date.now()
    };
  }
}
