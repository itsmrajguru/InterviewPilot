require('dotenv').config()


//signup controller

const signup=async () => {
    /* step 1 :Extract the incoming user credentials from the frontend */
    const {email,password,role="student"}=req.body
}