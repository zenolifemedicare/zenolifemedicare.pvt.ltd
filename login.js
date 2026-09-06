import {auth,db} from "./firebase.js";
import {ADMIN_UID,CUSTOMER_EMAIL_SUFFIX,ADMIN_LOGIN_ID} from "./firebase-config.js";
import {signInWithEmailAndPassword,signOut} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

const $ = s => document.querySelector(s);

function friendlyError(e){
  const c = e?.code || "";
  if(c.includes("invalid-api-key")) return "Firebase API key invalid hai. firebase-config.js check karo.";
  if(c.includes("unauthorized-domain")) return "GitHub Pages domain Firebase Authentication ke Authorized Domains me add nahi hai.";
  if(c.includes("app-not-authorized")) return "Firebase Authentication ne is website domain ko authorize nahi kiya hai.";
  if(c.includes("operation-not-allowed")) return "Firebase Authentication me Email/Password sign-in enable nahi hai.";
  if(c.includes("network-request-failed") || c.includes("network") || c.includes("network-timeout")) return "Firebase server se connection nahi ho raha. Agar page load ho raha hai to Firebase/Auth settings ya network blocking check karo.";
  if(c.includes("invalid-credential") || c.includes("wrong-password") || c.includes("user-not-found")) return "Admin email/password galat hai.";
  if(c.includes("too-many-requests")) return "Bahut attempts ho gaye. Thodi der baad dobara try karo.";
  return e?.message || "Login failed. Dobara try karo.";
}

function withTimeout(promise, ms=12000){
  return Promise.race([
    promise,
    new Promise((_, reject)=>setTimeout(()=>{
      const e = new Error("Firebase request timed out");
      e.code = "network-timeout";
      reject(e);
    }, ms))
  ]);
}

document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>{
  document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));
  b.classList.add("active");
  $("#customerForm").classList.toggle("hidden",b.dataset.tab!=="customer");
  $("#adminForm").classList.toggle("hidden",b.dataset.tab!=="admin");
});

$("#customerForm").onsubmit=async e=>{
  e.preventDefault();
  const m=$("#cm"); m.textContent="Checking...";
  const id=$("#cid").value.trim().toLowerCase();
  const pw=$("#cpw").value;
  if(!/^[a-z0-9._-]{3,40}$/.test(id)){m.textContent="Invalid Customer ID.";return}
  try{
    const c=await withTimeout(signInWithEmailAndPassword(auth,id+CUSTOMER_EMAIL_SUFFIX,pw));
    const p=await withTimeout(getDoc(doc(db,"customers",c.user.uid)));
    if(!p.exists()){await signOut(auth);m.textContent="Customer profile not found.";return}
    if(p.data().status==="blacklisted"){await signOut(auth);m.textContent="This Customer ID is blacklisted.";return}
    location.href="customer.html";
  }catch(e){m.textContent=friendlyError(e)}
};

$("#adminForm").onsubmit=async e=>{
  e.preventDefault();
  const m=$("#am"); m.textContent="Checking...";
  const input=$("#aid").value.trim();
  const password=$("#apw").value;
  // Admin ID mode: type ADMIN. Email mode is also supported for Firebase Auth.
  const configuredAdminEmail = "mrbityur@gmail.com";
  const email = input.toUpperCase()===ADMIN_LOGIN_ID ? configuredAdminEmail : input;
  if(!email){m.textContent="Admin ID/email required.";return}
  try{
    const c=await withTimeout(signInWithEmailAndPassword(auth,email,password));
    if(c.user.uid!==ADMIN_UID){await signOut(auth);m.textContent="Invalid Admin ID.";return}
    location.href="admin.html";
  }catch(e){m.textContent=friendlyError(e)}
};
