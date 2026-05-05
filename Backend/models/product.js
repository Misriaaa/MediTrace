import mongoose from "mongoose";

const productSchema = new mongoose.Schema({

medicineId:{
type:Number,
required:true
},

medicineName:{
type:String,
required:true
},

brand:String,

batchNumber:{
type:String,
unique:true
},

manufacturerName:String,

quantity:Number,

manufactureDate:String,

expiryDate:String,

owner:String,

history:[
{
role:String,
name:String,
action:String,
address:String,
date:{
type:Date,
default:Date.now
}
}
]

});

export default mongoose.model("Product",productSchema);