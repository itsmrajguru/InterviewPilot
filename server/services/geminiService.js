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

/* helper: returns a new Gemini client using the next available key */
const getClient = () => {
    if (GEMINI_KEYS.length === 0) {
        throw new Error('No Gemini API keys found. Add GEMINI_API_KEY_1 to your .env')
    }
    const key = GEMINI_KEYS[keyIndex % GEMINI_KEYS.length]
    keyIndex++
    return new GoogleGenerativeAI(key)
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
    const client = getClient()
    const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' })

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
        const result = await model.generateContent(prompt)
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
    const client = getClient()
    const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' })

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
        const result = await model.generateContent(prompt)
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
    const client = getClient()
    const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' })

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
        const result = await model.generateContent(prompt)
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

/* generateReport service */
const generateReport = async (sessionData) => {
    const client = getClient()
    const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' })

    /* step 1 :build a compact summary of all answers + scores for the prompt */
    const answerSummary = (sessionData.answers || [])
        .map((a, i) => `Q${i + 1} [${a.type}] Score: ${a.score}/10 — ${a.feedback}`)
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
  "summary": "<2-3 sentence overall summary>",
  "strengths": ["...", "..."],
  "weaknesses": ["...", "..."],
  "improvementRoadmap": "<3-5 sentence actionable improvement plan>"
}
`

    try {
        const result = await model.generateContent(prompt)
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

module.exports = { generateInterviewQuestions, evaluateAnswer, evaluateCode, generateReport }
