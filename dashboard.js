import {auth,db} from "./firebase.js";
import {onAuthStateChanged,signOut,createUserWithEmailAndPassword,deleteUser} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import {collection,getDocs,getDoc,doc,setDoc,addDoc,updateDoc,deleteDoc,query,orderBy,limit,serverTimestamp} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import {initializeApp,getApps} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import {getAuth as getAuth2} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
const ADMIN_UID="s1qDKY8MuXN4pgi5k69WxSxLUkW2";
let medicines=[],customers=[],orders=[],bills=[],purchases=[],profit=[];
const main=document.querySelector("#main");
const money=n=>"₹"+Number(n||0).toFixed(2);
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
async function load(col){const s=await getDocs(collection(db,col));return s.docs.map(x=>({id:x.id,...x.data()}))}
async function refresh(){[medicines,customers,orders,bills,purchases,profit]=await Promise.all(["medicinesPublic","customers","orders","bills","purchases","profitTransactions"].map(load))}
function nav(){document.querySelectorAll(".nav").forEach(b=>b.onclick=()=>{document.querySelectorAll(".nav").forEach(x=>x.classList.remove("active"));b.classList.add("active");render(b.dataset.view)})}
function table(headers,rows){return `<div class="table-wrap"><table class="table"><thead><tr>${headers.map(h=>`<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.join("")||`<tr><td colspan="${headers.length}">No records yet.</td></tr>`}</tbody></table></div>`}
async function render(view){
 await refresh();
 if(view==="home"){main.innerHTML=`<div class="content"><h1>Admin Dashboard</h1><div class="cards">
 <div class="stat"><span>Customers</span><br><b>${customers.length}</b></div><div class="stat"><span>Medicines</span><br><b>${medicines.length}</b></div><div class="stat"><span>Orders</span><br><b>${orders.length}</b></div><div class="stat"><span>Bills</span><br><b>${bills.length}</b></div></div>
 <div class="hero-panel" style="margin-top:20px"><h2>Quick start</h2><p>Add customers first, then add medicines. Customers can search medicines and place orders. Confirmed orders can be billed and profit transactions recorded.</p></div></div>`}
 if(view==="customers"){main.innerHTML=`<div class="content"><h1>Customers</h1><div class="toolbar"><button class="primary" id="add">+ Add Customer</button><input id="q" placeholder="Search customer..."></div>${table(["Customer ID","Name","Store","Mobile","Status","Action"],customers.map(c=>`<tr><td>${esc(c.customerId)}</td><td>${esc(c.name)}</td><td>${esc(c.storeName)}</td><td>${esc(c.mobile)}</td><td><span class="badge">${esc(c.status||"active")}</span></td><td><button class="ghost toggle" data-id="${c.id}">${c.status==="blacklisted"?"Unblacklist":"Blacklist"}</button></td></tr>`))}</div>`;
 document.querySelector("#add").onclick=()=>customerPrompt();
 document.querySelectorAll(".toggle").forEach(b=>b.onclick=async()=>{const c=customers.find(x=>x.id===b.dataset.id);await updateDoc(doc(db,"customers",c.id),{status:c.status==="blacklisted"?"active":"blacklisted"});render("customers")});
 }
 if(view==="medicines"){main.innerHTML=`<div class="content"><h1>Medicines</h1><div class="toolbar"><button class="primary" id="addMed">+ Add Medicine</button></div>${table(["Name","Salt","Pack","MRP","N. Rate","Stock","Action"],medicines.map(m=>`<tr><td>${esc(m.name)}</td><td>${esc(m.salt)}</td><td>${esc(m.pack)}</td><td>${money(m.mrp)}</td><td>${money(m.nRate)}</td><td>${m.stock??0}</td><td><button class="ghost edit" data-id="${m.id}">Edit</button> <button class="ghost del" data-id="${m.id}">Delete</button></td></tr>`))}</div>`;
 document.querySelector("#addMed").onclick=()=>medicinePrompt();
 document.querySelectorAll(".edit").forEach(b=>b.onclick=()=>medicinePrompt(medicines.find(x=>x.id===b.dataset.id)));
 document.querySelectorAll(".del").forEach(b=>b.onclick=async()=>{if(confirm("Delete this medicine?")){await deleteDoc(doc(db,"medicinesPublic",b.dataset.id));try{await deleteDoc(doc(db,"medicinesPrivate",b.dataset.id))}catch{}render("medicines")}});
 }
 if(view==="purchases"){main.innerHTML=`<div class="content"><h1>Purchases / Stock</h1><div class="toolbar"><button class="primary" id="addPurchase">+ Purchase Entry</button></div>${table(["Supplier","Invoice","Medicine","Batch","P. Rate","Qty","Date"],purchases.map(p=>`<tr><td>${esc(p.supplier)}</td><td>${esc(p.invoice)}</td><td>${esc(p.medicineName)}</td><td>${esc(p.batch)}</td><td>${money(p.pRate)}</td><td>${p.qty}</td><td>${esc(p.date||"")}</td></tr>`))}</div>`;document.querySelector("#addPurchase").onclick=()=>purchasePrompt()}
 if(view==="orders"){main.innerHTML=`<div class="content"><h1>Orders</h1>${table(["Order ID","Customer","Total","Status","Date","Action"],orders.map(o=>`<tr><td>${esc(o.orderId||o.id)}</td><td>${esc(o.customerName)}</td><td>${money(o.total)}</td><td><span class="badge">${esc(o.status)}</span></td><td>${esc(o.date||"")}</td><td>${o.status==="pending"?`<button class="ghost confirm" data-id="${o.id}">Confirm</button>`:"—"}</td></tr>`))}</div>`;
 document.querySelectorAll(".confirm").forEach(b=>b.onclick=()=>confirmOrder(orders.find(x=>x.id===b.dataset.id)));
 }
 if(view==="bills"){main.innerHTML=`<div class="content"><h1>Bills</h1>${table(["Bill No.","Customer","Total","Date"],bills.map(b=>`<tr><td>${esc(b.billNo)}</td><td>${esc(b.customerName)}</td><td>${money(b.total)}</td><td>${esc(b.date||"")}</td></tr>`))}</div>`}
 if(view==="profit"){const today=new Date().toISOString().slice(0,10);const sum=profit.filter(x=>x.date===today).reduce((a,x)=>a+Number(x.profit||0),0);main.innerHTML=`<div class="content"><h1>Profit Wallet</h1><div class="cards"><div class="stat"><span>Today's Profit</span><br><b>${money(sum)}</b></div><div class="stat"><span>All Recorded Profit</span><br><b>${money(profit.reduce((a,x)=>a+Number(x.profit||0),0))}</b></div></div><br>${table(["Date","Order","Medicine","N. Rate","GST","Transport","P. Rate","Profit"],profit.map(x=>`<tr><td>${esc(x.date)}</td><td>${esc(x.orderId)}</td><td>${esc(x.medicineName)}</td><td>${money(x.nRate)}</td><td>${money(x.gst)}</td><td>${money(x.transport)}</td><td>${money(x.pRate)}</td><td>${money(x.profit)}</td></tr>`))}</div>`}
}
async function customerPrompt(){
 const id=prompt("Unique Customer ID (letters/numbers/_/-):");if(!id)return;
 const pw=prompt("Temporary password (minimum 6 characters):");if(!pw||pw.length<6){alert("Password must be at least 6 characters.");return}
 const name=prompt("Customer name:")||"",store=prompt("Store name:")||"",mobile=prompt("Mobile:")||"";
 try{
  let secApp=getApps().find(a=>a.name==="customerCreator");
  if(!secApp) secApp=initializeApp((await import("./firebase.js")).firebaseConfig,"customerCreator");
  const sa=getAuth2(secApp),email=`${id.toLowerCase()}@customers.zenolifemedicare.local`;
  const c=await createUserWithEmailAndPassword(sa,email,pw);
  await setDoc(doc(db,"customers",c.user.uid),{customerId:id.toLowerCase(),name,storeName:store,mobile,status:"active",createdAt:serverTimestamp()});
  await signOut(sa);alert("Customer created successfully.");
 }catch(e){alert(e.code?.includes("email-already")?"Customer ID already exists.":e.message)}
}
async function medicinePrompt(m){
 const name=prompt("Drug/Brand Name:",m?.name||"");if(!name)return;
 const salt=prompt("Salt/Composition:",m?.salt||"")||"",pack=prompt("Pack:",m?.pack||"")||"",mrp=Number(prompt("MRP:",m?.mrp??0)||0),nRate=Number(prompt("N. Rate:",m?.nRate??0)||0),stock=Number(prompt("Stock:",m?.stock??0)||0),batch=prompt("Batch:",m?.batch||"")||"",expiry=prompt("Expiry:",m?.expiry||"")||"",image=prompt("Image URL (optional):",m?.image||"")||"";
 const data={name,salt,pack,mrp,nRate,stock,batch,expiry,image,updatedAt:serverTimestamp()};
 const id=m?.id||crypto.randomUUID();await setDoc(doc(db,"medicinesPublic",id),data);await setDoc(doc(db,"medicinesPrivate",id),{pRate:Number(prompt("P. Rate (Admin only):",m?.pRate??0)||0),gst:Number(prompt("GST/unit:",m?.gst??0)||0),transport:Number(prompt("Transport/unit:",m?.transport??0)||0),updatedAt:serverTimestamp()},{merge:true});render("medicines");
}
async function purchasePrompt(){
 const supplier=prompt("Supplier/Company:")||"",invoice=prompt("Invoice No:")||"",id=prompt("Medicine ID (from Medicines list):")||"",qty=Number(prompt("Quantity:")||0),pRate=Number(prompt("P. Rate:")||0),batch=prompt("Batch:")||"";
 if(!id||qty<=0)return;const m=medicines.find(x=>x.id===id);if(!m){alert("Medicine ID not found.");return}
 await addDoc(collection(db,"purchases"),{supplier,invoice,medicineId:id,medicineName:m.name,batch,pRate,qty,date:new Date().toISOString().slice(0,10),createdAt:serverTimestamp()});
 await updateDoc(doc(db,"medicinesPublic",id),{stock:Number(m.stock||0)+qty,batch});render("purchases");
}
async function confirmOrder(o){
 if(!o)return;if(o.status!=="pending")return;
 for(const item of (o.items||[])){const m=medicines.find(x=>x.id===item.medicineId);if(m)await updateDoc(doc(db,"medicinesPublic",m.id),{stock:Math.max(0,Number(m.stock||0)-Number(item.qty||0))})}
 const billNo="BILL-"+Date.now();await addDoc(collection(db,"bills"),{billNo,orderId:o.orderId||o.id,customerUid:o.customerUid,customerName:o.customerName,total:o.total,items:o.items||[],date:new Date().toISOString().slice(0,10),createdAt:serverTimestamp()});
 await updateDoc(doc(db,"orders",o.id),{status:"confirmed",billNo,confirmedAt:serverTimestamp()});
 for(const item of(o.items||[])){const priv=await getDoc(doc(db,"medicinesPrivate",item.medicineId));const p=priv.exists()?priv.data():{};const n=Number(item.nRate||0),g=Number(p.gst||0),t=Number(p.transport||0),pr=Number(p.pRate||0);await addDoc(collection(db,"profitTransactions"),{date:new Date().toISOString().slice(0,10),orderId:o.orderId||o.id,medicineName:item.name,nRate:n,gst:g,transport:t,pRate:pr,profit:n-g-t-pr,qty:item.qty||1,createdAt:serverTimestamp()})}
 alert("Order confirmed and bill created.");render("orders");
}
document.querySelector("#logout").onclick=()=>signOut(auth).then(()=>location.href="index.html");
onAuthStateChanged(auth,async u=>{if(!u||u.uid!==ADMIN_UID){location.href="index.html";return}const p=await getDoc(doc(db,"admins",ADMIN_UID));if(!p.exists()||p.data().status!=="active"){await signOut(auth);location.href="index.html";return}nav();render("home")});
