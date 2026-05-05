// 🔐 Role + Token Check
const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

if (!token || role !== "manufacturer") {
  alert("Access Denied");
  window.location = "login.html";
}

/* =========================
   ADD MEDICINE
========================= */

async function createMedicine() {

const name = document.getElementById("name").value;
const brand = document.getElementById("brand").value;
const batchNumber = document.getElementById("batchNumber").value;
const manufacturerName = document.getElementById("manufacturerName").value;
const quantity = document.getElementById("quantity").value;
const manufactureDate = document.getElementById("manufactureDate").value;
const expiryDate = document.getElementById("expiryDate").value;

if(!name || !brand || !batchNumber || !manufacturerName || !quantity || !manufactureDate || !expiryDate){
alert("Please fill all fields");
return;
}

try{

const res = await fetch("http://localhost:3000/api/add-medicine",{

method:"POST",

headers:{
"Content-Type":"application/json",
"Authorization":"Bearer " + token
},

body:JSON.stringify({
name,
brand,
batchNumber,
manufacturerName,
quantity,
manufactureDate,
expiryDate
})

});

let data = {};

    try {
      data = await res.json(); // safe parse
    } catch (e) {
      console.log("JSON parse failed");
    }

    if(res.ok){

alert("Medicine Added Successfully");

if(data.medicineId){
generateDashboardQR(data.medicineId);
}

}else{

alert(data.message || data.error || "Failed to add medicine");

}

}catch(error){

console.error("Create Medicine Error:",error);
alert("Server Error");

}

}

/* =========================
   GENERATE QR
========================= */

async function generateDashboardQR(){

const id = document.getElementById("qrMedicineId").value;

const res = await fetch(`http://localhost:3000/api/get-medicine?id=${id}`);
const data = await res.json();

if(!data.exists){
alert("Medicine not found ❌");
return;
}

const traceURL = `https://unpreponderated-fibrinogenic-dorothea.ngrok-free.dev/verify.html?id=${id}`;

new QRCode(document.getElementById("qrCanvas"),{
text: traceURL,
width:180,
height:180
});

}

/* =========================
   DASHBOARD DATA
========================= */

async function loadDashboard(){

try{

const res = await fetch("http://localhost:3000/api/my-products",{

headers:{
"Authorization":"Bearer " + token
}

});

const products = await res.json();

document.getElementById("totalProducts").innerText = products.length;

let shipped = 0;
let pending = 0;

const wallet = JSON.parse(atob(token.split('.')[1])).walletAddress.toLowerCase();

products.forEach(product=>{

if(product.owner.toLowerCase() === wallet){
pending++;
}else{
shipped++;
}

});

document.querySelectorAll(".card p")[1].innerText = shipped;
document.querySelectorAll(".card p")[2].innerText = pending;

}catch(error){

console.error("Dashboard Load Error:",error);

}

}

/* =========================
   LOAD MY PRODUCTS
========================= */

async function loadMyProducts(){

try{

const res = await fetch("http://localhost:3000/api/my-products",{

headers:{
"Authorization":"Bearer " + token
}

});

const products = await res.json();

const tableBody = document.querySelector("#productTable tbody");

if(!tableBody) return;

tableBody.innerHTML="";

products.forEach(product=>{

const row = `
<tr>
<td>${product.medicineId}</td>
<td>${product.medicineName}</td>
<td>${product.batchNumber}</td>
<td>${product.owner}</td>
</tr>
`;

tableBody.innerHTML += row;

});

}catch(error){

console.error("Load Products Error:",error);

}

}

/* =========================
   SHIP PRODUCT
========================= */

async function shipProduct(){

const medicineId = document.getElementById("medicineId").value;
const distributor = document.getElementById("distributorSelect").value;

if(!medicineId || !distributor){
alert("Enter Medicine ID and Select Distributor");
return;
}

try{

const res = await fetch("http://localhost:3000/api/transfer-medicine",{

method:"POST",

headers:{
"Content-Type":"application/json",
"Authorization":"Bearer " + token
},

body:JSON.stringify({
id: Number(medicineId),
to: distributor
})

});

const data = await res.json();

if(res.ok && data.txHash){

alert("Product Shipped Successfully 🚚");

document.getElementById("shipResult").innerHTML = `
<label>Transaction Hash</label>
<div class="login-btn">${data.txHash}</div>
`;

}else{

alert(data.error || data.message || "Transfer failed");

}

}catch(error){

console.error("Ship Error:",error);
alert("Server Error");

}

}

/* =========================
   LOAD DISTRIBUTORS
========================= */

async function loadDistributors(){

try{

const res = await fetch("http://localhost:3000/api/distributors");

const distributors = await res.json();

const select = document.getElementById("distributorSelect");

if(!select) return;

select.innerHTML = '<option value="">Select Distributor</option>';

distributors.forEach(d=>{

const option = document.createElement("option");

option.value = d.walletAddress;
option.textContent = d.name;

select.appendChild(option);

});

}catch(err){

console.error("Distributor Load Error:",err);

}

}

/* =========================
   PAGE LOAD
========================= */

window.onload = function(){

if(document.getElementById("totalProducts")){
loadDashboard();
}

if(document.getElementById("productTable")){
loadMyProducts();
}

if(document.getElementById("distributorSelect")){
loadDistributors();
}

};

async function loadShippedProducts() {

  const token = localStorage.getItem("token");

  try {

    const res = await fetch("http://localhost:3000/api/my-products", {
      headers: {
        "Authorization": "Bearer " + token
      }
    });

    const data = await res.json();

    const container = document.getElementById("shippedCards");

    if (!container) return;

    container.innerHTML = "";

    data.forEach(product => {

      // check if shipped
      let isShipped = false;

      product.history?.forEach(h => {
        if (h.action && h.action.includes("Shipped")) {
            isShipped = true;
         }
      });

      if (isShipped) {

        const card = `
        <div class="glass-card">
            <h3>${product.medicineName}</h3>
            <p><b>ID:</b> ${product.medicineId}</p>
            <p><b>Batch:</b> ${product.batchNumber}</p>
            <p><b>Quantity:</b> ${product.quantity}</p>
            <p style="color:lightgreen">Shipped ✅</p>
        </div>
        `;

        container.innerHTML += card;

      }

    });

  } catch (error) {
    console.log(error);
  }

}

if (window.location.pathname.includes("shipped-products.html")) {
  loadShippedProducts();
}

function downloadQR() {

  const canvas = document.querySelector("#qrCanvas canvas");

  if (!canvas) {
    alert("Generate QR first ⚠️");
    return;
  }

  const link = document.createElement("a");
  link.download = "medicine_qr.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}

function goBack() {
  window.location.href = "manufacturer.html";
}