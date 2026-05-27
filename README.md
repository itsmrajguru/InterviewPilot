<div align="center">

# ✈️ InterviewPilot

### AI-Powered Interview Platform — End-to-End Interview Automation

[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io)

<br/>

> **InterviewPilot** is a full-stack MERN application that automates the complete interview lifecycle —
> from AI-generated questions to live coding rounds to detailed performance reports —
> and integrates natively with [CareerSync](https://github.com/itsmrajguru), a job aggregation platform I built.
> Together, they form a **production-grade, cross-platform hiring ecosystem** built by a single developer.

<br/>

**[🌐 Live Demo](#)** &nbsp;·&nbsp; **[📽 Demo Video](#)** &nbsp;·&nbsp; **[🔗 CareerSync (Sibling Project)](#)**

</div>

---

## 🧠 The Big Idea — Cross-Platform Hiring Ecosystem

Most job platforms stop at the application stage. InterviewPilot picks up exactly where they leave off.

```
┌─────────────────────────────────────────────────────────────────────┐
│                     CAREERSYNC  (Platform 1)                        │
│   Students browse jobs → Apply → Company shortlists candidate       │
│                              │                                      │
│           Company clicks "Start Interview Process" 🚀               │
└──────────────────────────────┼──────────────────────────────────────┘
                               │  REST API call (shared API secret)
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   INTERVIEWPILOT  (Platform 2)                      │
│                                                                     │
│   📧 Invite email sent to student automatically                     │
│   🤖 Gemini AI generates role-specific questions from resume        │
│   💬 Student completes HR + Technical rounds                        │
│   💻 Student solves live coding problem (Monaco Editor + Judge0)    │
│   📊 AI generates full performance report with roadmap              │
│                              │                                      │
│        Score sent back to CareerSync automatically ✅               │
└──────────────────────────────┼──────────────────────────────────────┘
                               │  REST API callback
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│   CAREERSYNC  — Recruiter sees score on applicant panel             │
│   "Overall Score: 82/100 · View Full Report →"                      │
└─────────────────────────────────────────────────────────────────────┘
```

**No human interviewer needed. No scheduling. No coordination. Fully automated.**

---

## ⚡ Feature Highlights

### 🤖 AI-Driven Interview Engine
- Google Gemini API generates **personalized interview questions** based on the candidate's actual resume and target role
- Gemini evaluates **every answer in real time** and returns a score (0–10) + constructive feedback
- After completion, Gemini produces a **full performance report** with strengths, weaknesses, and a personalized improvement roadmap
- Multi-key rotation pattern prevents rate limiting across concurrent sessions

### 💻 Live Coding Round
- In-browser **Monaco Editor** (the same engine that powers VS Code)
- Supports **JavaScript, Python, and C++**
- Code is compiled and executed against hidden test cases via **Judge0 API**
- AI reviews the submitted code independently and gives code-quality feedback

### 📡 Real-Time Recruiter Dashboard
- **Socket.IO** powers live updates — recruiters see candidate progress in real time as they answer each question
- No refresh needed: `session:started` → `session:progress` → `session:completed` events stream live
- Compare multiple candidates side-by-side with a built-in comparison view

### 🔗 CareerSync Integration (Cross-Platform)
- Shared `JWT_SECRET` means a token from CareerSync is valid on InterviewPilot — **zero re-authentication**
- Students enter the interview via a **one-time invite link** (no account creation required)
- After interview completes, scores are **automatically pushed back** to CareerSync via a secure callback API
- Both platforms communicate using a shared `INTERVIEWPILOT_API_SECRET` — not exposed to the client

### 📄 PDF Reports
- Downloadable PDF interview reports generated server-side with **PDFKit**
- Recruiters can download and share reports with hiring managers

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 + Vite | UI framework + build tool |
| Tailwind CSS | Utility-first styling |
| Framer Motion | Page transitions + micro-animations |
| Monaco Editor | In-browser VS Code-style code editor |
| Recharts | Score radar charts + analytics |
| Socket.IO Client | Real-time session updates |
| React Router v6 | Client-side routing |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express.js | REST API server |
| MongoDB + Mongoose | Database + ODM |
| Socket.IO | Real-time bidirectional events |
| JSON Web Tokens | Auth (shared secret with CareerSync) |
| Google Gemini API | Question generation + answer evaluation + report generation |
| Judge0 API | Remote code execution + test case evaluation |
| Resend API | Transactional invite emails |
| PDFKit | Server-side PDF report generation |
| pdf-parse | Resume PDF text extraction |

---

## 🗂 Project Structure

```
InterviewPilot/
├── client/                         # React + Vite frontend
│   └── src/
│       ├── components/
│       │   ├── common/             # Navbar, Sidebar, Modal, Loader
│       │   ├── interview/          # QuestionCard, AnswerInput, Timer
│       │   ├── coding/             # CodeEditor, TestCasePanel, LanguageSelector
│       │   ├── report/             # ScoreCard, RadarChart, RoadmapSection
│       │   └── recruiter/          # CandidateRow, CompareTable, StatusBadge
│       ├── pages/                  # 13 pages covering all user flows
│       ├── context/                # AuthContext, InterviewContext
│       ├── hooks/                  # useSocket, useInterview
│       └── utils/                  # axios instance, socket singleton
│
└── server/                         # Node.js + Express backend
    ├── models/                     # User, InterviewSession, PracticeSession
    ├── routes/                     # auth, interviews, recruiter, practice, careersync
    ├── controllers/                # Business logic for each route group
    ├── services/                   # gemini, judge0, email, report, socket services
    ├── middleware/                  # JWT auth, API secret verification
    └── utils/                      # Token generator, Gemini key rotator
```

---

## 🔐 Authentication Architecture

InterviewPilot has **three distinct auth flows** by design:

```
┌──────────────────────────────────────────────────────────────────┐
│  1. CareerSync Invite Flow  (Most common)                        │
│     Student receives email → clicks /interview/join/TOKEN        │
│     NO login required — invite token is the credential           │
│     Single-use, 48-hour expiry                                   │
├──────────────────────────────────────────────────────────────────┤
│  2. Practice Mode  (Standalone student)                          │
│     Student registers/logs in on InterviewPilot                  │
│     Standard JWT auth → /practice, /dashboard                   │
│     Same JWT_SECRET as CareerSync = zero friction                │
├──────────────────────────────────────────────────────────────────┤
│  3. Recruiter Login                                              │
│     Recruiter logs in at /recruiter/login                        │
│     JWT with role: 'recruiter' → /recruiter/dashboard            │
│     Live Socket.IO room per session                              │
└──────────────────────────────────────────────────────────────────┘
```


## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local) or MongoDB Atlas account
- Google Gemini API key(s)
- Judge0 RapidAPI key
- Resend API key

### 1. Clone the repository
```bash
git clone https://github.com/itsmrajguru/InterviewPilot.git
cd InterviewPilot
```

### 2. Set up the backend
```bash
cd server
npm install
cp .env.example .env
# Fill in your values in .env
npm run dev
```

### 3. Set up the frontend
```bash
cd client
npm install
# .env already present — update VITE_API_BASE_URL if needed
npm run dev
```

### Environment Variables (server `.env`)
```env
PORT=8000
MONGO_URI=mongodb://127.0.0.1:27017/InterviewPilot
JWT_SECRET=your_shared_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
RESEND_API_KEY=re_your_key
FROM_EMAIL="InterviewPilot <hr@yourdomain.com>"
GEMINI_API_KEY_1=your_key_1
GEMINI_API_KEY_2=your_key_2
GEMINI_API_KEY_3=your_key_3
JUDGE0_API_KEY=your_rapidapi_key
JUDGE0_API_HOST=judge0-ce.p.rapidapi.com
INTERVIEWPILOT_API_SECRET=your_shared_secret_with_careersync
CAREERSYNC_BACKEND_URL=https://careersync-backend.onrender.com
CLIENT_URL=http://localhost:5173
```



## 🤝 Related Projects

This project is part of a **3-project portfolio ecosystem**:

| Project | Description | Status |
|---|---|---|
| **[CareerSync](https://github.com/itsmrajguru)** | Full-stack job aggregation platform (Internshala-style) | ✅ Live |
| **[GuruAI](https://github.com/itsmrajguru)** | AI career consultant chatbot, integrated into CareerSync | ✅ Live |
| **InterviewPilot** | AI interview platform, bridges with CareerSync | 🚧 In Development |

---

## 👨‍💻 About the Developer

**Mangesh Rajguru** — Third-year Computer Engineering student from Pune, India.

Building production-grade full-stack systems independently — from database design and AI integration
to real-time features and cross-platform API architecture.

[![GitHub](https://img.shields.io/badge/GitHub-itsmrajguru-181717?style=flat-square&logo=github)](https://github.com/itsmrajguru)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Mangesh_Rajguru-0A66C2?style=flat-square&logo=linkedin)](https://linkedin.com/in/itsmrajguru)

---

<div align="center">

**InterviewPilot** is built with ❤️ as part of the CareerSync ecosystem.

*If this project impressed you — the other two are live and deployed. Check them out.*

</div>
