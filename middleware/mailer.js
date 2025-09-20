const nodemailer=require('nodemailer')

 const transpoter=nodemailer.createTransport({
   service:"gmail",
   auth:{
    user:"deeppatel199566@gmail.com",
    pass:"afdg cumy elhp tfxg"
   }
    })

async function sendmail(tomail,sub,message){
const option={
    from:"deeppatel199566@gmail.com",
    to:tomail,
    subject:sub,
    html:`<p> ${message} </p>`

}

try{
const mail=await transpoter.sendMail(option)
}

catch(error){
 console.log('error',error)
}
}

module.exports={sendmail}