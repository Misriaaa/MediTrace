const token = localStorage.getItem("token");

async function getHistory() {

    const id = document.getElementById("medicineId").value;

    if (!id) {
        alert("Enter Medicine ID");
        return;
    }

    try {

        const res = await fetch(`http://localhost:3000/api/get-medicine?id=${id}`);

        const data = await res.json();

        const box = document.getElementById("historyResult");

        if (!data || !data.exists) {
            box.innerHTML = "<p>❌ Medicine not found</p>";
            return;
        }

        let stage = "";

        const manufacturer = "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266".toLowerCase();
        const distributor = "0x70997970c51812dc3a010c7d01b50e0d17dc79c8".toLowerCase();
        const pharmacy = "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc".toLowerCase();

        const owner = data.currentOwner.toLowerCase();

        if (owner === manufacturer) {
            stage = "🏭 Manufacturer";
        }
        else if (owner === distributor) {
            stage = "🚚 Distributor";
        }
        else if (owner === pharmacy) {
            stage = "💊 Pharmacy";
        }

        box.innerHTML = `
            <h3>Medicine Details</h3>
            <p><b>ID:</b> ${data.id}</p>
            <p><b>Name:</b> ${data.name}</p>
            <p><b>Description:</b> ${data.description}</p>

            <h3>Supply Chain Status</h3>

            <p>🏭 Manufacturer → Created</p>
            <p>🚚 Distributor → ${owner === distributor || owner === pharmacy ? "Received ✅" : "Pending"}</p>
            <p>💊 Pharmacy → ${owner === pharmacy ? "Delivered ✅" : "Pending"}</p>
        `;

    } catch (error) {

        console.error(error);
        alert("Server Error");

    }

}