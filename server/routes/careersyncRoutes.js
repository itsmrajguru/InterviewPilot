// careersyncRoutes.js
const express = require('express')
const router = express.Router()
const axios = require('axios')
const { protect } = require('../middleware/authMiddleware')

const CAREERSYNC_URL = process.env.CAREERSYNC_BACKEND_URL || 'http://localhost:8000'

/* GET /api/v1/careersync/student/profile */
router.get('/student/profile', protect, async (req, res) => {
    try {
        // Forward the auth token to CareerSync
        const token = req.headers.authorization
        const response = await axios.get(`${CAREERSYNC_URL}/api/v1/student/profile`, {
            headers: { Authorization: token }
        })
        res.status(200).json(response.data)
    } catch (e) {
        if (e.response && e.response.status === 404) {
            return res.status(404).json({ success: false, message: 'CareerSync profile not found.' })
        }
        res.status(500).json({ success: false, message: 'Failed to fetch profile from CareerSync.' })
    }
})

/* GET /api/v1/careersync/company/profile */
router.get('/company/profile', protect, async (req, res) => {
    try {
        const token = req.headers.authorization
        const response = await axios.get(`${CAREERSYNC_URL}/api/v1/company/profile`, {
            headers: { Authorization: token }
        })
        res.status(200).json(response.data)
    } catch (e) {
        if (e.response && e.response.status === 404) {
            return res.status(404).json({ success: false, message: 'CareerSync profile not found.' })
        }
        res.status(500).json({ success: false, message: 'Failed to fetch profile from CareerSync.' })
    }
})

module.exports = router
