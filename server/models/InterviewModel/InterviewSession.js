//creating InterviewSession model

const mongoose = require('mongoose')

/* answerSchema */
const answerSchema = new mongoose.Schema({
    questionIndex: { type: Number, required: true },
    question: { type: String, required: true },

    type: { type: String, enum: ['hr', 'technical'], required: true },
    answer: { type: String, default: '' },

    score: { type: Number, default: 0 },

    feedback: { type: String, default: '' },

    /* video answer fields */
    videoUrl:           { type: String, default: '' },
    transcript:         { type: String, default: '' },
    communicationScore: { type: Number, default: 0 },
    clarityScore:       { type: Number, default: 0 },
    vocabularyScore:    { type: Number, default: 0 },
    structureScore:     { type: Number, default: 0 },

    submittedAt: { type: Date, default: Date.now }
})

const codeSubmissionSchema = new mongoose.Schema({
    problemDescription: { type: String, default: '' },

    code: { type: String, default: '' },

    language: { type: String, default: 'javascript' },
    testResults: [
        {
            input: String,
            expectedOutput: String,
            actualOutput: String,
            passed: Boolean,
            error: String,
            time: String,
            memory: Number,
            statusDescription: String
        }
    ],

    testsPassed: { type: Number, default: 0 },
    testsTotal: { type: Number, default: 0 },

    score: { type: Number, default: 0 },
    feedback: { type: String, default: '' },

    submittedAt: { type: Date, default: Date.now }
})

const reportSchema = new mongoose.Schema({
    overallScore: { type: Number, default: 0 },

    summary: { type: String, default: '' },

    strengths: [String],

    weaknesses: [String],

    improvementRoadmap: { type: String, default: '' },

    /* communication fields */
    communicationScore: { type: Number, default: 0 },
    videoAnswersCount:  { type: Number, default: 0 },

    generatedAt: { type: Date, default: Date.now }
})

const interviewSessionSchema = new mongoose.Schema(
    {

        /* stores the company user id when created from InterviewPilot frontend
           OR the string 'careersync-service' when triggered by CareerSync integration */
        companyId: { type: mongoose.Schema.Types.Mixed, required: true },

        /* stores the CareerSync applicationId when session is triggered by CareerSync */
        csApplicationId: { type: String, default: '' },

        studentEmail: { type: String, required: true },

        studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

        role: { type: String, required: true },

        difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },

        resumeText: { type: String, default: '' },

        inviteToken: { type: String, required: true, unique: true },

        inviteExpiry: { type: Date, required: true },

        status: {
            type: String,
            enum: ['pending', 'active', 'completed', 'expired'],
            default: 'pending'
        },

        startedAt: { type: Date, default: null },
        completedAt: { type: Date, default: null },

        questions: [
            {
                type: { type: String, enum: ['hr', 'technical'] },
                question: String,
                topic: String
            }
        ],

        currentQuestionIndex: { type: Number, default: 0 },

        answers: [answerSchema],

        report: { type: reportSchema, default: null }
    },
    { timestamps: true }
)

//creating a model
const InterviewSession = mongoose.model('InterviewSession', interviewSessionSchema)
module.exports = InterviewSession
