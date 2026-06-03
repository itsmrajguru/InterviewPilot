//creating routes 

const express=require('express')
const authRouter=express.Router()

//importing the controllers 
const{authController}=require('../controllers/authController')

authRouter.post('/signup',authController.signup)
authRouter.post('/login',authController.login)
authRouter.post('/verify-otp',authController.verifySignupOtp)


module.exports={authRouter}