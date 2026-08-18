const PDFDocument = require('pdfkit')

const ACCENT = '#c2542d'
const DARK   = '#0b132b'
const MUTED  = '#6b7280'
const LIGHT  = '#f8faff'
const GREEN  = '#047857'
const RED    = '#b91c1c'
const GOLD   = '#c8932a'

const scoreColor = (s, max = 100) => {
    const p = s / max
    if (p >= 0.75) return GREEN
    if (p >= 0.5)  return GOLD
    return RED
}

const typeLabel = (t) => ({ hr: 'HR', technical: 'Technical', coding: 'Coding' }[t] || t)

const generateSessionPDF = (session) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ size: 'A4', margin: 48, bufferPages: true })
        const chunks = []

        doc.on('data', chunk => chunks.push(chunk))
        doc.on('end', () => resolve(Buffer.concat(chunks)))
        doc.on('error', reject)

        const W = doc.page.width - 96

        doc.rect(0, 0, doc.page.width, 80).fill(DARK)
        doc.fillColor('#ffffff').fontSize(22).font('Helvetica-Bold')
            .text('InterviewPilot', 48, 22)
        doc.fillColor('rgba(255,255,255,0.55)').fontSize(11).font('Helvetica')
            .text('AI-Powered Interview Performance Report', 48, 52)

        doc.fillColor(DARK).fontSize(16).font('Helvetica-Bold')
            .text(session.role || 'Interview Report', 48, 104)

        const meta = [
            ['Candidate', session.studentEmail],
            ['Difficulty', session.difficulty ? session.difficulty.charAt(0).toUpperCase() + session.difficulty.slice(1) : '—'],
            ['Completed', session.completedAt ? new Date(session.completedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'],
        ]
        let metaY = 130
        meta.forEach(([key, val]) => {
            doc.fillColor(MUTED).fontSize(10).font('Helvetica').text(key + ':', 48, metaY)
            doc.fillColor(DARK).font('Helvetica-Bold').text(val, 130, metaY)
            metaY += 18
        })

        doc.moveTo(48, metaY + 6).lineTo(48 + W, metaY + 6).stroke('#e5e7eb')

        const report = session.report || {}
        const overallScore = report.overallScore || 0
        const sc = scoreColor(overallScore)

        let y = metaY + 22
        doc.fillColor(DARK).fontSize(13).font('Helvetica-Bold').text('Overall Score', 48, y)
        y += 20
        doc.fillColor(sc).fontSize(38).font('Helvetica-Bold').text(`${overallScore}`, 48, y)
        doc.fillColor(MUTED).fontSize(14).font('Helvetica').text('/ 100', 48 + 55, y + 12)
        y += 52

        if (report.summary) {
            doc.fillColor(DARK).fontSize(11).font('Helvetica').text(report.summary, 48, y, { width: W, lineGap: 4 })
            y += doc.heightOfString(report.summary, { width: W }) + 20
        }

        doc.moveTo(48, y).lineTo(48 + W, y).stroke('#e5e7eb')
        y += 14

        const halfW = (W - 16) / 2

        const renderList = (title, items, color, startX, startY, width) => {
            doc.fillColor(DARK).fontSize(12).font('Helvetica-Bold').text(title, startX, startY)
            let ly = startY + 18
            ;(items || []).slice(0, 5).forEach(item => {
                doc.fillColor(color).fontSize(9).font('Helvetica-Bold').text('●', startX, ly)
                doc.fillColor(DARK).fontSize(10).font('Helvetica').text(item, startX + 14, ly, { width: width - 14 })
                ly += doc.heightOfString(item, { width: width - 14 }) + 4
            })
            return ly
        }

        const ly1 = renderList('Strengths', report.strengths, GREEN, 48, y, halfW)
        const ly2 = renderList('Areas to Improve', report.weaknesses, RED, 48 + halfW + 16, y, halfW)
        y = Math.max(ly1, ly2) + 16

        if (report.improvementRoadmap) {
            doc.moveTo(48, y).lineTo(48 + W, y).stroke('#e5e7eb')
            y += 14
            doc.fillColor(DARK).fontSize(12).font('Helvetica-Bold').text('Improvement Roadmap', 48, y)
            y += 18
            doc.fillColor(DARK).fontSize(10).font('Helvetica').text(report.improvementRoadmap, 48, y, { width: W, lineGap: 4 })
            y += doc.heightOfString(report.improvementRoadmap, { width: W }) + 20
        }

        doc.moveTo(48, y).lineTo(48 + W, y).stroke('#e5e7eb')
        y += 14

        doc.fillColor(DARK).fontSize(12).font('Helvetica-Bold').text('Question-by-Question Breakdown', 48, y)
        y += 20

        const answers = session.answers || []
        answers.forEach((ans, idx) => {
            if (y > doc.page.height - 120) {
                doc.addPage()
                y = 48
            }

            const tl = typeLabel(ans.type)
            const qScore = ans.score ?? 0
            const qSC = scoreColor(qScore, 10)

            doc.rect(48, y, W, 1).fill('#e5e7eb')
            y += 8

            doc.fillColor(MUTED).fontSize(9).font('Helvetica-Bold')
                .text(`Q${idx + 1}  ·  ${tl}`, 48, y)
            doc.fillColor(qSC).fontSize(9).font('Helvetica-Bold')
                .text(`Score: ${qScore}/10`, 48 + W - 60, y, { align: 'right', width: 60 })
            y += 14

            doc.fillColor(DARK).fontSize(10).font('Helvetica-Bold')
                .text(ans.question || '', 48, y, { width: W })
            y += doc.heightOfString(ans.question || '', { width: W }) + 6

            if (ans.feedback) {
                doc.fillColor(MUTED).fontSize(9).font('Helvetica')
                    .text(ans.feedback, 48, y, { width: W, lineGap: 2 })
                y += doc.heightOfString(ans.feedback, { width: W }) + 12
            }
        })

        const totalPages = doc.bufferedPageRange().count
        for (let i = 0; i < totalPages; i++) {
            doc.switchToPage(i)
            doc.fillColor(MUTED).fontSize(9).font('Helvetica')
                .text(`Page ${i + 1} of ${totalPages}  ·  InterviewPilot`, 48, doc.page.height - 36, { width: W, align: 'center' })
        }

        doc.end()
    })
}

module.exports = { generateSessionPDF }
