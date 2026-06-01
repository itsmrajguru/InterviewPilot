/* require('dotenv').config()
const mongoose = require('mongoose')

//creating a database
async function connectToDB(){
    try {
        //connect to blank datasheet provided by this url
        await mongoose.connect(process.env.MONGO_URI)
        console.log("MongoDB connected Successfully");
    } catch (e) {
        console.log("Database Error:", e.message);
        process.exit(1);  //always keep it as 1
    }
}

module.exports={connectToDB} */


require
()