// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB60h4sUbzEBlKdZH5CrDpLM7OnDVSchOU",
  authDomain: "urbancomputingdb.firebaseapp.com",
  databaseURL: "https://urbancomputingdb-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "urbancomputingdb",
  storageBucket: "urbancomputingdb.firebasestorage.app",
  messagingSenderId: "232745342671",
  appId: "1:232745342671:web:ee246f0767bf47b566c9ba",
};

const app = initializeApp(firebaseConfig);

// export the Auth system for login/signup
export const auth = getAuth(app);
