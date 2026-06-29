//creating the server
require('dotenv').config()
const express = require('express')

//creating an app that listens to the server
const app = express()

const cookieParser = require('cookie-parser')
const cors = require('cors')

const allowedOrigins = [
    process.env.CLIENT_URL,
    "https://interviewpilotmsr.vercel.app",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:5176"
].map(url => url?.replace(/\/$/, ""));

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ""))) {
            callback(null, true);
        } else {
            console.log("CORS Blocked Origin:", origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-secret']
}));

app.use(express.json())
app.use(cookieParser())


//lets connect the mondodb with the server
const { connectToDB } = require('./database/db')
connectToDB()


//lets connect the router to the server
const { authRouter } = require('./routes/authRoutes')
app.use('/api/v1/auth', authRouter)

/* interview router — handles session creation, joining, answering, code
   submission and final report generation */
const { interviewRouter } = require('./routes/interviewRoutes')
app.use('/api/v1/interviews', interviewRouter)

const careersyncRouter = require('./routes/careersyncRoutes')
app.use('/api/v1/careersync', careersyncRouter)


//creating a welcome route
app.get('/', (req, res) => {
    res.send("<h1><i>InterviewPilot's Server is Started</i></h1>");
})

app.use((err, req, res, next) => {
    const status = err.status || err.statusCode || 500;
    res.status(status).json({ success: false, message: err.message || 'Internal Server Error' });
})


//listening to the server
const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`server started at http://localhost:${PORT}`);
})