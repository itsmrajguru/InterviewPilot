//creating authControllers

const userModel = require('../models/AuthModel/UserModel');

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
        try{
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

            setTimeout(async () => {
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
            }, 0);

            return res.status(401).json({
                success :true,
                message :"OTP sent to your email. Please verify to complete registration.",
                requiresOtp:true,
                email,
                role
            })
        }
        catch(e){
            console.log(e);
            res.status(500).json({
                success :false,
                message : 'Something went wrong ! Please try again'
            })
        }
    }
}
module.exports = { signup }