const jwt =require('jsonwebtoken')
const {UserModal}=require('../models/Users')

async function authcheck(req,res,next){
 try{
  const {token}=req.cookies
  if(!token){
    return res.send({
        message:"Unathorized",
        ResponseCode:401
    })
  }

  const isVerify=await jwt.verify(token,'Dm@503503')
  if(!isVerify){
    return res.send({
        message:"Unauthorized",
        ResponseCode:401
    })
  }
  const {_id}=isVerify
  const user= await UserModal.findById(_id)
  if (!user) {
    throw new Error("User not found");
  }
   req.user=user
   next()
 }
 catch(error){
    return res.send({
        message:error.message
    })
 }
}
module.exports={authcheck}