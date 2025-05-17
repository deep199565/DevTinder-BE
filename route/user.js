const express=require('express')
const router=express.Router()
const {signupValidation,loginvalidation}=require('../src/validation')
const {signup,login,userview,connectionRequest,reviewconnectionRequest}=require('../controller/user')
const app=express()
const {authcheck}=require('../middleware/auth')
app.use(express.json())

router.post('/signup',signupValidation,signup)
router.post('/login',loginvalidation,login)
router.get('/viewUser',authcheck,userview)
router.post('/connectionRequest/:status/:requestId',authcheck,connectionRequest)
router.post('/connectionRequest/review/:status/:requestId',authcheck,reviewconnectionRequest)
module.exports=router