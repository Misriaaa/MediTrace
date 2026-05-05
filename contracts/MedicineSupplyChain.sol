// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MedicineSupplyChain {

    enum Role { None, Manufacturer, Distributor, Pharmacy }

    struct Medicine {
        uint id;
        string name;
        string batchNumber;
        string manufacturerName;
        string manufactureDate;
        string expiryDate;
        address currentOwner;
        bool exists;
    }
    event MedicineTransferred(
         uint medicineId,
         address from,
         address to,
         uint timestamp     
    );
    event MedicineCreated(
        uint medicineId,
        string name,
        address manufacturer
    );

    uint public medicineCount = 0;

    mapping(uint => Medicine) public medicines;
    mapping(address => Role) public roles;

    /* =============================
       REGISTER ROLES
    ============================== */

    function registerManufacturer(address _user) public {
        roles[_user] = Role.Manufacturer;
    }

    function registerDistributor(address _user) public {
        roles[_user] = Role.Distributor;
    }

    function registerPharmacy(address _user) public {
        roles[_user] = Role.Pharmacy;
    }

    /* =============================
       ADD MEDICINE
       Only Manufacturer
    ============================== */

    function addMedicine(
        string memory _name,
        string memory _batchNumber,
        string memory _manufacturerName,
        string memory _manufactureDate,
        string memory _expiryDate
    ) public {

        require(
            roles[msg.sender] == Role.Manufacturer,
            "Only Manufacturer can add"
        );

    medicineCount++;

emit MedicineCreated(
medicineCount,
_name,
msg.sender
);

        medicines[medicineCount] = Medicine(
            medicineCount,
            _name,
            _batchNumber,
            _manufacturerName,
            _manufactureDate,
            _expiryDate,
            msg.sender,
            true
        );
    }

    /* =============================
       TRANSFER MEDICINE
    ============================== */

    function transferMedicine(uint _id, address _to) public {

        require(medicines[_id].exists, "Medicine does not exist");

        require(
            medicines[_id].currentOwner == msg.sender,
            "Not owner"
        );

        Role senderRole = roles[msg.sender];
        Role receiverRole = roles[_to];

        // Manufacturer → Distributor
        if (senderRole == Role.Manufacturer) {

            require(
                receiverRole == Role.Distributor,
                "Manufacturer can only transfer to Distributor"
            );

        }

        // Distributor → Pharmacy
        else if (senderRole == Role.Distributor) {

            require(
                receiverRole == Role.Pharmacy,
                "Distributor can only transfer to Pharmacy"
            );

        }

        // Pharmacy cannot transfer
        else {

            revert("Transfer not allowed");

        }

       medicines[_id].currentOwner = _to;

       emit MedicineTransferred(
          _id,
          msg.sender,
          _to,
          block.timestamp
        );
    }



    /* =============================
       VERIFY MEDICINE
    ============================== */

    function verifyMedicine(uint _id)
        public
        view
        returns (
            uint,
            string memory,
            string memory,
            string memory,
            string memory,
            string memory,
            address
        )
    {
        require(medicines[_id].exists, "Medicine not found");

        Medicine memory med = medicines[_id];

        return (
            med.id,
            med.name,
            med.batchNumber,
            med.manufacturerName,
            med.manufactureDate,
            med.expiryDate,
            med.currentOwner
        );
    }

}