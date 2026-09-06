import {initializeApp,getApps,getApp} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import {getAuth} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import {getFirestore,initializeFirestore} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import {firebaseConfig} from "./firebase-config.js";

const bad=!firebaseConfig.apiKey || firebaseConfig.apiKey.includes("PASTE_") || !firebaseConfig.appId || firebaseConfig.appId.includes("PASTE_");
if(bad) console.warn("Firebase config is incomplete. Replace firebase-config.js with the current Web App config from Firebase Console.");

export const app=getApps().length?getApp():initializeApp(firebaseConfig);
export const auth=getAuth(app);

let dbInstance;
try {
  dbInstance=initializeFirestore(app,{experimentalAutoDetectLongPolling:true});
} catch {
  dbInstance=getFirestore(app);
}
export const db=dbInstance;
