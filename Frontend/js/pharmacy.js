const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

if (!token || role !== "pharmacy") {
  alert("Access Denied");
  window.location = "login.html";
}


/* =========================
   VERIFY MEDICINE
========================= */

async function verifyMedicine() {

  const id = document.getElementById("medicineId").value;

  if (!id) {
    alert("Enter Medicine ID");
    return;
  }

  try {

    const res = await fetch(`http://localhost:3000/api/get-medicine?id=${id}`);
    const data = await res.json();

    const resultBox = document.getElementById("result");

    if (!data.exists) {
      resultBox.innerHTML = "<p>❌ Medicine not found</p>";
      return;
    }

    resultBox.innerHTML = `
  <p><b>ID:</b> ${data.id}</p>
  <p><b>Name:</b> ${data.name}</p>
  <p><b>Batch:</b> ${data.batchNumber}</p>
  <p><b>Manufacturer:</b> ${data.manufacturer}</p>
  <p><b>Quantity:</b> ${data.quantity}</p>
  <p><b>Owner:</b> ${data.currentOwner}</p>
  <p style="color:lightgreen"><b>Status:</b> Authentic Medicine ✅</p>
`;

// Save verified medicine locally
let verified = JSON.parse(localStorage.getItem("verifiedMedicines")) || [];

if (!verified.includes(data.id)) {
  verified.push(data.id);
  localStorage.setItem("verifiedMedicines", JSON.stringify(verified));
}

  } catch (error) {
    console.error(error);
  }

}

/* =========================
   LOAD RECEIVED MEDICINES
========================= */

async function loadReceivedMedicines() {

  try {

    const res = await fetch("http://localhost:3000/api/receive-product", {
      headers: {
        "Authorization": "Bearer " + token
      }
    });

    const data = await res.json();

    const container = document.getElementById("medicineCards");

    if (!container) return;

    container.innerHTML = "";

    if (!data.length) {
      container.innerHTML = "<p>No medicines received yet</p>";
      return;
    }

    data.forEach(med => {

      const card = document.createElement("div");
      card.className = "glass-card";

      card.innerHTML = `
        <h3>${med.medicineName}</h3>
        <p>ID: ${med.medicineId}</p>
        <p>Quantity: ${med.quantity}</p>
        <p class="owner">Owner: ${med.owner}</p>
      `;

      container.appendChild(card);

    });

  } catch (error) {
    console.log(error);
  }

}

/* Auto load when page opens */
loadReceivedMedicines();


async function loadDashboardStats() {

  try {

    const res = await fetch("http://localhost:3000/api/receive-product", {
      headers: {
        "Authorization": "Bearer " + token
      }
    });

    const data = await res.json();

    // Total medicines count
    document.getElementById("totalMedicines").innerText = data.length;

    // Available stock (sum of quantity)
    let totalStock = 0;

    data.forEach(med => {
      totalStock += med.quantity || 0;
    });

    document.querySelectorAll(".card p")[2].innerText = totalStock;

  } catch (error) {
    console.log(error);
  }

}

let verified = JSON.parse(localStorage.getItem("verifiedMedicines")) || [];

document.querySelectorAll(".card p")[1].innerText = verified.length;

loadDashboardStats();
