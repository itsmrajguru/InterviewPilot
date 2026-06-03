//accessing the blank mongodb sheet 
require('dotenv').config()
const mongoose=require('mongoose')

/*linking the mongoose with the blank database
sheet provided by the url */
async function connectToDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log('MongoDB connected successfully')
    } catch (e) {
      console.log("Connection Error :",e.message);
      process.exit(1) //send os that the connection with the database is failed
    }
}
module.exports={connectToDB}