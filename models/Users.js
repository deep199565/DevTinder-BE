const mongoose =require('mongoose')

const userSchema=mongoose.Schema({
    firstName:{
        type:String,
        required:true
    },
    lastName:{
        type:String,
    },
    email:{
        type:String,
        unique:true,
        required:true
    },
    mobileNo:{
        type:Number,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    gender:{
        type:String,
    },
    aboutMe:{
        type:String,
        required:true
    },
    imgUrl:{
        type:String,
        required:true
    },
    age:{
        type:Number,
        required:true
    },
    city:{
        type:String,
        required:true
    },
    country:{
        type:String,
        required:true
    },
})
const UserModal=mongoose.model('User',userSchema)
const ConnectionRequestSchema=mongoose.Schema({
    fromUserId:{
    type: mongoose.Schema.Types.ObjectId,
    ref:UserModal,
    required:true
    },
    toUserId:{
      type:mongoose.Schema.Types.ObjectId,
      required:true,
      ref:UserModal
    },
    status:{
        type:String,
        required:true,
        enum:{
        values: ["ignored", "interested", "accepted", "rejected"],
        message: `{VALUE} is incorrect status type`,
        }
    }
},{timestamps:true})


const ConnectionRequestModal=mongoose.model('ConnectionRequest',ConnectionRequestSchema)

module.exports={
    UserModal,
    ConnectionRequestModal
}