//creating routes 

const express=require('express')
const authRouter=express.Router()

//importing the controllers 
const{authController}=require('../controllers/authController')

authRouter.post('/signup',authController.signup)
authRouter.post('/login',authController.login)
authRouter.post('/verify-otp',authController.verifySignupOtp)
authRouter.post('/token/refresh', authController.refreshToken);
authRouter.post('/forgot-password', authRateLimiter, authController.forgotPassword);
authRouter.post('/reset-password', authRateLimiter, authController.resetPassword);
authRouter.post('/logout', (req, res) => res.json({ success: true, message: 'Logged out' }));



module.exports={authRouter}