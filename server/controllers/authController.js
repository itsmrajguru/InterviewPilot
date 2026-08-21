//creating authControllers

const userModel = require('../models/AuthModel/UserModel');
const otpModel = require('../models/AuthModel/OtpModel');
const jwt = require('jsonwebtoken');
const joi = require('joi');
const crypto = require('crypto');
const { sendEmail } = require('../services/emailService');

require('dotenv').config()


/* we created these joi schemas , to validate the user credrentials or meet the
neccssary requirements */
const signupSchema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().min(6).required(),
    role: joi.string().valid('student', 'company').default('student')
});

const loginSchema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().min(6).required()
});

/* creating access and refresh token generators
we are also adding the role with the id , becuase we have created authMiddlware
that checks the type of user,to allow it to visit only the pages , he should */

const generateAccessToken = (id, role, email = '') => {
    /* email is included so req.user.email is available in every controller
       without an extra DB lookup — used by getStudentDashboard to query sessions */
    return jwt.sign({ id, role, email }, process.env.JWT_SECRET, { expiresIn: '15m' });
}

const generateRefreshToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' })
}
//signup controller
const signup = async (req, res) => {
    /* step 1 :Extract the user credentials coming from the frontend via axios*/
    const { email, password, role = "student" } = req.body;

    /* step 2 validate the user credentials using the joi: */
    const { error } = signupSchema.validate({ email, password, role })

    if (error) {
        console.error("Signup Validation Error :", error.details[0].message)
        return res.status(400).json({
            success: false,
            message: error.details[0].message
        })
    }
    else {
        try {
            /* step 3 :Check whether the emailID is already registered or not ? */
            const existingUser = await userModel.findOne({ email })

            /* Condition 1 :if the user already exists and is Verified--> reject it*/
            if (existingUser && existingUser.isVerified) {
                const msg = "Email Id Alreday Registered "
                /* inform to the developer */
                console.log("Signup Error :", msg);
                /* inform to thr user */
                return res.status(400).json({
                    succes: false,
                    message: msg
                })
            }
            /* Condition 2 :If the user is registered but not verified 
                            then delete the email entry from the db and allow to re-register*/

            if (existingUser && !existingUser.isVerified) {
                await userModel.deleteOne({ _id: existingUser._id })
            }

            /* step 4 :OTP email Verification for the new user 
                step 1 :Create a new user with isVerified :false
                step 2 :Generate a random 6-digit OTP
                step 3 :Delete any old OTP's for the same email and save the new one
                step 4 :Build OTP email HTML
                step 5 :Send the otp to the user via Resend*/

            /* step 4.1 :save the new existinguser with the updated data as isVerified=false*/
            await userModel.create({
                email,
                password,
                role,
                isVerified: false
            })

            /* step 4.2 : Generate 6-digit random OTP and delete previous emails for this email  */

            const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
            await otpModel.deleteMany({ email });
            await otpModel.create({ email, otp: otpCode });

            /* step 4.3 : Build OTP Email HTML */
            const html = `
                    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f0fbfe;border-radius:16px;">
                        <h2 style="color:#0179a0;margin-bottom:8px;">Verify Your CareerSync Account</h2>
                        <p style="color:#444;font-size:15px;">Use the OTP below to complete your registration. It expires in <strong>10 minutes</strong>.</p>
                        <div style="font-size:40px;font-weight:900;letter-spacing:10px;color:#111;background:#fff;border:2px solid #b3eefb;border-radius:12px;padding:20px 28px;display:inline-block;margin:20px 0;">${otpCode}</div>
                        <p style="color:#888;font-size:12px;">If you did not create a CareerSync account, you can safely ignore this email.</p>
                    </div>
                `;

            /* step 4.4 :Send the OTP email to the user via Resend */

            ;(async () => {
                try {
                    const emailSent = await sendEmail({
                        to: email,
                        subject: 'CareerSync — Verify Your Account',
                        text: `Your CareerSync verification OTP is: ${otpCode}. It expires in 10 minutes.`,
                        html
                    })

                    if (!emailSent) {
                        console.log(`Verification OTP Email send failed...`);
                    }
                    console.log("Email Sent Successfully")
                } catch (e) {
                    console.log('Email Send Error :', e);
                }
            })()

            return res.status(200).json({
                success: true,
                message: "OTP sent to your email. Please verify to complete registration.",
                requiresOtp: true,
                email,
                role
            })
        }
        catch (e) {
            console.log(e);
            res.status(500).json({
                success: false,
                message: 'Something went wrong ! Please try again'
            })
        }
    }
}

/* logIn comntroller*/

const login = async (req, res) => {
    /* step 1: extract the user credentials from re.body coming from the frontend */
    const { email, password } = req.body
    /* step 2: Validate the user credetials using joi loginschema */
    const { error } = loginSchema.validate({ email, password })

    if (error) {
        /* inform to the developer */
        console.log("Login Error :", error.details[0].message);
        /* inform to the user */
        return res.status(400).json({
            success: false,
            message: error.details[0].message
        })
    }
    else {
        try {
            /* step 3 :Verification of the email,password and otp

                step 3.1 :Verify whether the emailId is registered or not ?
                step 3.2 :If the emailID is registred , then check whether the pass
                            word entered by the user mathches with the password stored in the db
                step 3.3 :Check whether the email verification is done via otp?    
            */

            /* step 3.1 :Verify whether the emailId is registered or not ?*/
            const getUser = await userModel.findOne({ email: email.trim().toLowerCase() })
            if (!getUser) {
                return res.status(400).json({
                    success: false,
                    message: "Email not registered !"
                })
            }
            /* step 3.2 :If the emailID is registred , then check whether the pass
            word entered by the user mathches with the password stored in the db */

            const isPasswordCorrect = await getUser.matchPassword(password)
            if (!isPasswordCorrect) {
                return res.status(400).json({
                    success: false,
                    message: "Incorrect Password"
                })
            }

            /* step 3.3 :Check whether the email verification is done via otp?*/
            if (!getUser.isVerified) {
                return res.status(400).json({
                    success: false,
                    message: "Please verify your email before logging in."
                })
            }

            /* step 4 :Generate Access token and Refresh Token along with setting cookie */
            const accessToken = generateAccessToken(getUser?._id, getUser?.role, getUser?.email)
            const refreshToken = generateRefreshToken(getUser?._id)

            /* step 5 :sending the accessToken to frontend 
            so that it is stored in the localstorage
            and refreshToken to cookie
            so that it is stored in the cookie permentantly*/

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'Lax', maxAge: 24 * 60 * 60 * 1000
            })

            return res.status(200).json({
                success: true,
                message: "LogIn successful",
                accessToken,
                user: {
                    _id: getUser?._id,
                    email: getUser.email,
                    role: getUser.role
                }
            })
        } catch (e) {
            console.log(e);
            res.status(500).json({
                success: false,
                message: 'Something went wrong ! Please try again'
            })
        }
    }
}

/* verify-otp controller */

const verifySignupOtp = async (req, res) => {
    /* step 1 :Extract email and entered otp from req.body */
    const { email, otp } = req.body

    /* validate the email and otp using joi */
    const verifyOtpSchema = joi.object({
        email: joi.string().email().required(),
        otp: joi.string().required()
    })

    const { error } = verifyOtpSchema.validate({ email, otp })

    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message
        })
    }
    
    try {
        /* step 2: verify the otp
            step 2.1 :Extract from the db
            step 2.2 :Compare the saved one and this one from user 
            step 2.3 :And if the otp is valid, so that it can no be reused*/

        /* step 2.1 :Extract from the db */
        const record = await otpModel.findOne({ email });
        if (!record) {
            return res.status(400).json({
                success: false,
                message: "OTP expired or not found. Please sign up again."
            })
        }
        /* step 2.2 :Compare the saved one and this one from user */
        if (record.otp !== otp.toString()) {
            return res.status(400).json({
                success: false,
                message: "Incorrect OTP. Please try again."
            })
        }
        /* step 2.2:If the otp is valid ,delete the whole model*/
        await otpModel.deleteMany({ email })

        /* step 3 :mark the user as Verified in the database */
        const user = await userModel.findOneAndUpdate({ email }, { isVerified: true }, { new: true });

        /* step 4 :create blank profiles for the student and company */

        /* if (user.role === 'student') {
            await profileModel.create({ user: user._id });
        }
        else if (user.role === 'company') {
            await companyModel.create({ user: user._id });
        } */

        return res.status(200).json({
            success: true,
            message: "Email verified successfully. You can now log in.",
            role: user.role
        })
    } catch (e) {
        console.log(e);
        res.status(500).json({
            success: false,
            message: "Something went wrong. Please try again."
        })
    }
}

/* refreshToken controller */

const refreshToken = async (req, res) => {
    /* step 1 :Extract the refresh token from cookies...due 
    to withCredentials:true, the cookies data is automatically sent by the axios*/
    const token = req.cookies.refreshToken;

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "No refresh token found. Please login again."
        })
    }
    try {
        /* step 2:verify the (_id) from token coming from the cookie 
        with the mongoDB _id */
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET)

        /* step 3:Generate new access token, 
        but note :RefreshToken dont carry the user role, to put it into the access token
        so fetch user for it */
        const refreshUser = await userModel.findById(decoded?.id).select('role email');
        const newAccessToken = generateAccessToken(decoded?.id, refreshUser?.role, refreshUser?.email)

        return res.status(200).json({
            success: true,
            message: "New Access Token generated Successfully",
            newAccessToken //This token has been sent to response interceptor
        })
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            success: false,
            message: 'Refresh token invalid or expired. Please login again.'
        });
    }
}

// Forgot Password Controller
/* This controller is just to create a reset link , that will be mailed to the user
so then user will click the link and will be taken to resetPassword
and this reset link is a rest token that is shared with the RESTAPI /reset-password
so that it can extract the token and verify

*/
const forgotPassword = async (req, res) => {
    /* step 1:Extract the email from req.body */
    const { email } = req.body

    /* step2 :validate the email using emailSchema */

    //define emailSchema using joi
    const emailSchema = joi.object({
        email: joi.string().email().required()
    })

    //validate the emailSchema
    const { error } = emailSchema.validate({ email })

    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message
        });
    }
    else {
        try {
            /* step 3:Validate whether the email is registred or not ? */
            const normalizedEmail = email.trim().toLowerCase();
            const getUser = await userModel.findOne({ email: normalizedEmail })

            /* condition :If user is not registered , take him back */
            if (!getUser) {
                return res.status(200).json({
                    success: true,
                    message: 'If this email is registered, a reset link has been sent.'
                });
            }

            /* step 4:generate a resetToken and send it to user via email */
            /* step 4.1 :Generate a normal string token  */
            const resetToken = crypto.randomBytes(32).toString('hex')

            /* step 4.2 :hash the reset token */
            const hashedResetToken = crypto
                .createHash('sha256')
                .update(resetToken)
                .digest('hex')

            /* step 4.3 :Update db with hashed reset token */
            getUser.resetPasswordToken = hashedResetToken;
            getUser.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
            await getUser.save()

            /* step 4.4 :send resetToken to the user inbox via email
            
            This will automatically take the user to the reset-password page*/
            const resetURL = `${process.env.CLIENT_URL || 'CLIENT_URL=http://localhost:5173'}/reset-password?token=${resetToken}`

            const msg = `You requested a password reset.\n\nReset your password here (valid 15 mins):\n\n${resetURL}\n\nIgnore this email if you didn't request it.`

            ;(async () => {
                try {
                    const emailSent = await sendEmail({
                        to: getUser.email,
                        subject: 'CareerSync - Password Reset Request',
                        text: msg
                    })
                    if (!emailSent) {
                        console.log('Email Reset Link send failed')
                    }
                } catch (e) {
                    console.log('Reset Email Send Error:', e);
                }
            })()
            return res.status(200).json({
                success: true,
                message: 'If this email is registered, a reset link has been sent.'
            });
        } catch (e) {
            console.log(e);
            return res.status(500).json({
                success: false,
                message: 'Something went wrong! Please try again'
            });
        }
    }
}

/* resetPassword Controller */

const resetPassword = async (req, res) => {
    /* step 1 : extract the newpassword , as well as
    the reset-token exctracted by the frontend, through Dyanmic URL
    and sent by the forgotPassword to verify the user */

    const { token, newPassword } = req.body

    /* step 2 :Validate the password */
    const newPasswordSchema = joi.object({
        newPassword: joi.string().min(6).required()
    })
    const { error } = newPasswordSchema.validate({ newPassword })
    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message
        });
    }
    else {
        try {
            /* step 3 Verify the token: */
            if (!token) {
                return res.status(400).json({
                    success: false,
                    message: 'Token is required.'
                });
            }

            /* step 3.1 :Hash the token to compare with the one saved in mongoDB */
            // Added .trim() to handle potential whitespace from copy-paste
            const hashedToken = crypto.createHash('sha256').update(token.trim()).digest('hex');

            /* step 3.2 :Verify the hashed-token with the db */
            const getUser = await userModel.findOne({
                resetPasswordToken: hashedToken,
                resetPasswordExpire: { $gt: Date.now() }
            })
            if (!getUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid or expired reset token. Please try again !'
                });
            }

            /* step 4 :Update db with newPassword */
            getUser.password = newPassword
            getUser.resetPasswordToken = undefined
            getUser.resetPasswordExpire = undefined
            await getUser.save()

            return res.status(200).json({
                succes: true,
                message: "Password reset successfully. Please login."
            })
        } catch (e) {
            console.log(e);
            return res.status(500).json({
                success: false,
                message: "Something went wrong! Please try again"
            })
        }
    }
}
/* logout controller */

const logout = (req, res) => {
    /* Clear the refreshToken cookie */
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax'
    })
    
    return res.status(200).json({
        success: true,
        message: 'Logged out successfully'
    })
}

/* changePassword Controller — requires the user to supply their current password */
const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    const schema = joi.object({
        currentPassword: joi.string().min(6).required(),
        newPassword: joi.string().min(6).required()
    });
    const { error } = schema.validate({ currentPassword, newPassword });
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });

    try {
        const user = await userModel.findById(req.user.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) return res.status(400).json({ success: false, message: 'Current password is incorrect.' });

        if (currentPassword === newPassword) {
            return res.status(400).json({ success: false, message: 'New password must be different from current password.' });
        }

        user.password = newPassword;
        await user.save();

        return res.status(200).json({ success: true, message: 'Password changed successfully.' });
    } catch (e) {
        console.log(e);
        return res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
    }
};

/* deleteAccount Controller — requires password confirmation before deleting */
const deleteAccount = async (req, res) => {
    const { password } = req.body;

    const schema = joi.object({ password: joi.string().min(6).required() });
    const { error } = schema.validate({ password });
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });

    try {
        const user = await userModel.findById(req.user.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

        const isMatch = await user.matchPassword(password);
        if (!isMatch) return res.status(400).json({ success: false, message: 'Incorrect password. Account not deleted.' });

        await userModel.findByIdAndDelete(req.user.id);

        // Clear the refresh token cookie
        res.clearCookie('refreshToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'Lax' });

        return res.status(200).json({ success: true, message: 'Account deleted successfully.' });
    } catch (e) {
        console.log(e);
        return res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
    }
};

module.exports = { signup, login, verifySignupOtp, refreshToken, forgotPassword, resetPassword, logout, changePassword, deleteAccount }
