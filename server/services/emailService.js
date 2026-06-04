const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmail({ to, subject, text, html }) {
    try {
        const { data, error } = await resend.emails.send({
            from: process.env.FROM_EMAIL || 'InterviewPilot <noreply@resend.dev>',
            to,
            subject,
            text,
            html
        });
        if (error) {
            console.error('Email send error via Resend:', error);
            return false;
        }
        return true;
    } catch (e) {
        console.error('Email service exception:', e);
        return false;
    }
}

module.exports = { sendEmail };
