//creating interviewControllers

const crypto = require('crypto')
const InterviewSession = require('../models/InterviewModel/InterviewSession')
const { generateInterviewQuestions, evaluateAnswer, evaluateCode, generateReport } = require('../services/geminiService')
const { executeCode } = require('../services/judge0Service')
const { sendEmail } = require('../services/emailService')

/* createSession controller*/
const createSession = async (req, res) => {
    /* step 1 : extract the studentEmail, role, difficulty and resumeText from req.body coming from the frontend */
    const { studentEmail, role, difficulty = 'medium', resumeText = '' } = req.body

    /* condition :If we did not get any of them,simply return a json reply*/
    if (!studentEmail || !role) {
        return res.status(400).json({ success: false, message: 'studentEmail and role are required.' })
    }

    try {
        /* step 2 :Generate a secure random invite token and set it to expire in 48 hours */
        const inviteToken = crypto.randomBytes(32).toString('hex')
        const inviteExpiry = new Date(Date.now() + 48 * 60 * 60 * 1000)

        /* step 3 :Create the session document — status starts as pending */
        const session = await InterviewSession.create({
            companyId: req.user.id,
            studentEmail,
            role,
            difficulty,
            resumeText,
            inviteToken,
            inviteExpiry
        })

        /* step 4 :Build the invite link and send the email to the candidate via Resend */
        const joinURL = `${process.env.CLIENT_URL || 'http://localhost:5175'}/interview/join/${inviteToken}`

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
                <p style="color:#888;font-size:12px;">If you did not expect this email, you can safely ignore it.</p>
            </div>
        `

        /* send the invite email without blocking the response */
        setTimeout(async () => {
            try {
                const emailSent = await sendEmail({
                    to: studentEmail,
                    subject: `InterviewPilot — Interview Invitation for ${role}`,
                    text: `You have been invited to interview for ${role}. Join here: ${joinURL}`,
                    html
                })
                if (!emailSent) {
                    console.log(`Invite Email send failed...`);
                }
                console.log("Email Sent Successfully")
            } catch (e) {
                console.log('Email Send Error :', e);
            }
        }, 0)

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

        /* step 3 :generate questions with Gemini if they have not been generated yet */
        if (!session.questions || session.questions.length === 0) {
            console.log('Generating interview questions via Gemini...')
            const questions = await generateInterviewQuestions(
                session.role,
                session.difficulty,
                session.resumeText
            )
            session.questions = questions
            await session.save()
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
    /* step 1 :Extract id from req.params */
    const { id } = req.params

    try {
        /* step 2 :find the session */
        const session = await InterviewSession.findById(id)
        if (!session) {
            return res.status(404).json({ success: false, message: 'Session not found.' })
        }

        /* condition :only pending sessions can be started */
        if (session.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: `Session is already ${session.status}.`
            })
        }

        /* step 3 :mark as active in the db */
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
                currentQuestionIndex: session.currentQuestionIndex
            }
        })
    } catch (e) {
        console.log(e);
        return res.status(500).json({ success: false, message: 'Something went wrong ! Please try again' })
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

        /* step 5 :get Gemini code-quality score and feedback */
        const { score, feedback } = await evaluateCode(
            question.question,
            code,
            language,
            testResults
        )

        /* step 6 :save the code submission to the session in the db */
        session.codeSubmission = {
            problemDescription: question.question,
            code,
            language,
            testResults,
            testsPassed,
            testsTotal,
            score,
            feedback,
            submittedAt: new Date()
        }

        /* also save it as an answer entry so it counts in the report */
        const answerDoc = {
            questionIndex,
            question: question.question,
            type: 'coding',
            answer: code,
            score,
            feedback,
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
            message: 'Code executed and evaluated.',
            testResults,
            testsPassed,
            testsTotal,
            evaluation: { score, feedback }
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
        const reportData = await generateReport({
            role: session.role,
            answers: session.answers
        })

        /* step 4 :save the report and mark session completed in the db */
        session.report = reportData
        session.status = 'completed'
        session.completedAt = new Date()
        await session.save()

        return res.status(200).json({
            success: true,
            message: 'Interview completed. Report generated.',
            report: reportData
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
        /* step 1 :find all sessions belonging to this company from db, newest first */
        const sessions = await InterviewSession.find({ companyId: req.user.id })
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

        /* step 3 :evaluate the transcript */
        console.log(`Evaluating communication for session ${id} question ${questionIndex}...`)
        const { evaluateCommunication } = require('../services/geminiService')
        const evaluation                = await evaluateCommunication(question.question, transcript)

        /* step 4 :build the answer document */
        const answerDoc = {
            questionIndex,
            question:           question.question,
            type:               question.type,
            answer:             transcript,
            videoUrl,
            transcript,
            score:              evaluation.contentScore,
            communicationScore: evaluation.communicationScore,
            clarityScore:       evaluation.clarityScore,
            vocabularyScore:    evaluation.vocabularyScore,
            structureScore:     evaluation.structureScore,
            feedback:           evaluation.feedback,
            submittedAt:        new Date()
        }

        /* step 5 :replace existing answer or push new one */
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
            message:    'Video answer transcribed and evaluated.',
            transcript,
            evaluation
        })

    } catch (e) {
        console.log('submitVideoAnswer Error :', e)
        return res.status(500).json({ success: false, message: 'Video evaluation failed. Please try again.' })
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
    submitVideoAnswer
}
