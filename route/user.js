const express=require('express')
const router=express.Router()
const {addUser,getallUser,getuserbyId,deleteuserbyId}=require('../controller/user')
const app=express()
app.use(express.json())

router.post('/user',addUser)
router.get('/getallUser',getallUser)
router.patch('/user/:id',getuserbyId)
router.delete('/user/:id',deleteuserbyId)
module.exports=router