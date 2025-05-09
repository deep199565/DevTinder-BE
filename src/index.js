const express=require('express')

const app=express()
const router=require('../route/user')
app.use(express.json())
const {connectDB}=require('./database')
app.listen(3000,(error,info)=>{
    console.log("Server started in 3000")
    connectDB().then((res)=>{
        console.log("database connect successfully")
    })
})

app.use(router)
