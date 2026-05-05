import dotenv from "dotenv";
dotenv.config();

import express from "express";
import Web3 from "web3";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";

import User from "./models/User.js";
import Product from "./models/Product.js";

import { fileURLToPath } from "url";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "../frontend")));

/* ===========================
   ✅ AUTH MIDDLEWARE
=========================== */
const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(400).json({ message: "Invalid token" });
  }
};

/* ===========================
   ✅ MongoDB Connection
=========================== */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.error("MongoDB Connection Error ❌", err));

/* ===========================
   ✅ Blockchain Connection
=========================== */

const web3 = new Web3("http://127.0.0.1:8545");


const contractPath = path.join(
  __dirname,
  "../artifacts/contracts/MedicineSupplyChain.sol/MedicineSupplyChain.json"
);

const contractJson = JSON.parse(fs.readFileSync(contractPath, "utf8"));
const abi = contractJson.abi;

const contract = new web3.eth.Contract(
  abi,
  process.env.CONTRACT_ADDRESS
);

const admin = web3.eth.accounts.privateKeyToAccount(process.env.ADMIN_PRIVATE_KEY);

const manufacturers = [
process.env.MANUFACTURER1_PRIVATE_KEY,
process.env.MANUFACTURER2_PRIVATE_KEY,
process.env.MANUFACTURER3_PRIVATE_KEY,
process.env.MANUFACTURER4_PRIVATE_KEY,
process.env.MANUFACTURER5_PRIVATE_KEY
].map(pk => web3.eth.accounts.privateKeyToAccount(pk));

const distributors = [
process.env.DISTRIBUTOR1_PRIVATE_KEY,
process.env.DISTRIBUTOR2_PRIVATE_KEY,
process.env.DISTRIBUTOR3_PRIVATE_KEY,
process.env.DISTRIBUTOR4_PRIVATE_KEY,
process.env.DISTRIBUTOR5_PRIVATE_KEY,
process.env.DISTRIBUTOR6_PRIVATE_KEY,
process.env.DISTRIBUTOR7_PRIVATE_KEY
].map(pk => web3.eth.accounts.privateKeyToAccount(pk));

const pharmacies = [
process.env.PHARMACY1_PRIVATE_KEY,
process.env.PHARMACY2_PRIVATE_KEY,
process.env.PHARMACY3_PRIVATE_KEY,
process.env.PHARMACY4_PRIVATE_KEY,
process.env.PHARMACY5_PRIVATE_KEY,
process.env.PHARMACY6_PRIVATE_KEY,
process.env.PHARMACY7_PRIVATE_KEY
].map(pk => web3.eth.accounts.privateKeyToAccount(pk));


web3.eth.accounts.wallet.add(admin);

manufacturers.forEach(acc => web3.eth.accounts.wallet.add(acc));
distributors.forEach(acc => web3.eth.accounts.wallet.add(acc));
pharmacies.forEach(acc => web3.eth.accounts.wallet.add(acc));

console.log("Admin:", admin.address);
console.log("Manufacturers:", manufacturers.map(a=>a.address));
console.log("Distributors:", distributors.map(a=>a.address));
console.log("Pharmacies:", pharmacies.map(a=>a.address));

/* ===========================
   🏠 HOME
=========================== */
app.get("/", (req, res) => {
  res.send("🚀 MediTrace Blockchain Server Running");
});

/* ===========================
   ✅ Test Blockchain
=========================== */
async function testBlockchain() {
  try {
    const block = await web3.eth.getBlockNumber();
    console.log("Connected to Blockchain ✅ | Block:", block);

    const count = await contract.methods.medicineCount().call();
    console.log("Medicine Count:", count);
  } catch (err) {
    console.error("Blockchain Error ❌", err);
  }
}

testBlockchain();

/* ===========================
   🔐 AUTH ROUTES
=========================== */

app.post("/api/register", async (req, res) => {
  try {

    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    let walletAddress = "";

    if (role === "manufacturer") {

  const count = await User.countDocuments({ role: "manufacturer" });
  walletAddress = manufacturers[count % manufacturers.length].address;

}

else if (role === "distributor") {

  const count = await User.countDocuments({ role: "distributor" });
  walletAddress = distributors[count % distributors.length].address;

}

else if (role === "pharmacy") {

  const count = await User.countDocuments({ role: "pharmacy" });
  walletAddress = pharmacies[count % pharmacies.length].address;

}


    const newUser = new User({
     name,
     email,
     password: hashedPassword,
     role,
     walletAddress,
     status: "pending"
    });

    await newUser.save();

    res.status(201).json({
      message: "Registration successful! Waiting for admin approval.",
      walletAddress
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

async function createAdmin(){

const existingAdmin = await User.findOne({email:"admin@meditrace.com"});

if(!existingAdmin){

const hashedPassword = await bcrypt.hash("admin123",10);

await User.create({
name:"System Admin",
email:"admin@meditrace.com",
password:hashedPassword,
role:"admin",
walletAddress: admin.address,
status:"approved"
});

console.log("Admin created");

}

}

createAdmin();

app.post("/api/admin/register-manufacturer", authMiddleware, async (req,res)=>{

try{

if(req.user.role !== "admin"){
return res.status(403).json({message:"Admin only"});
}

const {wallet} = req.body;

const tx = await contract.methods
.registerManufacturer(wallet)
.send({
from: admin.address,
gas:300000
});

res.json({
message:"Manufacturer registered on blockchain",
txHash:tx.transactionHash
});

}catch(err){
console.error(err);
res.status(500).json({error:err.message});
}

});

app.post("/api/admin/register-distributor", authMiddleware, async (req,res)=>{

try{

if(req.user.role !== "admin"){
return res.status(403).json({message:"Admin only"});
}

const {wallet} = req.body;

const tx = await contract.methods
.registerDistributor(wallet)
.send({
from: admin.address,
gas:300000
});

res.json({
message:"Distributor registered on blockchain",
txHash:tx.transactionHash
});

}catch(err){
console.error(err);
res.status(500).json({error:err.message});
}

});

app.post("/api/admin/register-pharmacy", authMiddleware, async (req,res)=>{

try{

if(req.user.role !== "admin"){
return res.status(403).json({message:"Admin only"});
}

const {wallet} = req.body;

const tx = await contract.methods
.registerPharmacy(wallet)
.send({
from: admin.address,
gas:300000
});

res.json({
message:"Pharmacy registered on blockchain",
txHash:tx.transactionHash
});

}catch(err){
console.error(err);
res.status(500).json({error:err.message});
}

});


/* ===========================
   LOGIN
=========================== */

app.post("/api/login", async (req, res) => {
  try {

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check password first
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Block non-approved users (except admin)
    if (user.role !== "admin" && user.status !== "approved") {
      return res.status(403).json({
        message: "Your account is waiting for admin approval"
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        walletAddress: user.walletAddress
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      role: user.role,
      walletAddress: user.walletAddress
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

async function restoreBlockchainRoles(){

try{

console.log("Restoring blockchain roles...");

const users = await User.find({status:"approved"});

for(const user of users){

if(user.role === "manufacturer"){

await contract.methods
.registerManufacturer(user.walletAddress)
.send({
from: admin.address,
gas:300000
});

console.log("Manufacturer restored:", user.walletAddress);

}

else if(user.role === "distributor"){

await contract.methods
.registerDistributor(user.walletAddress)
.send({
from: admin.address,
gas:300000
});

console.log("Distributor restored:", user.walletAddress);

}

else if(user.role === "pharmacy"){

await contract.methods
.registerPharmacy(user.walletAddress)
.send({
from: admin.address,
gas:300000
});

console.log("Pharmacy restored:", user.walletAddress);

}

}

console.log("Blockchain roles restored successfully");

}catch(err){

console.error("Role restore error:",err);

}

}

/* ===========================
   ADMIN - APPROVE USER
=========================== */
app.post("/api/admin/approve-user", authMiddleware, async (req,res)=>{

  try{

    if(req.user.role !== "admin"){
      return res.status(403).json({message:"Admin only"});
    }

    const {email} = req.body;

    const user = await User.findOne({email});

    if(!user){
      return res.status(404).json({message:"User not found"});
    }

    if(user.status === "approved"){
      return res.json({message:"User already approved"});
    }

    user.status = "approved";
    await user.save();

    let tx;

    /* REGISTER ROLE ON BLOCKCHAIN */

    if(user.role === "manufacturer"){

      tx = await contract.methods
        .registerManufacturer(user.walletAddress)
        .send({
          from: admin.address,
          gas: 300000
        });

    }

    else if(user.role === "distributor"){

      tx = await contract.methods
        .registerDistributor(user.walletAddress)
        .send({
          from: admin.address,
          gas: 300000
        });

    }

    else if(user.role === "pharmacy"){

      tx = await contract.methods
        .registerPharmacy(user.walletAddress)
        .send({
          from: admin.address,
          gas: 300000
        });

    }

    res.json({
      message:"User approved and registered on blockchain",
      txHash: tx.transactionHash
    });

  }catch(err){

    console.error(err);
    res.status(500).json({error:err.message});

  }

});

/* ===========================
   ADMIN - DELETE USER
=========================== */

app.delete("/api/admin/delete-user/:id", authMiddleware, async (req,res)=>{

  try{

    if(req.user.role !== "admin"){
      return res.status(403).json({message:"Admin only"});
    }

    const user = await User.findById(req.params.id);

    if(!user){
      return res.status(404).json({message:"User not found"});
    }

    if(user.role === "admin"){
      return res.status(400).json({message:"Admin cannot be deleted"});
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({message:"User deleted successfully"});

  }catch(err){

    res.status(500).json({error:err.message});

  }

});

/* ===========================
   ADMIN - GET USERS
=========================== */

app.get("/api/admin/users", authMiddleware, async (req,res)=>{

try{

if(req.user.role !== "admin"){
return res.status(403).json({message:"Admin only"});
}

const users = await User.find();

res.json(users);

}catch(err){

res.status(500).json({error:err.message});

}

});

/* ===========================
   ADMIN DASHBOARD STATS
=========================== */

app.get("/api/admin/stats", authMiddleware, async (req,res)=>{

try{

if(req.user.role !== "admin"){
return res.status(403).json({message:"Admin only"});
}

const totalUsers = await User.countDocuments({role:{$ne:"admin"}});
const pendingUsers = await User.countDocuments({status:"pending"});
const totalMedicines = await Product.countDocuments();
const totalTransactions = await Product.countDocuments();
res.json({
totalUsers,
pendingUsers,
totalMedicines,
totalTransactions
});

}catch(err){

res.status(500).json({error:err.message});

}

});

/* ===========================
   💊 ADD MEDICINE (UPDATED)
=========================== */

app.post("/api/add-medicine", authMiddleware, async (req, res) => {

  const { 
    name,
    brand,
    batchNumber,
    manufacturerName,
    quantity,
    manufactureDate,
    expiryDate
  } = req.body;

  if (!name || !brand || !batchNumber || !manufacturerName || !quantity || !manufactureDate || !expiryDate) {
    return res.status(400).json({
      message: "Provide all medicine details."
    });
  }

  try {

    if (req.user.role !== "manufacturer") {
      return res.status(403).json({
        message: "Only manufacturer can add medicine."
      });
    }

    const walletAddress = req.user.walletAddress.toLowerCase();

const senderAccount = manufacturers.find(
  m => m.address.toLowerCase() === walletAddress
);

if(!senderAccount){
  return res.status(400).json({
    message:"Manufacturer wallet not found in server"
  });
}

const gas = await contract.methods
  .addMedicine(
    name,
    batchNumber,
    manufacturerName,
    manufactureDate,
    expiryDate
  )
  .estimateGas({ from: senderAccount.address });

const receipt = await contract.methods
  .addMedicine(
    name,
    batchNumber,
    manufacturerName,
    manufactureDate,
    expiryDate
  )
  .send({
    from: senderAccount.address,
    gas
  });

    const medicineId = await contract.methods.medicineCount().call();
const medicineIdNumber = Number(medicineId);

    const newProduct = new Product({
      medicineId: medicineIdNumber,
      medicineName: name,
      brand,
      batchNumber,
      manufacturerName,
      quantity,
      manufactureDate,
      expiryDate,
      owner: walletAddress,

      history: [
        {
          role: "Manufacturer",
          action: "Created",
          address: walletAddress,
          date: new Date()
        }
      ]
    });

    const existing = await Product.findOne({ medicineId });

if(existing){
return res.status(400).json({
message:"Medicine ID already exists"
});
}

    await newProduct.save();

    res.json({
      message: "Medicine added successfully!",
      medicineId,
      txHash: receipt.transactionHash
    });

  } catch (error) {
    console.error("Add Medicine Error:", error);
    res.status(500).json({ error: error.message });
  }

});

/* ===========================
   GET DISTRIBUTORS
=========================== */

app.get("/api/distributors", async (req,res)=>{

try{

const distributors = await User.find({
role:"distributor",
status:"approved"
}).select("name walletAddress");

res.json(distributors);

}catch(err){

res.status(500).json({error:err.message});

}

});

app.get("/api/pharmacies", async (req,res)=>{

try{

const pharmacies = await User.find({
role:"pharmacy",
status:"approved"
}).select("name walletAddress");

res.json(pharmacies);

}catch(err){

res.status(500).json({error:err.message});

}

});

/* ===========================
   🔄 TRANSFER MEDICINE + SAVE HISTORY
=========================== */

app.post("/api/transfer-medicine", authMiddleware, async (req, res) => {

  const { id, to } = req.body;

  if (!id || !to) {
    return res.status(400).json({ message: "Provide medicine ID and receiver address." });
  }

  try {

    const medicine = await contract.methods.medicines(id).call();
    const currentOwner = medicine.currentOwner.toLowerCase();

    const userWallet = req.user.walletAddress.toLowerCase();

    let senderAccount;
    let receiverAddress = to;
    let fromRole;
    let toRole;

    // Ownership check
    if (currentOwner !== userWallet) {
      return res.status(400).json({
        error: "You are not the current owner"
      });
    }

    // Manufacturer -> Distributor
    if (req.user.role === "manufacturer") {

      senderAccount = manufacturers.find(
m => m.address.toLowerCase() === userWallet
);
      fromRole = "Manufacturer";
      toRole = "Distributor";

    }

    // Distributor -> Pharmacy
    else if (req.user.role === "distributor") {

      senderAccount = distributors.find(
d => d.address.toLowerCase() === userWallet
);
      fromRole = "Distributor";
      toRole = "Pharmacy";

    }

    else {

      return res.status(403).json({
        message: "Transfer not allowed for this role"
      });

    }

    const gas = await contract.methods
      .transferMedicine(id, receiverAddress)
      .estimateGas({ from: senderAccount.address });

    const receipt = await contract.methods
      .transferMedicine(id, receiverAddress)
      .send({
        from: senderAccount.address,
        gas
      });

    let actionText = "";

if (req.user.role === "manufacturer") {
  actionText = "Shipped to Distributor";
} else if (req.user.role === "distributor") {
  actionText = "Transferred to Pharmacy";
}

await Product.findOneAndUpdate(
  { medicineId: id },
  {
    owner: receiverAddress.toLowerCase(),
    $push: {
      history: {
        role: toRole,
        action: actionText,   // ✅ FIXED
        address: receiverAddress,
        date: new Date()
      }
    }
  }
);

    res.json({
      message: "Medicine transferred successfully!",
      txHash: receipt.transactionHash
    });

  } catch (error) {

    console.error("Transfer Error:", error);

    res.status(500).json({
      error: error.message
    });

  }

});
/* ===========================
   📜 GET ALL TRANSACTIONS (ADMIN)
=========================== */

app.get("/api/transactions", async (req, res) => {
  try {

    const products = await Product.find();

    let transactions = [];

    products.forEach(product => {

      if (product.history && product.history.length > 0) {

        product.history.forEach(tx => {

          transactions.push({
medicineId: product.medicineId,
medicineName: product.medicineName,
action: tx.action,
actor: tx.address,
date: tx.date
});

        });

      }

    });

    res.json({
      success: true,
      transactions
    });

  } catch (error) {

    console.error("Transaction Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }
});

/* ===========================
   🔍 GET MEDICINE FROM BLOCKCHAIN
=========================== */

app.get("/api/get-medicine", async (req, res) => {

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: "Provide medicine ID." });
  }

  try {

    // 🔗 Blockchain data
    const medicine = await contract.methods.medicines(id).call();

    // 🗄️ MongoDB data
    const product = await Product.findOne({ medicineId: id });

    if (!product) {
      return res.json({ exists: false });
    }

    res.json({
      exists: true,
      id: product.medicineId,
      name: product.medicineName,
      quantity: product.quantity,   // ✅ from DB
      batchNumber: product.batchNumber,
      manufacturer: product.manufacturerName,
      currentOwner: medicine.currentOwner
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }

});

/* ===========================
   🔎 MEDICINE FULL TRACKING
=========================== */

app.get("/api/track-medicine", async (req, res) => {

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({
      message: "Provide medicine ID."
    });
  }

  try {

    // 1️⃣ Get blockchain data
    const medicine = await contract.methods.medicines(id).call();

    // 2️⃣ Get database history
    const product = await Product.findOne({
      medicineId: id
    });

    if (!product) {
      return res.json({
        message: "Medicine not found"
      });
    }

    res.json({
  success: true,
  medicineId: product.medicineId,
  name: product.medicineName,
  batchNumber: product.batchNumber,
  manufacturer: product.manufacturerName,
  manufactureDate: product.manufactureDate,
  expiryDate: product.expiryDate,
  currentOwner: medicine.currentOwner,
  history: product.history || []
});

  } catch (error) {

    console.error("Tracking Error:", error);

    res.status(500).json({
      error: error.message
    });

  }

});

// GET MEDICINE HISTORY
app.get("/api/history/:id", async (req, res) => {
  try {
    const medicineId = req.params.id;

    const product = await Product.findOne({ medicineId });
    console.log("Track Debug product:", product);

    if (!product) {
      return res.json({ success: false, message: "Medicine not found" });
    }

    res.json({
      success: true,
      medicineId: product.medicineId,
      name: product.medicineName,
      owner: product.owner,
      history: product.history
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

/* ===========================
   📦 GET ALL PRODUCTS (Manufacturer)
=========================== */
app.get("/api/my-products", authMiddleware, async (req, res) => {
  try {

    const wallet = req.user.walletAddress.toLowerCase();

    const products = await Product.find({
      $or: [
        { owner: wallet },
        { "history.address": wallet }   // ✅ THIS FIX
      ]
    });

    res.json(products);

  } catch (error) {
    console.error("Fetch products error:", error);
    res.status(500).json({ message: "Server error" });
  }
});


app.get("/api/receive-product", authMiddleware, async (req, res) => {

  try {

    const walletAddress = req.user.walletAddress.toLowerCase();

    const products = await Product.find({
      $or: [
        { owner: walletAddress },
        { "history.address": { $regex: walletAddress, $options: "i" } } // ✅ FIX
      ]
    });

    res.json(products);

  } catch (error) {
    console.error("Fetch received products error:", error);
    res.status(500).json({ message: "Server error" });
  }

});

/* ===========================
   🚀 START SERVER
=========================== */

app.listen(PORT, async () => {

console.log(`Server running on http://localhost:${PORT}`);

await restoreBlockchainRoles();

}); 