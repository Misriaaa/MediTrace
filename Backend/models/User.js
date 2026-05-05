import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

name: {
type: String,
required: true
},

email: {
type: String,
required: true,
unique: true
},

password: {
type: String,
required: true
},

role: {
type: String,
enum: ["manufacturer","distributor","pharmacy","admin"],
required: true
},

walletAddress: {
type: String,
required: true
},

status: {
type: String,
enum: ["pending","approved"],
default: "pending"
}

}, { timestamps: true });

export default mongoose.model("User", userSchema);