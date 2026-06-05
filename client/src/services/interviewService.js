//creating interviewService

import api from '../../api'


/* recruiter creates a session and triggers an invite email to the candidate */
export async function createInterviewSession({ studentEmail, role, difficulty, resumeText }) {
    return api.post('interviews/create', { studentEmail, role, difficulty, resumeText })
}

/* recruiter fetches all sessions they have created */
export async function getCompanySessions() {
    return api.get('interviews/company/sessions')
}


/* student lands on the invite link — fetches session info and Gemini questions */
export async function joinSession(token) {
    return api.get(`interviews/join/${token}`)
}

/* student clicks "Start Interview" — marks session as active */
export async function startSession(sessionId) {
    return api.post(`interviews/${sessionId}/start`)
}

/* student submits an HR or technical answer — Gemini evaluates it immediately */
export async function submitAnswer({ sessionId, questionIndex, answer }) {
    return api.post(`interviews/${sessionId}/answer`, { questionIndex, answer })
}

/* student submits their code solution — Judge0 runs it, Gemini reviews quality */
export async function submitCode({ sessionId, code, language, questionIndex }) {
    return api.post(`interviews/${sessionId}/code/submit`, { code, language, questionIndex })
}

/* student finishes all questions — Gemini generates the final report */
export async function completeSession(sessionId) {
    return api.post(`interviews/${sessionId}/complete`)
}


/* fetch the full report for a completed session */
export async function getReport(sessionId) {
    return api.get(`interviews/${sessionId}/report`)
}
