//creating routes 

const express = require('express')
const interviewRouter = express.Router()

//importing the controllers 
const {
    createSession,
    joinSession,
    startSession,
    submitAnswer,
    completeSession,
    getReport,
    getCompanySessions,
    getStudentDashboard,
    getVideoUploadParams,
    submitVideoAnswer,
    handleTextPracticeStart,
    handleTextPracticeChat
} = require('../controllers/interviewController')

const { generateSessionPDF } = require('../services/pdfService')
const InterviewSession = require('../models/InterviewModel/InterviewSession')

/* importing the auth middleware */
const { protect } = require('../middleware/authMiddleware')

/* flexibleAuth middleware */
const flexibleAuth = (req, res, next) => {
    const apiSecret = req.headers['x-api-secret']

    if (apiSecret) {
        /* CareerSync is calling — verify the shared API secret */
        if (apiSecret !== process.env.INTERVIEWPILOT_API_SECRET) {
            return res.status(401).json({ success: false, message: 'Invalid API secret.' })
        }
        /* set a synthetic user so createSession does not crash on req.user */
        req.user = { id: 'careersync-service', role: 'service' }
        return next()
    }

    /* otherwise fall through to normal JWT auth */
    return protect(req, res, next)
}


/* Company / Recruiter routes */

interviewRouter.post('/create', flexibleAuth, createSession)
interviewRouter.get('/company/sessions', protect, getCompanySessions)


/* text practice routes — no auth required */
interviewRouter.post('/text-practice/start', handleTextPracticeStart)
interviewRouter.post('/text-practice/chat',  handleTextPracticeChat)

/* student / public routes */
interviewRouter.get('/student/dashboard', protect, getStudentDashboard)
interviewRouter.get('/join/:token', joinSession)
interviewRouter.post('/:id/start', protect, startSession)
interviewRouter.post('/:id/answer', protect, submitAnswer)

/* video answer routes */
interviewRouter.get('/:id/video-upload-params', protect, getVideoUploadParams)
interviewRouter.post('/:id/video-answer', protect, submitVideoAnswer)

/* student finishes all questions — Gemini writes the final report */
interviewRouter.post('/:id/complete', protect, completeSession)


/* Report route */

/* fetch the full report — accessible to both the student and the recruiter */
interviewRouter.get('/:id/report', protect, getReport)

interviewRouter.get('/:id/report/pdf', protect, async (req, res) => {
    try {
        const session = await InterviewSession.findById(req.params.id)
        if (!session) return res.status(404).json({ success: false, message: 'Session not found.' })
        if (session.status !== 'completed') return res.status(400).json({ success: false, message: 'Interview not yet completed.' })

        const pdfBuffer = await generateSessionPDF(session)
        const filename = `InterviewPilot_Report_${session.role.replace(/\s+/g, '_')}_${session.studentEmail.split('@')[0]}.pdf`

        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
        res.setHeader('Content-Length', pdfBuffer.length)
        res.end(pdfBuffer)
    } catch (e) {
        console.log('PDF generation error:', e)
        res.status(500).json({ success: false, message: 'PDF generation failed.' })
    }
})

module.exports = { interviewRouter }
