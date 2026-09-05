import {auth,db} from "./firebase.js";
import {signInWithEmailAndPassword,onAuthStateChanged,signOut} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import {doc,getDoc} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
const ADMIN_UID="s1qDKY8MuXN4pgi5k69WxSxLUkW2";
document.querySelector("#login").addEventListener("submit",async e=>{
 e.preventDefault(); const m=document.querySelector("#msg"); m.textContent="Checking...";
 try{const c=await signInWithEmailAndPassword(auth,email.value.trim(),password.value);
 if(c.user.uid!==ADMIN_UID){await signOut(auth);throw Error("not-admin")}
 const a=await getDoc(doc(db,"admins",ADMIN_UID));
 if(!a.exists()){await signOut(auth);throw Error("profile-missing")}
 location.href="dashboard.html";
 }catch(x){m.textContent=x.message==="not-admin"?"Invalid Admin ID":x.message==="profile-missing"?"Admin profile missing":"Incorrect email or password";}
});
onAuthStateChanged(auth,u=>{if(u&&u.uid===ADMIN_UID)location.href="dashboard.html"});