const mongoose = require('mongoose');

/* This model is a temporary model, 
that is deleted , once user's email is verified
 */
const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        index: true
    },
    otp: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true,
        default: () => new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    }
});

//automatically delete expired OTPs from the DB
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const otpModel = mongoose.model('Otp', otpSchema);

module.exports = otpModel;
