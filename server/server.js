//creating the server
require('dotenv').config()
const express=require('express')

//creating an app that listens to the server
const app=express()

//lets connect the mondodb with the server
const {connectToDB}=require('./database/db')
connectToDB()


//lets connect the router to the server
const {authRouter}=require('./routes/authRoutes')
app.use('/api/v1/auth',authRouter)


//creating a welcome route
app.get('/',(req,res)=>{
    res.send("<h1><i>InterviewPilot's Server is Started</i></h1>");
})


//listening to the server
const PORT=process.env.PORT
app.listen(PORT,()=>{
    console.log(`server started at http://localhost:${PORT}`);
})