//creating interviewService

import api from '../../api'

export async function createInterviewSession({ studentEmail, role, difficulty, resumeText }) {
    return api.post('interviews/create', { studentEmail, role, difficulty, resumeText })
}

export async function getCompanySessions() {
    return api.get('interviews/company/sessions')
}

export async function joinSession(token) {
    return api.get(`interviews/join/${token}`)
}

export async function startSession(sessionId) {
    return api.post(`interviews/${sessionId}/start`)
}

export async function submitAnswer({ sessionId, questionIndex, answer }) {
    return api.post(`interviews/${sessionId}/answer`, { questionIndex, answer })
}

export async function submitCode({ sessionId, code, language, questionIndex }) {
    return api.post(`interviews/${sessionId}/code/submit`, { code, language, questionIndex })
}

export async function completeSession(sessionId) {
    return api.post(`interviews/${sessionId}/complete`)
}

export async function getReport(sessionId) {
    return api.get(`interviews/${sessionId}/report`)
}

export async function getStudentDashboard() {
    return api.get('interviews/student/dashboard')
}

export async function getVideoUploadParams(sessionId, questionIndex) {
    return api.get(`interviews/${sessionId}/video-upload-params?questionIndex=${questionIndex}`)
}

export async function submitVideoAnswer({ sessionId, questionIndex, videoUrl }) {
    return api.post(`interviews/${sessionId}/video-answer`, { questionIndex, videoUrl })
}
