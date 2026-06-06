//creating cloudinaryService

const cloudinary = require('cloudinary').v2
require('dotenv').config()

/* configure cloudinary with env credentials */
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

/* generateSignedUploadParams service */
const generateSignedUploadParams = (sessionId, questionIndex) => {
    const timestamp = Math.round(Date.now() / 1000)
    const publicId  = `interviewpilot/${sessionId}/q${questionIndex}`

    /* sign the request using cloudinary's built-in helper */
    const signature = cloudinary.utils.api_sign_request(
        { timestamp, public_id: publicId, resource_type: 'video' },
        process.env.CLOUDINARY_API_SECRET
    )

    return {
        uploadUrl: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload`,
        publicId,
        timestamp,
        signature,
        apiKey: process.env.CLOUDINARY_API_KEY,
    }
}

module.exports = { generateSignedUploadParams }
