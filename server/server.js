//creating the server
require('dotenv').config()
const express=require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')

//creating an app that listens to the server
const app=express()

const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}))
app.use(express.json())
app.use(cookieParser())




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