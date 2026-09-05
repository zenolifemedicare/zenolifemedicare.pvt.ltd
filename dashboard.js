import {auth,db,firebaseConfig} from "./firebase.js";
import {initializeApp,getApps} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import {getAuth,onAuthStateChanged,signOut,createUserWithEmailAndPassword} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import {doc,setDoc,getDocs,collection,serverTimestamp} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
const ADMIN_UID="s1qDKY8MuXN4pgi5k69WxSxLUkW2";
onAuthStateChanged(auth,async u=>{if(!u||u.uid!==ADMIN_UID)return location.href="index.html";document.querySelector("#email").textContent=u.email||"Admin";refresh()});
document.querySelector("#logout").onclick=()=>signOut(auth);
async function refresh(){try{document.querySelector("#cc").textContent=(await getDocs(collection(db,"customers"))).size}catch(e){console.error(e)}}
document.querySelector("#customerForm").addEventListener("submit",async e=>{
 e.preventDefault();const msg=document.querySelector("#customerMsg");msg.textContent="Creating...";
 try{
  const appName="customerCreator";const a=getApps().find(x=>x.name===appName)||initializeApp(firebaseConfig,appName);
  const second=getAuth(a);const c=await createUserWithEmailAndPassword(second,document.querySelector("#email2").value.trim(),document.querySelector("#pass2").value);
  await setDoc(doc(db,"customers",c.user.uid),{
   customerId:customerId.value.trim(),name:name.value.trim(),storeName:storeName.value.trim(),mobile:mobile.value.trim(),
   address:address.value.trim(),city:city.value.trim(),state:state.value.trim(),pincode:pincode.value.trim(),
   status:"active",createdAt:serverTimestamp()
  });
  await signOut(second);e.target.reset();msg.textContent="Customer created successfully.";refresh();
 }catch(x){console.error(x);msg.textContent="Error: "+(x.code||x.message)}
});