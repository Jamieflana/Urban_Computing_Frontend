// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAb8kAsJVddxh6N1Lc0PWPKhT_glyZMroQ",
  authDomain: "urbangps2.firebaseapp.com",
  databaseURL: "https://urbangps2-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "urbangps2",
  storageBucket: "urbangps2.firebasestorage.app",
  messagingSenderId: "860142458336",
  appId: "1:860142458336:web:6b8d62fdcc853751458785"
};

const app = initializeApp(firebaseConfig);

// export the Auth system for login/signup
export const auth = getAuth(app);
