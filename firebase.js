import {initializeApp,getApps,getApp} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import {getAuth} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import {getFirestore} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";
import {firebaseConfig} from "./firebase-config.js";
const bad=!firebaseConfig.apiKey || firebaseConfig.apiKey.includes("PASTE_") || !firebaseConfig.appId || firebaseConfig.appId.includes("PASTE_");
if(bad) console.warn("Firebase config is incomplete. Replace firebase-config.js with the current Web App config from Firebase Console.");
export const app=getApps().length?getApp():initializeApp(firebaseConfig);
export const auth=getAuth(app);
export const db=getFirestore(app);
