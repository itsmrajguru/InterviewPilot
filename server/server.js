//har har  mahadev


require('dotenv').config()
const express=require('express')
const app=express()


//database 
//Welcome Route
app.get('/',(req,res)=>{
    res.send("<h1><i>InterviewPilot's Backend is started</i></h1>")
})

//listen to the server
const PORT=process.env.PORT ||8989
app.listen(PORT,()=>{
    console.log(`server started at http://localhost:${PORT}`);
})