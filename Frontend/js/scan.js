let scanner;

function onScanSuccess(decodedText) {

    console.log("QR Data:", decodedText);

    try {

        // Extract ID from URL
        const url = new URL(decodedText);
        const medicineId = url.searchParams.get("id");

        if (!medicineId) {
            throw new Error("No ID found");
        }

        // Stop scanner after success
        scanner.clear();

        verifyMedicine(medicineId);

    } catch (error) {

        document.getElementById("scanResult").innerHTML =
        `<p style="color:red">❌ Invalid QR Code</p>`;

    }
}

// Start scanner
scanner = new Html5QrcodeScanner("reader", {
    fps: 10,
    qrbox: 250
});

scanner.render(onScanSuccess);

// 🔍 VERIFY MEDICINE
async function verifyMedicine(id) {

    try {

        const res = await fetch(
            `http://localhost:3000/api/track-medicine?id=${id}`
        );

        const data = await res.json();

        // ❌ FAKE
        if (data.message) {
            document.getElementById("scanResult").innerHTML = `
                <div class="result-box fake">
                    ❌ Fake Medicine Detected
                </div>
            `;
            return;
        }

        // ✅ GENUINE
        let historyHTML = "";

        data.history.forEach(h => {
            historyHTML += `
                <p>🔹 ${h.role} → ${h.action}</p>
            `;
        });

        document.getElementById("scanResult").innerHTML = `
            <div class="result-box genuine">
                <h3>✅ Medicine Verified</h3>

                <p><b>Name:</b> ${data.name}</p>
                <p><b>ID:</b> ${data.medicineId}</p>
                <p><b>Batch:</b> ${data.batchNumber}</p>
                <p><b>Owner:</b> ${data.currentOwner}</p>

                <hr>

                <h4>📦 History</h4>
                ${historyHTML}
            </div>
        `;

    } catch (error) {

        document.getElementById("scanResult").innerHTML =
        `<p style="color:red">Server Error</p>`;

    }

}