//har har  mahadev
require('dotenv').config()
const express=require('express')
const app=express()
const cors=require('')


//database
const {connectToDB}=require('./database/db')
connectToDB();

//routes
const {authRouter}=require('./routes/authRoutes')
app.use('/api/v1/auth',authRouter)


//Welcome Route
app.get('/',(req,res)=>{
    res.send("<h1><i>InterviewPilot's Backend is started</i></h1>")
})

//listen to the server
const PORT=process.env.PORT ||8989
app.listen(PORT,()=>{
    console.log(`server started at http://localhost:${PORT}`);
})