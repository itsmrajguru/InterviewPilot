//creating the server
require('dotenv').config()
const express = require('express')

//creating an app that listens to the server
const app = express()

const cookieParser = require('cookie-parser')
const cors = require('cors')

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || /^http:\/\/localhost:\d+$/.test(origin) || origin === process.env.CLIENT_URL) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    credentials: true
}))

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


//creating a welcome route
app.get('/', (req, res) => {
    res.send("<h1><i>InterviewPilot's Server is Started</i></h1>");
})


//listening to the server
const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`server started at http://localhost:${PORT}`);
})