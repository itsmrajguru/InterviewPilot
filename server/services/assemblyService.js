//creating assemblyService

const axios = require('axios')
require('dotenv').config()

const ASSEMBLY_KEY = process.env.ASSEMBLYAI_API_KEY
const BASE_URL     = 'https://api.assemblyai.com/v2'

/* common headers used for every assemblyai request */
const headers = { authorization: ASSEMBLY_KEY }

/* transcribeVideo service */
const transcribeVideo = async (videoUrl) => {
    try {
        /* step 1 :submit the video url for transcription */
        const { data: job } = await axios.post(
            `${BASE_URL}/transcript`,
            { audio_url: videoUrl, language_code: 'en' },
            { headers }
        )

        const transcriptId = job.id

        /* step 2 :poll until completed or failed */
        for (let i = 0; i < 30; i++) {
            /* wait 2 seconds between each poll */
            await new Promise(r => setTimeout(r, 2000))

            const { data: result } = await axios.get(
                `${BASE_URL}/transcript/${transcriptId}`,
                { headers }
            )

            if (result.status === 'completed') {
                return result.text || ''
            }

            if (result.status === 'error') {
                console.log('AssemblyAI transcription error :', result.error)
                return ''
            }
        }

        /* inform to the developer */
        console.log('AssemblyAI transcription timeout after 60s')
        return ''

    } catch (e) {
        console.log('transcribeVideo Error :', e.message)
        return ''
    }
}

module.exports = { transcribeVideo }
