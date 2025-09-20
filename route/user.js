const express=require('express')
const router=express.Router()
const {signupValidation,loginvalidation}=require('../src/validation')
const {signup,login,userview,logout,connectionRequest,checkuniqueemail,checkuniquenumber,reviewconnectionRequest,updateuser,getconnectionrequestofuser,getallconnectionofuser,getuser,getchat}=require('../controller/user')
const app=express()
const {authcheck}=require('../middleware/auth')
app.use(express.json())

router.post('/signup',signupValidation,signup)
router.post('/login',loginvalidation,login)
router.get('/viewUser',authcheck,userview)
router.get('/feed/:page/:limit',authcheck,getuser)
router.get('/user/requests/received',authcheck,getconnectionrequestofuser)
router.get('/user/connections',authcheck,getallconnectionofuser)
router.post('/connectionRequest/:status/:requestId',authcheck,connectionRequest)
router.post('/connectionRequest/review/:status/:requestId',authcheck,reviewconnectionRequest)
router.post('/profile/update',authcheck,updateuser)
router.post('/uniqueNumber',checkuniquenumber)
router.post('/uniqueEmail',checkuniqueemail)
router.post('/logout',logout)

router.get('/check-auth', authcheck, (req, res) => {
  res.status(200).json({ResponseCode:200,message: "Authenticated", user: req.user });
});

router.post('/chat',getchat)
module.exports=router