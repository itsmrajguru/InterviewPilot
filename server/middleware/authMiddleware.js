/* authMiddlewares is only used to check that 
whether the user is valid or not,
by checking his identity card (access token)*/

require('dotenv').config()
const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
    /* step 1 :Extract the authHeader to extract the token  */
    const authHeader = req.headers.authorization;
    /* condition */
    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: "No token Provided.Please Login"
        })
    }

    /* step 2:Extract the actual access token from authHeader */
    const token = authHeader.split(' ')[1];
    try {
        /* step 3 :verify the access token */
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        /* step 4 :set the user info in the req.user , so that 
        further controllers can access the user info directly by 
        req.user */
        req.user = decoded;
        next()
    } catch (e) {
        console.log(e);
        return res.status(401).json({
            success: false,
            message: 'Token invalid or expired. Please login again.'
        });
    }
}

module.exports = { protect }
