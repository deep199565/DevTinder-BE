const express=require('express')
const app=express()
const cookieParser = require("cookie-parser");
const router=require('../route/user')
app.use(express.json())
app.use(cookieParser())
const {connectDB}=require('./database')
app.listen(3000,(error,info)=>{
    connectDB().then((res)=>{
        console.log("database connect successfully")
    })
})
app.use(router)
