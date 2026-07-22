import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp, query, orderBy, getDocs, limit, doc, updateDoc, setDoc } from "firebase/firestore";

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
  
  try {
    // Use setDoc with a specific ID if provided, otherwise fallback to addDoc
    if (data.id) {
      const docRef = doc(db, "history", data.id);
      await setDoc(docRef, {
        ...data,
        timestamp: serverTimestamp(),
      });
      return { id: data.id };
    }

    const docRef = await addDoc(collection(db, "history"), {
      ...data,
      timestamp: serverTimestamp(),
    });


    
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

export async function getScanHistory(maxItems: number = 50) {
  try {

    const historyRef = collection(db, "history");
    const q = query(historyRef, orderBy("timestamp", "desc"), limit(maxItems));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
  
      return {
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate?.() ? data.timestamp.toDate().toISOString() : data.timestamp
      };
    });
  } catch (error) {
    console.error("Database Service: Error fetching history", error);
    return [];
  }
}

export async function updateScanResult(id: string, data: any) {
  try {
    const docRef = doc(db, "history", id);
    // Use setDoc with merge: true to create if missing or update if exists
    await setDoc(docRef, {
      ...data,
      lastUpdated: serverTimestamp(),
    }, { merge: true });
    
    return { success: true };
  } catch (error) {
    console.error("Database Service: Error updating document", error);
    return { success: false, error };
  }
}
