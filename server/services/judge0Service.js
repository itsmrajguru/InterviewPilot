//creating judge0Service

const axios = require('axios')
require('dotenv').config()

/* Judge0 language IDs — only the three we support for now */
const LANGUAGE_IDS = {
    javascript: 63,
    python: 71,
    cpp: 54,
    java: 62
}

/* the Judge0 RapidAPI base URL comes from .env so we can
   swap between the free tier and a self-hosted instance */
const JUDGE0_URL = process.env.JUDGE0_API_HOST || 'https://judge0-ce.p.rapidapi.com'
const JUDGE0_KEY = process.env.JUDGE0_API_KEY || ''

/* submitToJudge0 service */
const submitToJudge0 = async (code, languageId, stdin = '') => {
    /* step 1 :build the submission payload
    Judge0 expects base64-encoded source code and stdin */
    const payload = {
        source_code: Buffer.from(code).toString('base64'),
        language_id: languageId,
        stdin: Buffer.from(stdin).toString('base64'),
        /* encode output as base64 so special chars survive the round-trip */
        encode_source_code: true,
        encode_stdin: true,
        encode_expected_output: false,
    }

    const response = await axios.post(
        `${JUDGE0_URL}/submissions?base64_encoded=true&wait=false`,
        payload,
        {
            headers: {
                'Content-Type': 'application/json',
                'X-RapidAPI-Key': JUDGE0_KEY,
                'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
            }
        }
    )
    /* Judge0 returns a token we use to poll for results */
    return response.data.token
}

/* pollResult service */
const pollResult = async (token) => {
    /* step 1 :set a max poll attempts so we never hang forever */
    const MAX_ATTEMPTS = 10
    const POLL_INTERVAL_MS = 1000

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        /* step 2 :wait before each poll */
        await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS))

        const response = await axios.get(
            `${JUDGE0_URL}/submissions/${token}?base64_encoded=true`,
            {
                headers: {
                    'X-RapidAPI-Key': JUDGE0_KEY,
                    'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
                }
            }
        )

        const result = response.data

        /* condition :status_id 1 = In Queue, 2 = Processing — keep polling */
        if (result.status_id > 2) {
            /* step 3 :decode base64 output back to plain text */
            const stdout = result.stdout
                ? Buffer.from(result.stdout, 'base64').toString('utf8').trim()
                : ''
            const stderr = result.stderr
                ? Buffer.from(result.stderr, 'base64').toString('utf8').trim()
                : ''
            const compileOutput = result.compile_output
                ? Buffer.from(result.compile_output, 'base64').toString('utf8').trim()
                : ''

            return {
                statusId: result.status_id,
                statusDescription: result.status?.description || 'Unknown',
                stdout,
                stderr,
                compileOutput,
                time: result.time,
                memory: result.memory
            }
        }
    }
    /* if we exhaust all attempts, treat it as a timeout */
    return { statusId: 0, statusDescription: 'Timed Out', stdout: '', stderr: '', compileOutput: '' }
}

/* executeCode service */
const executeCode = async (code, language, testCases = []) => {
    /* step 1 :resolve the Judge0 language ID */
    const languageId = LANGUAGE_IDS[language?.toLowerCase()]
    if (!languageId) {
        throw new Error(`Unsupported language: ${language}. Supported: javascript, python, cpp, java`)
    }

    /* condition :if there are no test cases just do a dry run with empty stdin */
    if (testCases.length === 0) {
        testCases = [{ input: '', expectedOutput: '' }]
    }

    /* step 2 :submit all test cases in parallel to save time */
    const tokens = await Promise.all(
        testCases.map(tc => submitToJudge0(code, languageId, tc.input || ''))
    )

    /* step 3 :poll all submissions in parallel */
    const rawResults = await Promise.all(tokens.map(token => pollResult(token)))

    /* step 4 :compare actual output vs expected and build the final array */
    const results = rawResults.map((raw, i) => {
        const tc = testCases[i]
        const expected = (tc.expectedOutput || '').trim()
        const actual = raw.stdout.trim()

        /* condition :Accepted = status_id 3 in Judge0 */
        const passed = raw.statusId === 3 && actual === expected

        return {
            input: tc.input || '',
            expectedOutput: expected,
            actualOutput: actual,
            passed,
            error: raw.compileOutput || raw.stderr || null,
            time: raw.time,
            memory: raw.memory,
            statusDescription: raw.statusDescription
        }
    })

    return results
}

module.exports = { executeCode, LANGUAGE_IDS }
