//creating routes 

const express = require('express')
const authRouter = express.Router()

//importing the controllers 
const authController = require('../controllers/authController')
const { authRateLimiter } = require('../middleware/authRateLimiter')
const { protect } = require('../middleware/authMiddleware')


authRouter.post('/signup', authController.signup)
authRouter.post('/login', authController.login)
authRouter.post('/verify-otp', authController.verifySignupOtp)
authRouter.post('/token/refresh', authController.refreshToken);
authRouter.post('/forgot-password', authRateLimiter, authController.forgotPassword);
authRouter.post('/reset-password', authRateLimiter, authController.resetPassword);
authRouter.post('/logout', authController.logout);
authRouter.post('/change-password', protect, authController.changePassword);
authRouter.delete('/delete-account', protect, authController.deleteAccount);

module.exports = { authRouter }