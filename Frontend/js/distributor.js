const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

if (!token || role !== "distributor") {
  alert("Access Denied");
  window.location = "login.html";
}

async function transferMedicine() {

const id = document.getElementById("medicineId").value;
const to = document.getElementById("pharmacySelect").value;

if (!id || !to) {
alert("Enter Medicine ID and Select Pharmacy");
return;
}

try {

const response = await fetch("http://localhost:3000/api/transfer-medicine", {
method: "POST",
headers: {
"Content-Type": "application/json",
"Authorization": "Bearer " + token
},
body: JSON.stringify({ id, to })
});

const data = await response.json();

if (data.txHash) {
alert("Medicine Transferred to Pharmacy ✅");
} else {
alert(data.error || "Transfer Failed");
}

} catch (error) {

console.error(error);
alert("Server Error");

}

}

async function loadReceivedMedicines() {

    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:3000/api/receive-product", {
        headers: {
            "Authorization": "Bearer " + token
        }
    });

    const medicines = await res.json();

    const container = document.getElementById("medicineCards");
    container.innerHTML = "";

    medicines.forEach(med => {

        const card = `
        <div class="glass-card">
            <h3>${med.medicineName}</h3>
            <p><b>ID:</b> ${med.medicineId}</p>
            <p><b>Batch:</b> ${med.batchNumber}</p>
            <p><b>Expiry:</b> ${med.expiryDate}</p>
            <p class="owner">${med.owner}</p>
        </div>
        `;

        container.innerHTML += card;

    });

}
if (window.location.pathname.includes("receive-product.html")) {
    loadReceivedMedicines();
}

async function loadPharmacies() {

const res = await fetch("http://localhost:3000/api/pharmacies");
const pharmacies = await res.json();

const dropdown = document.getElementById("pharmacySelect");

pharmacies.forEach(pharmacy => {

const option = document.createElement("option");

option.value = pharmacy.walletAddress;
option.textContent = pharmacy.name;

dropdown.appendChild(option);

});

}

if (window.location.pathname.includes("transfer-medicine.html")) {
    loadPharmacies();
}

async function loadDistributorStats() {

  try {

    const res = await fetch("http://localhost:3000/api/receive-product", {
      headers: {
        "Authorization": "Bearer " + token
      }
    });

    const data = await res.json();

    let totalReceived = data.length;
    let transferred = 0;
    let pending = 0;

    data.forEach(med => {

      let isTransferred = false;

      med.history?.forEach(h => {
        if (
          h.action && h.action.includes("Transferred to Pharmacy")
        ) {
          isTransferred = true;
        }
      });

      if (isTransferred) {
        transferred++;
      } else {
        pending++;
      }

    });

    document.getElementById("totalReceived").innerText = totalReceived;
    document.getElementById("totalTransferred").innerText = transferred;
    document.getElementById("totalPending").innerText = pending;

  } catch (error) {
    console.log(error);
  }

}
if(document.getElementById("totalReceived")){
loadDistributorStats();
}

async function loadTransferredProducts() {

  const res = await fetch("http://localhost:3000/api/receive-product", {
    headers: {
      "Authorization": "Bearer " + token
    }
  });

  const data = await res.json();

  const container = document.getElementById("transferredContainer");
  if (!container) return;

  container.innerHTML = "";

  let found = false;

  data.forEach(product => {

    if (!product.history) return;

    const last = product.history[product.history.length - 1];

    if (last.role === "Pharmacy") {

      found = true;

      container.innerHTML += `
        <div class="glass-card">
          <h3>${product.medicineName}</h3>
          <p>ID: ${product.medicineId}</p>
          <p>Batch: ${product.batchNumber}</p>
          <p style="color:lightgreen">Transferred ✅</p>
        </div>
      `;
    }

  });

  if (!found) {
    container.innerHTML = "<p>No transferred medicines found</p>";
  }

}
if (window.location.pathname.includes("transferred-products.html")) {
  loadTransferredProducts();
}