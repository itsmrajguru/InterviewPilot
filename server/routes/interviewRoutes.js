//creating routes 

const express = require('express')
const interviewRouter = express.Router()

//importing the controllers 
const {
    createSession,
    joinSession,
    startSession,
    submitAnswer,
    submitCode,
    completeSession,
    getReport,
    getCompanySessions,
    getStudentDashboard
} = require('../controllers/interviewController')

/* importing the auth middleware */
const { protect } = require('../middleware/authMiddleware')


/* Company / Recruiter routes */

interviewRouter.post('/create', protect, createSession)
interviewRouter.get('/company/sessions', protect, getCompanySessions)


/* Student / Public routes */
interviewRouter.get('/student/dashboard', protect, getStudentDashboard)
interviewRouter.get('/join/:token', joinSession)
interviewRouter.post('/:id/start', startSession)
interviewRouter.post('/:id/answer', submitAnswer)

/* student submits code — Judge0 runs it, Gemini reviews quality */
interviewRouter.post('/:id/code/submit', submitCode)
/* student finishes all questions — Gemini writes the final report */
interviewRouter.post('/:id/complete', completeSession)


/* Report route */

/* fetch the full report — accessible to both the student and the recruiter */
interviewRouter.get('/:id/report', protect, getReport)

module.exports = { interviewRouter }
