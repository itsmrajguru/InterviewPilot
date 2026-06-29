//creating interviewControllers

const crypto = require('crypto')
const InterviewSession = require('../models/InterviewModel/InterviewSession')
const { generateInterviewQuestions, evaluateAnswer, evaluateCode, generateReport } = require('../services/geminiService')
const { executeCode } = require('../services/judge0Service')
const { sendEmail } = require('../services/emailService')

/* createSession controller*/
const createSession = async (req, res) => {
    /* step 1 : extract the studentEmail, role, difficulty, resumeText from req.body coming from the frontend
       csApplicationId and candidateName are only present when called from CareerSync */
    const {
        studentEmail,
        role,
        difficulty      = 'medium',
        resumeText      = '',
        csApplicationId = '',
        candidateName   = '',
        companyEmail    = ''
    } = req.body

    /* condition :If we did not get any of them,simply return a json reply*/
    if (!studentEmail || !role) {
        return res.status(400).json({ success: false, message: 'studentEmail and role are required.' })
    }

    try {
        /* step 2 :Generate a secure random invite token and set it to expire in 48 hours */
        const inviteToken  = crypto.randomBytes(32).toString('hex')
        const inviteExpiry = new Date(Date.now() + 48 * 60 * 60 * 1000)

        /* step 2.5: find or auto-create company user by email from CareerSync */
        let assignedCompanyId = req.user?.id || 'careersync-service';
        if ((!req.user?.id || req.user.id === 'careersync-service') && companyEmail) {
            const User = require('../models/AuthModel/UserModel');
            const bcrypt = require('bcryptjs');
            let companyUser = await User.findOne({ email: companyEmail });
            if (!companyUser) {
                /* condition : company not registered in InterviewPilot, auto-create their account */
                const defaultPassword = 'InterviewPilot@123';
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(defaultPassword, salt);
                companyUser = await User.create({
                    email:      companyEmail,
                    password:   hashedPassword,
                    role:       'company',
                    isVerified: true
                });
                console.log(`Auto-created company account for CareerSync user: ${companyEmail}`);
            }
            assignedCompanyId = companyUser._id;
        }

        /* Auto-create/find InterviewPilot account, send temp password in invite email, 
        and set isVerified=true via invite-link verification for report/history access. */
        let studentTempPassword = null;
        {
            const User   = require('../models/AuthModel/UserModel');
            const bcrypt = require('bcryptjs');
            let studentUser = await User.findOne({ email: studentEmail });
            if (!studentUser) {
                /* generate a readable temp password: 8 random hex chars + @IP */
                studentTempPassword = crypto.randomBytes(4).toString('hex').toUpperCase() + '@IP';
                studentUser = await User.create({
                    email:      studentEmail,
                    password:   studentTempPassword,  /* pre-save hook hashes this */
                    role:       'student',
                    isVerified: true   /* pre-verified — identity confirmed via email invite link */
                });
                console.log(`Auto-created student account for candidate: ${studentEmail}`);
            }
            /* if user already exists: do not overwrite their password — they may have changed it */
        }

        /* step 3 :Create the session document — status starts as pending */
        const session = await InterviewSession.create({
            companyId:       assignedCompanyId,
            studentEmail,
            role,
            difficulty,
            resumeText,
            inviteToken,
            inviteExpiry,
            csApplicationId
        })

        /* step 4 :Build the invite link and send the email to the candidate via Resend */
        const joinURL      = `${process.env.CLIENT_URL || 'http://localhost:5175'}/interview/join/${inviteToken}`
        const loginURL     = `${process.env.CLIENT_URL || 'http://localhost:5175'}/login`
        const dashboardURL = `${process.env.CLIENT_URL || 'http://localhost:5175'}/student/dashboard`

        /* credentials block — only shown the first time (when account was just created) */
        const credentialsSection = studentTempPassword ? `
            <div style="margin:20px 0;padding:16px 20px;background:#f0fdf4;border:1px solid #86efac;border-radius:10px;">
                <p style="color:#166534;font-weight:700;margin:0 0 8px 0;font-size:14px;">🎉 Your InterviewPilot Account Has Been Created!</p>
                <p style="color:#444;font-size:13px;margin:0 0 10px 0;">
                    After the interview, log in to <a href="${loginURL}" style="color:#5b21b6;font-weight:700;">InterviewPilot</a>
                    to view your score, full report, and all future interview history.
                </p>
                <table style="font-size:13px;color:#333;border-collapse:collapse;">
                    <tr><td style="padding:3px 12px 3px 0;font-weight:700;">Email:</td><td>${studentEmail}</td></tr>
                    <tr><td style="padding:3px 12px 3px 0;font-weight:700;">Temporary Password:</td>
                        <td><code style="background:#e5e7eb;padding:2px 8px;border-radius:4px;font-weight:700;">${studentTempPassword}</code></td>
                    </tr>
                </table>
                <p style="color:#888;font-size:11px;margin:10px 0 0 0;">💡 You can change this password anytime after logging in.</p>
            </div>
        ` : `
            <div style="margin:20px 0;padding:14px 18px;background:#eef0ff;border:1px solid #c8c4fe;border-radius:10px;">
                <p style="color:#3d2ec4;font-size:13px;margin:0;">
                    After the interview, visit your
                    <a href="${dashboardURL}" style="color:#5b21b6;font-weight:700;">InterviewPilot Dashboard</a>
                    to view your score and detailed report.
                </p>
            </div>
        `

        const html = `
            <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#f9f9ff;border-radius:16px;">
                <h2 style="color:#5b21b6;">You have been invited to an interview!</h2>
                <p style="color:#444;font-size:15px;">
                    You have been selected to interview for the role of <strong>${role}</strong>.
                    Click the button below to begin. The link expires in <strong>48 hours</strong>.
                </p>
                <a href="${joinURL}" style="display:inline-block;margin:20px 0;padding:14px 28px;background:#5b21b6;color:#fff;border-radius:8px;text-decoration:none;font-weight:700;">
                    Start My Interview
                </a>
                ${credentialsSection}
                <p style="color:#888;font-size:12px;">If you did not expect this email, you can safely ignore it.</p>
            </div>
        `

        /* send the invite email without blocking the response */
        ;(async () => {
            try {
                const plainText = studentTempPassword
                    ? `You have been invited to interview for ${role}. Join here: ${joinURL}\n\nYour InterviewPilot account:\nEmail: ${studentEmail}\nTemporary Password: ${studentTempPassword}\n\nLog in after the interview to view your report: ${loginURL}`
                    : `You have been invited to interview for ${role}. Join here: ${joinURL}\n\nView your dashboard: ${dashboardURL}`

                const emailSent = await sendEmail({
                    to: studentEmail,
                    subject: `InterviewPilot — Interview Invitation for ${role}`,
                    text: plainText,
                    html
                })
                if (!emailSent) {
                    console.log(`Invite Email send failed...`);
                }
                console.log("Email Sent Successfully")
            } catch (e) {
                console.log('Email Send Error :', e);
            }
        })()

        return res.status(201).json({
            success: true,
            message: 'Interview session created and invite sent.',
            session: {
                _id: session._id,
                studentEmail: session.studentEmail,
                role: session.role,
                difficulty: session.difficulty,
                status: session.status,
                inviteToken: session.inviteToken,
                inviteExpiry: session.inviteExpiry,
                joinURL
            }
        })
    } catch (e) {
        /* inform to the developer */
        console.log(e);
        /* inform to the user */
        return res.status(500).json({ success: false, message: 'Something went wrong ! Please try again' })
    }
}

/* joinSession controller */
const joinSession = async (req, res) => {
    /* step 1 :Extract token from req.params */
    const { token } = req.params

    try {
        /* step 2 :find the session by invite token */
        const session = await InterviewSession.findOne({ inviteToken: token })

        if (!session) {
            return res.status(404).json({ success: false, message: 'Invalid invite link.' })
        }

        /* condition :If the token has expired , take him back */
        if (new Date() > session.inviteExpiry) {
            session.status = 'expired'
            await session.save()
            return res.status(410).json({ success: false, message: 'This invite link has expired.' })
        }

        /* condition :If the session is already completed */
        if (session.status === 'completed') {
            return res.status(400).json({ success: false, message: 'This interview has already been completed.' })
        }


        return res.status(200).json({
            success: true,
            session: {
                _id: session._id,
                role: session.role,
                difficulty: session.difficulty,
                status: session.status,
                questions: session.questions,
                currentQuestionIndex: session.currentQuestionIndex,
                answers: session.answers
            }
        })
    } catch (e) {
        console.log(e);
        return res.status(500).json({ success: false, message: 'Something went wrong ! Please try again' })
    }
}

/* startSession controller */
const startSession = async (req, res) => {
    /* step 1 :Extract id from req.params and resumeText from req.body */
    const { id } = req.params
    const { resumeText } = req.body

    try {
        /* step 2 :find the session */
        const session = await InterviewSession.findById(id)
        if (!session) {
            return res.status(404).json({ success: false, message: 'Session not found.' })
        }

        /* condition :if already active, return success so page reloads work gracefully */
        if (session.status === 'active') {
            return res.status(200).json({
                success: true,
                message: 'Interview already active.',
                session: {
                    _id: session._id,
                    status: session.status,
                    startedAt: session.startedAt,
                    currentQuestionIndex: session.currentQuestionIndex
                }
            })
        }

        /* condition :completed or cancelled sessions cannot be restarted */
        if (session.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: `Session is already ${session.status}.`
            })
        }

        /* step 3 :update resume text and mark as active in the db */
        if (resumeText !== undefined) {
            session.resumeText = resumeText;
        }
        
        /* step 4 :generate questions with Gemini if they have not been generated yet */
        if (!session.questions || session.questions.length === 0) {
            console.log('Generating interview questions via Gemini...')
            const questions = await generateInterviewQuestions(
                session.role,
                session.difficulty,
                session.resumeText
            )
            session.questions = questions
        }

        session.status = 'active'
        session.startedAt = new Date()
        await session.save()

        return res.status(200).json({
            success: true,
            message: 'Interview started.',
            session: {
                _id: session._id,
                status: session.status,
                startedAt: session.startedAt,
                currentQuestionIndex: session.currentQuestionIndex,
                questions: session.questions,
                answers: session.answers
            }
        })
    } catch (e) {
        console.log(e);
        return res.status(500).json({ success: false, message: e.message || 'Something went wrong ! Please try again' })
    }
}

/* submitAnswer controller */
const submitAnswer = async (req, res) => {
    /* step 1: extract id from req.params and answer, questionIndex from req.body coming from the frontend */
    const { id } = req.params
    const { questionIndex, answer } = req.body

    if (answer === undefined || questionIndex === undefined) {
        return res.status(400).json({ success: false, message: 'questionIndex and answer are required.' })
    }

    try {
        /* step 2 :load session from db */
        const session = await InterviewSession.findById(id)
        if (!session) {
            return res.status(404).json({ success: false, message: 'Session not found.' })
        }

        if (session.status !== 'active') {
            return res.status(400).json({ success: false, message: 'Session is not active.' })
        }

        /* step 3 :get the question from the session so we can pass it to Gemini */
        const question = session.questions[questionIndex]
        if (!question) {
            return res.status(400).json({ success: false, message: 'Invalid question index.' })
        }

        /* step 4 :evaluate the answer with Gemini */
        const { score, feedback } = await evaluateAnswer(question.question, answer)

        /* step 5 :save the answer in the answers array in the database
        if the student already answered this question, update it */
        const existingIndex = session.answers.findIndex(a => a.questionIndex === questionIndex)
        const answerDoc = {
            questionIndex,
            question: question.question,
            type: question.type,
            answer,
            score,
            feedback,
            submittedAt: new Date()
        }

        if (existingIndex !== -1) {
            session.answers[existingIndex] = answerDoc
        } else {
            session.answers.push(answerDoc)
        }

        /* step 6 :advance the current question pointer */
        session.currentQuestionIndex = Math.max(session.currentQuestionIndex, questionIndex + 1)

        await session.save()

        return res.status(200).json({
            success: true,
            message: 'Answer evaluated.',
            evaluation: { score, feedback }
        })
    } catch (e) {
        console.log(e);
        return res.status(500).json({ success: false, message: 'Something went wrong ! Please try again' })
    }
}

/* submitCode controller */
const submitCode = async (req, res) => {
    /* step 1: extract id from req.params and code, language, questionIndex from req.body */
    const { id } = req.params
    const { code, language, questionIndex } = req.body

    if (!code || !language || questionIndex === undefined) {
        return res.status(400).json({ success: false, message: 'code, language and questionIndex are required.' })
    }

    try {
        /* step 2 :load session from db */
        const session = await InterviewSession.findById(id)
        if (!session) {
            return res.status(404).json({ success: false, message: 'Session not found.' })
        }

        if (session.status !== 'active') {
            return res.status(400).json({ success: false, message: 'Session is not active.' })
        }

        /* step 3 :get the coding question for its test cases */
        const question = session.questions[questionIndex]
        if (!question || question.type !== 'coding') {
            return res.status(400).json({ success: false, message: 'Question is not a coding problem.' })
        }

        /* step 4 :run the code through Judge0 */
        console.log('Executing code via Judge0...')
        const testResults = await executeCode(code, language, question.testCases || [])

        const testsPassed = testResults.filter(t => t.passed).length
        const testsTotal = testResults.length

        /* step 5 :save the code submission to the session in the db */
        session.codeSubmission = {
            problemDescription: question.question,
            code,
            language,
            testResults,
            testsPassed,
            testsTotal,
            submittedAt: new Date()
        }

        /* also save it as an answer entry so it counts in the report */
        const answerDoc = {
            questionIndex,
            question: question.question,
            type: 'coding',
            answer: code,
            testsPassed,
            testsTotal,
            submittedAt: new Date()
        }
        const existingIndex = session.answers.findIndex(a => a.questionIndex === questionIndex)
        if (existingIndex !== -1) {
            session.answers[existingIndex] = answerDoc
        } else {
            session.answers.push(answerDoc)
        }

        session.currentQuestionIndex = Math.max(session.currentQuestionIndex, questionIndex + 1)

        await session.save()

        return res.status(200).json({
            success: true,
            message: 'Code executed and saved.',
            testResults,
            testsPassed,
            testsTotal
        })
    } catch (e) {
        console.log(e);
        return res.status(500).json({ success: false, message: 'Something went wrong ! Please try again' })
    }
}

/* completeSession controller */
const completeSession = async (req, res) => {
    /* step 1 :Extract id from req.params */
    const { id } = req.params

    try {
        /* step 2 :load session from db */
        const session = await InterviewSession.findById(id)
        if (!session) {
            return res.status(404).json({ success: false, message: 'Session not found.' })
        }

        if (session.status !== 'active') {
            return res.status(400).json({
                success: false,
                message: `Session cannot be completed — it is ${session.status}.`
            })
        }

        /* step 3 :ask Gemini to write the performance report */
        console.log('Generating final report via Gemini...')
        const reportData = await generateReport(session)

        /* step 4 :map the per-question feedback back to the session.answers */
        if (reportData.answersFeedback && Array.isArray(reportData.answersFeedback)) {
            reportData.answersFeedback.forEach(fb => {
                const answer = session.answers.find(a => a.questionIndex === fb.questionIndex);
                if (answer) {
                    answer.score = fb.score;
                    answer.feedback = fb.feedback;
                    if (answer.type !== 'coding') {
                        answer.communicationScore = fb.communicationScore;
                        answer.clarityScore = fb.clarityScore;
                        answer.vocabularyScore = fb.vocabularyScore;
                        answer.structureScore = fb.structureScore;
                    }
                }
            });
            /* remove answersFeedback from the report data since it's now in the answers array */
            delete reportData.answersFeedback;
        }

        /* step 5 :save the report and mark session completed in the db */
        session.report      = reportData
        session.status      = 'completed'
        session.completedAt = new Date()
        await session.save()

        /* step 4.5: send an email to the candidate that their interview is completed */
        ;(async () => {
            try {
                const reportUrl = `${process.env.CLIENT_URL || 'http://localhost:5175'}/interview/${session._id}/report`
                const html = `
                    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#f9f9ff;border-radius:16px;">
                        <h2 style="color:#5b21b6;">Interview Completed!</h2>
                        <p style="color:#444;font-size:15px;">
                            You have successfully completed your interview for the role of <strong>${session.role}</strong>.
                        </p>
                        <p style="color:#444;font-size:15px;">
                            Your final score is: <strong style="font-size:18px;color:#059669;">${reportData.overallScore}/100</strong>
                        </p>
                        <p style="color:#444;font-size:15px;">
                            The hiring team will review your performance and reach out to you regarding the next steps about your hiring.
                        </p>
                        <a href="${reportUrl}" style="display:inline-block;margin:20px 0;padding:14px 28px;background:#5b21b6;color:#fff;border-radius:8px;text-decoration:none;font-weight:700;">
                            View Detailed Report
                        </a>
                    </div>
                `
                await sendEmail({
                    to: session.studentEmail,
                    subject: `InterviewPilot — Interview Completed for ${session.role}`,
                    text: `You have completed your interview for ${session.role}. Your score is ${reportData.overallScore}/100. We will contact you further about hiring.`,
                    html
                })
                console.log("Completion Email Sent Successfully")
            } catch (e) {
                console.log('Completion Email Send Error :', e);
            }
        })()

        /* step 5 :if this session was triggered by CareerSync, send results back (non-blocking) */
        if (session.csApplicationId) {
            try {
                const axios     = require('axios')
                const reportUrl = `${process.env.CLIENT_URL || 'http://localhost:5175'}/interview/${session._id}/report`

                await axios.post(
                    `${process.env.CAREERSYNC_BACKEND_URL}/api/v1/integration/interview-result`,
                    {
                        csApplicationId: session.csApplicationId,
                        overallScore:    session.report.overallScore,
                        reportUrl,
                        completedAt:     new Date()
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'x-api-secret': process.env.INTERVIEWPILOT_API_SECRET
                        },
                        timeout: 10000
                    }
                )
                console.log(`Interview result sent back to CareerSync for application ${session.csApplicationId}`)
            } catch (callbackErr) {
                /* non-blocking — do not fail the interview completion if callback fails */
                console.log('CareerSync callback failed (non-blocking) :', callbackErr.message)
            }
        }

        return res.status(200).json({
            success: true,
            message: 'Interview completed. Report generated.',
            report:  reportData
        })
    } catch (e) {
        console.log(e);
        return res.status(500).json({ success: false, message: 'Something went wrong ! Please try again' })
    }
}

/* getReport controller */
const getReport = async (req, res) => {
    /* step 1 :Extract id from req.params */
    const { id } = req.params

    try {
        /* step 2 :load session with report from db */
        const session = await InterviewSession.findById(id)
        if (!session) {
            return res.status(404).json({ success: false, message: 'Session not found.' })
        }

        if (session.status !== 'completed') {
            return res.status(400).json({ success: false, message: 'Interview is not yet completed.' })
        }

        return res.status(200).json({
            success: true,
            session: {
                _id: session._id,
                role: session.role,
                difficulty: session.difficulty,
                studentEmail: session.studentEmail,
                completedAt: session.completedAt,
                questions: session.questions,
                answers: session.answers,
                codeSubmission: session.codeSubmission,
                report: session.report
            }
        })
    } catch (e) {
        console.log(e);
        return res.status(500).json({ success: false, message: 'Something went wrong ! Please try again' })
    }
}

/* getCompanySessions controller */
const getCompanySessions = async (req, res) => {
    try {
        const mongoose = require('mongoose');
        /* convert string id to ObjectId for querying, since DB might store it as ObjectId */
        const objId = new mongoose.Types.ObjectId(req.user.id);
        
        /* step 1 :find all sessions belonging to this company from db, newest first */
        const sessions = await InterviewSession.find({ 
            $or: [
                { companyId: req.user.id }, 
                { companyId: objId }
            ]
        })
            .select('studentEmail role difficulty status startedAt completedAt createdAt report.overallScore')
            .sort({ createdAt: -1 })

        return res.status(200).json({
            success: true,
            sessions
        })
    } catch (e) {
        console.log(e);
        return res.status(500).json({ success: false, message: 'Something went wrong ! Please try again' })
    }
}

/* getStudentDashboard controller */
const getStudentDashboard = async (req, res) => {
    try {
        const studentEmail = req.user.email

        /* step 1 :fetch all sessions for this student */
        const sessions = await InterviewSession.find({ studentEmail }).sort({ createdAt: -1 })

        /* step 2 :split into pending and completed */
        const pendingInterviews = sessions.filter(s => s.status === 'pending')
        const completedInterviews = sessions.filter(s => s.status === 'completed')

        /* step 3 :calculate average score from completed interviews */
        let avgScore = null
        if (completedInterviews.length > 0) {
            const totalScore = completedInterviews.reduce((sum, s) => {
                return sum + (s.report?.overallScore || 0)
            }, 0)
            avgScore = Math.round(totalScore / completedInterviews.length)
        }

        return res.status(200).json({
            success: true,
            pendingInterviews,
            completedInterviews,
            avgScore
        })

    } catch (error) {
        console.log('getStudentDashboard Error :', error)
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch student dashboard data.'
        })
    }
}

/* getVideoUploadParams controller */
const getVideoUploadParams = async (req, res) => {
    const { id }            = req.params
    const { questionIndex } = req.query

    /* condition :questionIndex must be provided */
    if (questionIndex === undefined) {
        return res.status(400).json({ success: false, message: 'questionIndex is required.' })
    }

    try {
        /* step 1 :verify the session exists */
        const session = await InterviewSession.findById(id)
        if (!session) {
            return res.status(404).json({ success: false, message: 'Session not found.' })
        }

        /* step 2 :generate and return signed cloudinary upload parameters */
        const { generateSignedUploadParams } = require('../services/cloudinaryService')
        const uploadParams = generateSignedUploadParams(id, questionIndex)

        return res.status(200).json({ success: true, uploadParams })

    } catch (e) {
        console.log('getVideoUploadParams Error :', e)
        return res.status(500).json({ success: false, message: 'Could not generate upload params.' })
    }
}

/* submitVideoAnswer controller */
const submitVideoAnswer = async (req, res) => {
    const { id }                      = req.params
    const { questionIndex, videoUrl } = req.body

    /* condition :both fields are required */
    if (!videoUrl || questionIndex === undefined) {
        return res.status(400).json({ success: false, message: 'questionIndex and videoUrl are required.' })
    }

    try {
        /* step 1 :find the session */
        const session = await InterviewSession.findById(id)
        if (!session) {
            return res.status(404).json({ success: false, message: 'Session not found.' })
        }

        if (session.status !== 'active') {
            return res.status(400).json({ success: false, message: 'Session is not active.' })
        }

        const question = session.questions[questionIndex]
        if (!question) {
            return res.status(400).json({ success: false, message: 'Invalid question index.' })
        }

        /* step 2 :transcribe the video using assemblyai */
        console.log(`Transcribing video for session ${id} question ${questionIndex}...`)
        const { transcribeVideo }       = require('../services/assemblyService')
        const transcript                = await transcribeVideo(videoUrl)

        /* step 3 :build the answer document */
        const answerDoc = {
            questionIndex,
            question:           question.question,
            type:               question.type,
            answer:             transcript,
            videoUrl,
            transcript,
            submittedAt:        new Date()
        }

        /* step 4 :replace existing answer or push new one */
        const existingIndex = session.answers.findIndex(a => a.questionIndex === questionIndex)
        if (existingIndex !== -1) {
            session.answers[existingIndex] = answerDoc
        } else {
            session.answers.push(answerDoc)
        }

        session.currentQuestionIndex = Math.max(session.currentQuestionIndex, questionIndex + 1)
        await session.save()

        return res.status(200).json({
            success:    true,
            message:    'Video answer transcribed and saved.',
            transcript
        })

    } catch (e) {
        console.log('submitVideoAnswer Error :', e)
        return res.status(500).json({ success: false, message: 'Video evaluation failed. Please try again.' })
    }
}

/* handleTextPracticeStart controller */
const handleTextPracticeStart = async (req, res) => {
    const { role } = req.body

    /* condition :role is required */
    if (!role) {
        return res.status(400).json({ success: false, message: 'role is required.' })
    }

    try {
        /* step 1 :generate questions and pick the first one */
        const questions    = await generateInterviewQuestions(role, 'medium', '')
        const firstQuestion = questions[0]?.question || `Tell me about yourself as a ${role}.`

        return res.status(200).json({ success: true, firstQuestion })

    } catch (e) {
        console.log('handleTextPracticeStart Error :', e)
        return res.status(500).json({ success: false, message: 'Could not generate question.' })
    }
}

/* handleTextPracticeChat controller */
const handleTextPracticeChat = async (req, res) => {
    const { role, question, answer, questionNumber = 1, previousQA = [] } = req.body

    /* condition :all fields are required */
    if (!role || !question || !answer) {
        return res.status(400).json({ success: false, message: 'role, question and answer are required.' })
    }

    try {
        /* step 1 :evaluate the student answer */
        const { score, feedback } = await evaluateAnswer(question, answer)

        /* step 2 :if this was the last question, return a summary */
        if (questionNumber >= 5) {
            const allQA   = [...previousQA, { question, answer, score, feedback }]
            const avgScore = Math.round(
                allQA.reduce((sum, qa) => sum + (qa.score || 0), 0) / allQA.length
            )
            return res.status(200).json({
                success: true,
                score,
                feedback,
                isComplete: true,
                summary: {
                    avgScore,
                    totalQuestions: allQA.length,
                    message: `Practice complete! Your average score was ${avgScore}/10.`
                }
            })
        }

        /* step 3 :generate next question using a fresh pool from gemini */
        const allAsked     = [...previousQA.map(qa => qa.question), question]
        const pool         = await generateInterviewQuestions(role, 'medium', '')
        const nextQuestion = pool.find(q => !allAsked.includes(q.question))?.question
            || pool[questionNumber]?.question
            || `Tell me more about your experience with ${role}.`

        return res.status(200).json({
            success: true,
            score,
            feedback,
            isComplete: false,
            nextQuestion
        })

    } catch (e) {
        console.log('handleTextPracticeChat Error :', e)
        return res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' })
    }
}

module.exports = {
    createSession,
    joinSession,
    startSession,
    submitAnswer,
    submitCode,
    completeSession,
    getReport,
    getCompanySessions,
    getStudentDashboard,
    getVideoUploadParams,
    submitVideoAnswer,
    handleTextPracticeStart,
    handleTextPracticeChat
}
