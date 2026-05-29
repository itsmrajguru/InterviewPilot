const express=require('express')
const authRouter=express.Router()

//importing controller
const{authController}=require('../controllers/authController')

//authRoutes
authRouter.post('/signup',authController)


module.exports={authRouter}