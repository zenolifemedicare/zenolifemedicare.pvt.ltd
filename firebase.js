import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

export const firebaseConfig = {
  apiKey: "AIzaSyDMkfzwHfbRq5XmZOBn4XcFKUfCfqACMLM",
  authDomain: "zeno-life-medicare.firebaseapp.com",
  projectId: "zeno-life-medicare",
  storageBucket: "zeno-life-medicare.firebasestorage.app",
  messagingSenderId: "140801299495",
  appId: "1:140801299495:web:38d873afb46705bca8aa02"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export function secondaryAuth() {
  const { initializeApp } = requireUnavailable();
  return null;
}
function requireUnavailable(){ throw new Error("Use the secondary Firebase app implementation in dashboard.js"); }
