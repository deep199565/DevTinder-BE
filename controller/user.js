const UserModal=require('../models/Users')

async function addUser(req,res){
    try{
        console.log(req.body)
      const user=  await UserModal.insertOne(req.body)

      if(user){
        res.send("User added successfully")
      }
      else{
        res.status(400).send('Bad request')
      }
        }
        catch(err){
        res.status(500).send('Something Went Wrong')
        }
    
}

async function getallUser(req,res){

try{
const user=await UserModal.find({})
if(user){
    res.send({user:user})
}
else{
    res.send("Data not found")
}

}
catch(error){
res.status(500).send("Something went wrong")
}
}

async function getuserbyId(req,res){
    try{
        const id=req.params.id
        const user= await UserModal.findByIdAndUpdate(id,req.body)
        if(user){
            res.send("User Update successfully")
        }
        else{
            res.status(400).send("something went wrong")
        }
    }
    catch(error){
        res.status(500).send("Something went wrong")
        }
}

async function deleteuserbyId(req,res){
    try{
      const id=req.params.id
      const user=await UserModal.findByIdAndDelete(id) 
      if(user){
         res.send("User deleted successfully")
      }
      else{
        res.status(400).send("bad request")
      }
    }
    catch(error){
        res.status(500).send("Something went wrong")
        }
}
 module.exports={addUser,getallUser,getuserbyId,deleteuserbyId}
  