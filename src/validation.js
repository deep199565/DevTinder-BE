const {check}=require('express-validator')

const signupValidation=[
    check('firstName',"First Name is required").notEmpty(),
    check('email','Email is requiered').isEmail().notEmpty(),
    check('email','Email is Undefined').notEmpty(),
    check('password','Password is required').notEmpty().isStrongPassword({
        minLength:6,
        maxLength:20,
        minUppercase:1,
        minLowercase:1,
        minSymbols:1
    }),
    check('mobileNo','phone number is required').notEmpty().isNumeric(),
    check('mobileNo','phone number should be 10 digit').isLength({min:10,max:10})
]
const loginvalidation=[
    check('email','Email is required').notEmpty(),
    check('password','password is required').notEmpty()
]
module.exports={signupValidation,loginvalidation}