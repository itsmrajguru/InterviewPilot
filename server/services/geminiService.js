//creating geminiService

const { GoogleGenerativeAI } = require('@google/generative-ai')
require('dotenv').config()

/* we store multiple api keys so that if one key hits its rate-limit
   the next one takes over automatically */
const GEMINI_KEYS = [
    process.env.GEMINI_API_KEY_1,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
].filter(Boolean)

let keyIndex = 0

const callWithFallback = async (fn) => {
    if (GEMINI_KEYS.length === 0) {
        throw new Error('No Gemini API keys found. Add GEMINI_API_KEY_1 to your .env')
    }
    let lastError
    for (let i = 0; i < GEMINI_KEYS.length; i++) {
        try {
            const client = new GoogleGenerativeAI(GEMINI_KEYS[i])
            return await fn(client)
        } catch (e) {
            lastError = e
        }
    }
    throw lastError
}

/* helper: strips markdown fences that Gemini sometimes wraps around its JSON responses */
const stripFences = (text) => {
    return text
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```$/i, '')
        .trim()
}

/* generateInterviewQuestions service */
const generateInterviewQuestions = async (role, difficulty, resumeText = '') => {

    /* step 1 :build the prompt to tell Gemini exactly what JSON shape we want */
    const prompt = `
You are a senior technical interviewer. Generate a structured set of interview questions for the following:

Role: ${role}
Difficulty: ${difficulty}
${resumeText ? `Candidate Resume Summary:\n${resumeText.slice(0, 1500)}` : ''}

Generate exactly 8 questions in this mix:
- 2 HR / behavioural questions
- 4 technical concept questions specific to the role
- 2 coding problem descriptions (describe the problem clearly, include 2 sample test cases)

Return ONLY a valid JSON array — no markdown, no extra text:
[
  {
    "type": "hr" | "technical" | "coding",
    "question": "...",
    "topic": "...",
    "testCases": [{ "input": "...", "expectedOutput": "..." }]  // only for coding type
  }
]
`

    try {
        const result = await callWithFallback(c => c.getGenerativeModel({ model: 'gemini-2.0-flash' }).generateContent(prompt))
        const text = result.response.text()
        const cleaned = stripFences(text)
        const questions = JSON.parse(cleaned)
        return questions
    } catch (e) {
        /* inform to the developer */
        console.log('generateInterviewQuestions Error :', e);
        /* return a safe fallback so the session does not crash */
        return [
            { type: 'hr', question: 'Tell me about yourself.', topic: 'Introduction' },
            { type: 'technical', question: `Explain a core concept in ${role}.`, topic: role },
        ]
    }
}

/* evaluateAnswer service */
const evaluateAnswer = async (question, answer) => {

    /* step 1 :build the prompt */
    const prompt = `
You are a strict but fair interviewer grading a candidate's answer.

Question: ${question}
Candidate's Answer: ${answer}

Grade the answer on a scale of 0-10. Consider clarity, correctness, and depth.
Return ONLY a valid JSON object — no markdown, no extra text:
{
  "score": <number 0-10>,
  "feedback": "<1-2 sentence constructive feedback>"
}
`

    try {
        const result = await callWithFallback(c => c.getGenerativeModel({ model: 'gemini-2.0-flash' }).generateContent(prompt))
        const text = result.response.text()
        const cleaned = stripFences(text)
        const evaluation = JSON.parse(cleaned)
        return {
            score: Math.min(10, Math.max(0, Number(evaluation.score))),
            feedback: evaluation.feedback || 'No feedback provided.'
        }
    } catch (e) {
        console.log('evaluateAnswer Error :', e);
        return { score: 5, feedback: 'Could not evaluate answer automatically.' }
    }
}

/* evaluateCode service */
const evaluateCode = async (problemDescription, code, language, testResults) => {

    /* step 1 :summarise test results so the prompt stays short */
    const passed = testResults.filter(t => t.passed).length
    const total = testResults.length

    /* step 2 :build the prompt */
    const prompt = `
You are a senior engineer reviewing submitted code for an interview.

Problem: ${problemDescription}
Language: ${language}
Test Cases: ${passed}/${total} passed

Code submitted:
\`\`\`
${code}
\`\`\`

Rate the code quality (0-10) and give brief, actionable feedback covering correctness, 
efficiency, and code style.
Return ONLY a valid JSON object — no markdown, no extra text:
{
  "score": <number 0-10>,
  "feedback": "<2-3 sentence feedback>"
}
`

    try {
        const result = await callWithFallback(c => c.getGenerativeModel({ model: 'gemini-2.0-flash' }).generateContent(prompt))
        const text = result.response.text()
        const cleaned = stripFences(text)
        const evaluation = JSON.parse(cleaned)
        return {
            score: Math.min(10, Math.max(0, Number(evaluation.score))),
            feedback: evaluation.feedback || 'No code feedback provided.'
        }
    } catch (e) {
        console.log('evaluateCode Error :', e);
        return { score: passed > 0 ? 6 : 2, feedback: 'Could not evaluate code automatically.' }
    }
}

/* evaluateCommunication service */
const evaluateCommunication = async (question, transcript) => {

    /* step 1 :build the evaluation prompt */
    const prompt = `
You are evaluating a candidate's spoken video interview answer.

Question: ${question}
Spoken Answer (transcript): ${transcript || '[No speech detected]'}

Rate the following on 0-10 each:
- contentScore: how correct and complete was the answer?
- communicationScore: overall spoken communication quality
- clarityScore: was it easy to understand?
- vocabularyScore: did they use correct technical/professional vocabulary?
- structureScore: did they answer in a structured, organised way?

Return ONLY valid JSON — no markdown, no extra text:
{
  "contentScore": <0-10>,
  "communicationScore": <0-10>,
  "clarityScore": <0-10>,
  "vocabularyScore": <0-10>,
  "structureScore": <0-10>,
  "feedback": "<2-3 sentences combining content accuracy and communication quality>"
}
`

    try {
        const result  = await callWithFallback(c => c.getGenerativeModel({ model: 'gemini-2.0-flash' }).generateContent(prompt))
        const cleaned = stripFences(result.response.text())
        const parsed  = JSON.parse(cleaned)
        return {
            contentScore:       Math.min(10, Math.max(0, Number(parsed.contentScore       || 5))),
            communicationScore: Math.min(10, Math.max(0, Number(parsed.communicationScore || 5))),
            clarityScore:       Math.min(10, Math.max(0, Number(parsed.clarityScore       || 5))),
            vocabularyScore:    Math.min(10, Math.max(0, Number(parsed.vocabularyScore    || 5))),
            structureScore:     Math.min(10, Math.max(0, Number(parsed.structureScore     || 5))),
            feedback:           parsed.feedback || 'No feedback provided.'
        }
    } catch (e) {
        console.log('evaluateCommunication Error :', e)
        /* safe fallback so the session does not crash */
        return {
            contentScore: 5, communicationScore: 5, clarityScore: 5,
            vocabularyScore: 5, structureScore: 5,
            feedback: 'Could not evaluate communication automatically.'
        }
    }
}

/* generateReport service */
const generateReport = async (sessionData) => {

    /* step 1 :build a compact summary of all answers and scores */
    const answerSummary = (sessionData.answers || [])
        .map((a, i) => {
            const commLine = a.communicationScore
                ? ` | Communication: ${a.communicationScore}/10 | Clarity: ${a.clarityScore}/10`
                : ''
            return `Q${i + 1} [${a.type}] Content: ${a.score}/10${commLine} — ${a.feedback}`
        })
        .join('\\n')

    /* step 2 :build the prompt */
    const prompt = `
You are a career coach writing a post-interview performance report.

Role Interviewed For: ${sessionData.role || 'Software Engineer'}
Questions and Scores:
${answerSummary}

Write a comprehensive performance report. Return ONLY a valid JSON object:
{
  "overallScore": <weighted average 0-100>,
  "communicationScore": <average communication score 0-10, based on video answers only. 0 if no video answers>,
  "videoAnswersCount": <number of questions that had video answers>,
  "summary": "<2-3 sentence overall summary>",
  "strengths": ["...", "..."],
  "weaknesses": ["...", "..."],
  "improvementRoadmap": "<3-5 sentence actionable improvement plan>"
}
`

    try {
        const result = await callWithFallback(c => c.getGenerativeModel({ model: 'gemini-2.0-flash' }).generateContent(prompt))
        const text = result.response.text()
        const cleaned = stripFences(text)
        const report = JSON.parse(cleaned)
        return report
    } catch (e) {
        console.log('generateReport Error :', e);
        /* safe fallback so the session can still complete */
        return {
            overallScore: 50,
            summary: 'Report could not be generated automatically.',
            strengths: [],
            weaknesses: [],
            improvementRoadmap: 'Please review your performance manually.'
        }
    }
}

module.exports = { generateInterviewQuestions, evaluateAnswer, evaluateCode, evaluateCommunication, generateReport }
