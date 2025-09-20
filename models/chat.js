const mongoose=require('mongoose')

const messageschema= new mongoose.Schema({
    senderId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"User"
    },
    text:{
        type:String,
        required:true
    }
},{timestamps:true})

const chatschema= new mongoose.Schema({
    participate:[{type:mongoose.Schema.Types.ObjectId,required:true,ref:"User"}],
    messages:[messageschema]
})

const chatmodel=mongoose.model('chat',chatschema)

module.exports={chatmodel}