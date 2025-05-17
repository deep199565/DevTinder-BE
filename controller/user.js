const {UserModal,ConnectionRequestModal}=require('../models/Users')
const {validationResult}=require('express-validator')
const bcrypt=require("bcrypt")
const jwt=require('jsonwebtoken')

async function signup(req,res){
    try{
        const errors=validationResult(req)
    
      if (!errors.isEmpty()) {
        return res.status(400).json({
            message: 'All fields are required',
            error: errors.array(),
            ResponseCode: 400
        })
    }  
    const hashpassword=await bcrypt.hash(req.body.password,10)
    const user=  await UserModal.insertOne({...req.body,password:hashpassword})
      if(user){
        res.send("User added successfully")
      }
      else{
        res.status(400).send({
            "Error":error.array()
        })
      }
        }
        catch(err){
        res.status(500).send('Something Went Wrong')
        }
    
}
async function login(req,res){
try{

  const error=validationResult(req)
  if(!error.isEmpty()){
return res.send({
message:error.array()
})
  }
 const {email,password}=req.body
 console.log('email',email)
  const user=await UserModal.findOne({email:email})
  console.log(user)
  if(!user){
return res.send({
  message:"Invalid Credential"
})
  }
  const isPassword=await bcrypt.compare(password,user.password)
  if(!isPassword){
    return res.send({
      message:"Invalid Credentail"
    })
  }
  const token = await jwt.sign({ _id: user._id }, "Dm@503503", {
    expiresIn: "7d",
  });
  res.cookie("token", token, {
    expires: new Date(Date.now() + 8 * 3600000),
  });
  res.send({
    message:"Login successfully",
    token:token
  })
}

catch(error){
  res.json({
    message:error.message
  })
}
}
async function userview(req,res){
  try{
    const data=req.user
    const id=data._id
   const user=await UserModal.findById({_id:id})
   if(!user){
       return res.status(500).send({
        message:"User not found"
       })
   }
   return res.send({
    user:user
   })
  }
  catch(error){
    return res.send({
      message:error.message
    })
  }
}
 

async function connectionRequest(req,res){
try{
  const user=req.user
  const toUserId=req.params.requestId
  const fromUserId= user._id.toString()
  const status=req.params.status
  const allowedStatus=['interested','ignored']
  const isAllowed=allowedStatus.includes(status)
  if(!isAllowed){
    return res.send({
      message:"Invalid Status"
    })
  }

  const isuserAlready=await ConnectionRequestModal.findOne({$or:[{fromUserId,toUserId},{fromUserId:toUserId,toUserId:fromUserId}]})

  if(isuserAlready){
  return res.send({
    message:"Connection request already send"
  })
  }
  if(fromUserId==toUserId){
    return res.send({
      messsage:"Bad request"
    })
  }
  const data=await ConnectionRequestModal.insertOne({fromUserId,toUserId,status})
  return  res.send({
    message:"Connection Request Sent",
  })
}
catch(error){
return res.send({
  message:error.message
})
}
}
async  function reviewconnectionRequest(req,res){
  try{
    const user=req.user
    const requestId=req.params.requestId
    const fromUserId= user._id.toString()
    const status=req.params.status
    const allowedStatus=['accepted','rejected']
    const isAllowed=allowedStatus.includes(status)
    if(!isAllowed){
      return res.send({
        message:"Invalid Status"
      })
    }

    const isconnnectionRequestPresent=await ConnectionRequestModal.findOne({_id:requestId,toUserId:fromUserId,status:"interested"})

    if(!isconnnectionRequestPresent){
      return res.send({
        message:"Connection Request not present"
      })
    }
    const data=await ConnectionRequestModal.insertOne({fromUserId,requestId,status})
    return  res.send({
      message:`Connection Request + ${status}}`,
    })
  }
  catch(error){
  return res.send({
    message:error.message
  })
  }
}
module.exports={signup,login,userview,connectionRequest,reviewconnectionRequest}
  