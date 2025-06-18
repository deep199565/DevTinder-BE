const {UserModal,ConnectionRequestModal}=require('../models/Users')
const {validationResult}=require('express-validator')
const bcrypt=require("bcrypt")
const jwt=require('jsonwebtoken')
const USER_SAFE_DATA = "firstName lastName";

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
    console.log('conection',isconnnectionRequestPresent)
    const data=await ConnectionRequestModal.findByIdAndUpdate(requestId,{status:status})
    return  res.send({
      message:`Connection Request  ${status}`,
    })
  }
  catch(error){
  return res.send({
    message:error.message
  })
  }
}



async function getconnectionrequestofuser(req,res){
   try{
   let user=req.user
   let id=user._id
   let allconnectionRequest=await ConnectionRequestModal.find({toUserId:id,status:"interested"}).populate("fromUserId",["firstName","lastName"])
   if(allconnectionRequest.length==0){
        return res.send({
          message:"No request"
        })
   }
   console.log(allconnectionRequest)
   res.send({
    data:allconnectionRequest
   })
   }
   catch(errro){
    res.send({
      message:error.message
    })
   }
}

async function getallconnectionofuser(req,res){
   try{
   let user=req.user
   let id=user._id
   let allconnection=await ConnectionRequestModal.find({$or: [
        { toUserId: user._id, status: "accepted" },
        { fromUserId: user._id, status: "accepted" },
      ],}).populate("fromUserId",["firstName","lastName"])
      .populate("toUserId",["firstName","lastName"])
   if(allconnection.length==0){
        return res.send({
          message:"No Connection Found"
        })
   }
   console.log(allconnection)
   res.send({
    data:allconnection
   })
   }
   catch(error){
    res.send({
      message:error.message
    })
   }
}

async function getuser(req,res){
   try{
  let user= req.user
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit = limit > 50 ? 50 : limit;
    const skip = (page - 1) * limit;
   let connectionrequest=await ConnectionRequestModal.find({$or:[{toUserId:user._id},{fromUserId:user.id}]})

   let hideuser=new Set();
    connectionrequest.forEach((res)=>{
      hideuser.add(res.fromUserId.toString())
      hideuser.add(res.toUserId.toString())
    })
    
    const users = await UserModal.find({
      $and: [
        { _id: { $nin: Array.from(hideUsersFromFeed) } },
        { _id: { $ne: loggedInUser._id } },
      ],
    }) .select(USER_SAFE_DATA)
      .skip(skip)
      .limit(limit);
   if(users.length==0){
        return res.send({
          message:"No user Found"
        })
   }
   res.send({
    data:users
   })
   }
   catch(errro){
    res.send({
      message:error.message
    })
   }
}
module.exports={signup,login,userview,connectionRequest,reviewconnectionRequest,getconnectionrequestofuser,getallconnectionofuser,getuser}
  