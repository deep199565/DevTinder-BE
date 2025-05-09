const mongoose =require("mongoose")

const connectDB=async(req,res)=>{
    await mongoose.connect("mongodb://localhost:27017/User")
}

module.exports={connectDB}