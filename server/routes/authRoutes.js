//creating routes 

const express=require('express')
const authRouter=express.Router()

//importing the controllers 
const{authController}=require('../controllers/authController')

/* authRouter.post('/signup,)
 */
module.exports={authRouter}