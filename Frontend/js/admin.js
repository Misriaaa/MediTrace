/* ===============================
   GET TOKEN
================================ */
function getToken(){
  return localStorage.getItem("token");
}

/* ===============================
   LOAD USERS
================================ */
async function loadUsers(){

document.getElementById("transactionTable").innerHTML="";

try{

const res = await fetch("http://localhost:3000/api/admin/users",{
headers:{
"Authorization":"Bearer " + getToken()
}
});

const users = await res.json();

const table = document.getElementById("userTable");

table.innerHTML = `
<div class="card glass-table">

<h2>User Management</h2>

<table class="admin-table">

<thead>
<tr>
<th>Name</th>
<th>Email</th>
<th>Role</th>
<th>Status</th>
<th>Actions</th>
</tr>
</thead>

<tbody></tbody>

</table>

</div>
`;

const htmlTable = table.querySelector("tbody");
tbody.innerHTML += row;

users
.filter(user => user.role !== "admin")
.forEach(user=>{

const status = user.status || "pending";

const row = `

<tr>

<td>${user.name}</td>
<td>${user.email}</td>
<td>${user.role}</td>
<td>${status}</td>

<td>

${status==="pending" ?
`<button onclick="approveUser('${user.email}')" class="approve-btn">Approve</button>`
:
`<span style="color:green;">Approved</span>`
}

<button onclick="deleteUser('${user._id}')" class="delete-btn">Delete</button>

</td>

</tr>

`;

htmlTable.innerHTML += row;

});

}catch(err){

console.error(err);

}

}

/* ===============================
   LOAD ADMIN STATS
================================ */

async function loadStats(){

try{

const res = await fetch("http://localhost:3000/api/admin/stats",{
headers:{
"Authorization":"Bearer " + getToken()
}
});

const data = await res.json();

document.getElementById("totalUsers").innerText = data.totalUsers || 0;
document.getElementById("pendingUsers").innerText = data.pendingUsers || 0;
document.getElementById("totalMedicines").innerText = data.totalMedicines || 0;
document.getElementById("totalTransactions").innerText = data.totalTransactions || 0;

}catch(err){

console.error(err);

}

}

/* ===============================
   APPROVE USER
================================ */

async function approveUser(email){

try{

const res = await fetch("http://localhost:3000/api/admin/approve-user",{

method:"POST",

headers:{
"Content-Type":"application/json",
"Authorization":"Bearer " + getToken()
},

body:JSON.stringify({ email })

});

const data = await res.json();

alert(data.message);

// reload users + stats
loadPendingUsers();
loadStats();

}catch(err){
console.error(err);
}

}

/* ===============================
   DELETE USER
================================ */

async function deleteUser(id){

if(!confirm("Are you sure you want to delete this user?")){
return;
}

try{

const res = await fetch(`http://localhost:3000/api/admin/delete-user/${id}`,{

method:"DELETE",

headers:{
"Authorization":"Bearer " + getToken()
}

});

const data = await res.json();

alert(data.message);

loadPendingUsers();
loadStats();

}catch(err){
console.error(err);
}

}

/* ===============================
   TRANSACTION HISTORY
================================ */

async function loadTransactions(){

document.getElementById("userTable").innerHTML="";

try{

const res = await fetch("http://localhost:3000/api/transactions");

const data = await res.json();

const table = document.getElementById("transactionTable");

table.innerHTML = `
<h2 class="pending-heading">Transaction History</h2>
<table class="admin-table">
<tr>
<th>Medicine ID</th>
<th>Medicine Name</th>
<th>Action</th>
<th>Actor</th>
<th>Date</th>
</tr>
</table>
`;

const htmlTable = table.querySelector("table");

data.transactions.forEach(tx=>{

const row = `
<tr>
<td>${tx.medicineId}</td>
<td>${tx.medicineName}</td>
<td>${tx.action}</td>
<td>${tx.actor}</td>
<td>${new Date(tx.date).toLocaleString()}</td>
</tr>
`;

htmlTable.innerHTML += row;

});

}catch(err){
console.error(err);
}

}




/* ===============================
   LOAD PENDING USERS
================================ */

async function loadPendingUsers(){

document.getElementById("transactionTable").innerHTML="";

try{

const res = await fetch("http://localhost:3000/api/admin/users",{
headers:{
"Authorization":"Bearer " + getToken()
}
});

const users = await res.json();

const table = document.getElementById("userTable");

table.innerHTML = `
<h2 class="pending-heading">Pending Registrations</h2>

<table class="admin-table">
<tr>
<th>Name</th>
<th>Email</th>
<th>Role</th>
<th>Status</th>
<th>Action</th>
</tr>
</table>
`;

const htmlTable = table.querySelector("table");

users
.filter(user => user.status === "pending")
.forEach(user=>{

const row = `
<tr>
<td>${user.name}</td>
<td>${user.email}</td>
<td>${user.role}</td>
<td>${user.status}</td>

<td>
<button onclick="approveUser('${user.email}')" class="approve-btn">
Approve
</button>

<button onclick="deleteUser('${user._id}')" class="delete-btn">
Delete
</button>
</td>
</tr>
`;

htmlTable.innerHTML += row;

});

}catch(err){

console.error(err);

}

}



/* ===============================
   LOAD APPROVED USERS
================================ */

async function loadApprovedUsers(){

document.getElementById("transactionTable").innerHTML="";

try{

const res = await fetch("http://localhost:3000/api/admin/users",{
headers:{
"Authorization":"Bearer " + getToken()
}
});

const users = await res.json();

const manufacturers = users.filter(u => u.role==="manufacturer" && u.status==="approved");
const distributors = users.filter(u => u.role==="distributor" && u.status==="approved");
const pharmacies = users.filter(u => u.role==="pharmacy" && u.status==="approved");

const table = document.getElementById("userTable");

table.innerHTML = `
<h2 class="pending-heading">Approved Users</h2>

<h3 class="pending-heading" >Manufacturers</h3>
<table class="admin-table">
<tr>
<th>Name</th>
<th>Email</th>
<th>Wallet Address</th>
</tr>
${manufacturers.map(u=>`
<tr>
<td>${u.name}</td>
<td>${u.email}</td>
<td>${u.walletAddress}</td>
</tr>
`).join("")}
</table>

<br>

<h3 class="pending-heading" >Distributors</h3>
<table class="admin-table">
<tr>
<th>Name</th>
<th>Email</th>
<th>Wallet Address</th>
</tr>
${distributors.map(u=>`
<tr>
<td>${u.name}</td>
<td>${u.email}</td>
<td>${u.walletAddress}</td>
</tr>
`).join("")}
</table>

<br>

<h3 class="pending-heading" >Pharmacies</h3>
<table class="admin-table">
<tr>
<th>Name</th>
<th>Email</th>
<th>Wallet Address</th>
</tr>
${pharmacies.map(u=>`
<tr>
<td>${u.name}</td>
<td>${u.email}</td>
<td>${u.walletAddress}</td>
</tr>
`).join("")}
</table>
`;

}catch(err){

console.error(err);

}

}

loadStats();
loadPendingUsers();