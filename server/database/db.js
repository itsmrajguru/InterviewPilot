//creating database

require('dotenv').config()
const mongoose = require('mongoose')

async function connectToDB() {
    try {
        /* link to blank database provided by unique URL */
        await mongoose.connect(process.env.MONGO_URI)
        console.log("MongoDB connected Succesfully");
    } catch (e) {
        console.log("Database Error:", e.message);
        process.exit(1);
    }
}
module.exports = { connectToDB }