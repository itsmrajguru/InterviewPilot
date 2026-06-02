require('dotenv').config()
const express=require('express')
const app=express()
const cors=require('cors')

//import database
const {connectToDB}=require('./database/db')
connectToDB();

//import routes
const{authRouter}=require('./routes/authRoutes')
app.use('/api/v1/auth',authRouter)

//welcome route
app.get('/',(req,res)=>{
    res,send("<h1><i>Hey User,server is started</h1></i>")
})
//listen to the server
const PORT=process.env.PORT
app.listen(PORT,()=>{
    console.log(`server started at http://localhost:${PORT}`)
})
