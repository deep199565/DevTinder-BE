const {UserModal,ConnectionRequestModal}=require('../models/Users')
const {validationResult}=require('express-validator')
const {chatmodel}=require('../models/chat')
const bcrypt=require("bcrypt")
const mongoose=require('mongoose')
const jwt=require('jsonwebtoken')
const {sendmail}=require('../middleware/mailer')
const USER_SAFE_DATA = "firstName lastName aboutMe imgUrl age city country";

async function signup(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'All fields are required',
        error: errors.array(),
        ResponseCode: 400
      });
    }

    const hashpassword = await bcrypt.hash(req.body.password, 10);

    // Create new user and save
    const user = new UserModal({ ...req.body, password: hashpassword });
    const savedUser = await user.save();
    console.log("Saved user:", savedUser);

    sendmail(req.body.email, 'Welcome', 'Welcome to DevTinder! Now you can make connections.');

    res.send({
      ResponseCode: 200,
      Message: "User added successfully",
      user: savedUser
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).send({
      message: error.message,
      error
    });
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
  const user=await UserModal.findOne({email:email})
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
  httpOnly: true,
  secure: true, // must be HTTPS in production
  sameSite: "None", // allows cross-site cookie
  maxAge: 24*60*60*1000
});
  res.send({
    ResponseCode:200,
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
 

async function connectionRequest(req, res) {
  try {
    const user = req.user;
    const toUserId = req.params.requestId;
    const fromUserId = user._id.toString();
    const status = req.params.status;

    const allowedStatus = ['interested', 'ignored'];
    if (!allowedStatus.includes(status)) {
      return res.send({ message: "Invalid Status" });
    }

    if (fromUserId === toUserId) {
      return res.send({ message: "Bad request" });
    }

    // Check if request already exists
    const isAlready = await ConnectionRequestModal.findOne({
      $or: [
        { fromUserId, toUserId },
        { fromUserId: toUserId, toUserId: fromUserId }
      ]
    });

    if (isAlready) {
      return res.send({ message: "Connection request already sent" });
    }

    // Create new connection request
    const newRequest = new ConnectionRequestModal({ fromUserId, toUserId, status });
    const savedRequest = await newRequest.save();
    console.log("Saved connection request:", savedRequest);

    return res.send({ message: "Connection Request Sent", data: savedRequest });
  } catch (error) {
    console.error("Connection request error:", error);
    return res.send({ message: error.message });
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
   let allconnectionRequest=await ConnectionRequestModal.find({toUserId:id,status:"interested"}).populate("fromUserId",["firstName","lastName","imgUrl"])
   if(allconnectionRequest.length==0){
        return res.send({
          message:"No request"
        })
   }
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

async function getallconnectionofuser(req, res) {
  try {
    const user = req.user;
    const userId = user._id.toString();

    const allConnections = await ConnectionRequestModal.find({
      $or: [
        { toUserId: userId, status: "accepted" },
        { fromUserId: userId, status: "accepted" },
      ],
    })
      .populate("fromUserId", ["firstName", "lastName", "imgUrl"])
      .populate("toUserId", ["firstName", "lastName", "imgUrl"]);

    if (!allConnections.length) {
      return res.send({
        message: "No connections found",
        data: [],
      });
    }

    // Extract only the friend's details
    const friends = allConnections.map((conn) => {
      const from = conn.fromUserId;
      const to = conn.toUserId;

      // Return the user who is not the logged-in user
      const friend = from._id.toString() === userId ? to : from;

      return {
        _id: friend._id,
        firstName: friend.firstName,
        lastName: friend.lastName,
        imgUrl: friend.imgUrl || 'https://via.placeholder.com/40',
      };
    });

    return res.send({
      ResponseCode: 200,
      data: friends,
    });
  } catch (error) {
    return res.status(500).send({
      message: "Something went wrong",
      error: error.message,
    });
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
        { _id: { $nin: Array.from(hideuser) } },
        { _id: { $ne: user._id } },
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
   catch(error){
    res.send({
      message:error.message
    })
   }
}


async function updateuser(req,res){
 try {
    const user = req.user;
    if (!user) {
      return res.status(500).send({
        ResponseCode: 500,
        Message: "User not found"
      });
    }
 const updatedUser = await UserModal.findByIdAndUpdate(user._id, {...req.body,password:user.password,mobileNo:user.mobileNo,email:user.email}, { new: true });
    if (!updatedUser) {
      return res.status(404).send({
        ResponseCode: 404,
        Message: "Failed to update user"
      });
    }

    res.send({
      ResponseCode: 200,
      message: "User updated successfully",
      user: updatedUser
    });

  } catch (error) {
    res.status(500).send({
      ResponseCode: 500,
      Error: error?.message || "Unknown error occurred"
    });
  }

}

async function checkuniquenumber(req, res) {
  try {
    const { mobileNo } = req.body;

    if (!mobileNo) {
      return res.status(400).json({
        ResponseCode: 400,
        mobileExists: false,
        message: "Mobile number is required"
      });
    }

    const user = await UserModal.findOne({ mobileNo });

    if (user) {
      return res.status(200).json({
        ResponseCode: 409,
        mobileExists: true,
        message: "Mobile number is already registered with us"
      });
    }

    return res.status(200).json({
      ResponseCode: 200,
      mobileExists: false,
      message: "Mobile number is available"
    });

  } catch (error) {
    return res.status(500).json({
      ResponseCode: 500,
      mobileExists: false,
      message: "Internal server error",
      error: error.message || error
    });
  }
}

async function checkuniqueemail(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        ResponseCode: 400,
        emailExists: false,
        message: "email is required"
      });
    }

    const user = await UserModal.findOne({ email });

    if (user) {
      return res.status(200).json({
        ResponseCode: 409,
        emailExists: true,
        message: "Email is already registered with us"
      });
    }

    return res.status(200).json({
      ResponseCode: 200,
      emailExists: false,
    });

  } catch (error) {
    return res.status(500).json({
      ResponseCode: 500,
      mobileExists: false,
      message: "Internal server error",
      error: error.message || error
    });
  }
}

async function logout(req,res){
  try{
  res.cookie("token", null, {
    expires: new Date(Date.now()),
  });
  res.status(200).send({
    ResponseCode:200,
    message:"Logout Successfully"
  });
  }
  catch(error){
    return res.json({
      Error:error
    })
  }
}

async function getchat(req, res) {
  try {
    let { userId, targetUserId } = req.body;
    // Ensure they are ObjectId
    userId = new mongoose.Types.ObjectId(userId);
    targetUserId = new mongoose.Types.ObjectId(targetUserId);

    // Find existing chat
    let chat = await chatmodel.findOne({
      participate: { $all: [userId, targetUserId] }
    }).populate("messages.senderId", ["firstName", "lastName","imgUrl"]);

    // If no chat found, create one
    if (!chat) {
      chat = await chatmodel.create({
        participate: [userId, targetUserId],
        messages: []
      });
    }

    res.status(200).send({
      data: chat,
      ResponseCode: 200
    });
  } catch (error) {
    res.status(500).send({
      Error: error.message,
      ResponseCode: 500
    });
  }
}


module.exports={signup,login,logout,userview,connectionRequest,checkuniqueemail,reviewconnectionRequest,getconnectionrequestofuser,getallconnectionofuser,getuser,updateuser,checkuniquenumber,getchat}
  