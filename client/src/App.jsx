import { BrowserRouter, Routes, Route, } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import CompanyLoginPage from "./pages/CompanyLoginPage";
import SignupPage from "./pages/SignupPage";
import VerifySignupOtpPage from "./pages/VerifySignupOtpPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

/* student pages */
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentInterviews from "./pages/student/StudentInterviews";
import StudentPractice from "./pages/student/StudentPractice";
import StudentReports from "./pages/student/StudentReports";

/* Company / Recruiter pages */
import CompanyDashboard from "./pages/company/CompanyDashboard";

/* Interview flow pages — join link → room → report */
import JoinInterviewPage from "./pages/interview/JoinInterviewPage";
import InterviewRoomPage from "./pages/interview/InterviewRoomPage";
import InterviewReportPage from "./pages/interview/InterviewReportPage";

//Page Not Found Page
import NotFoundPage from "./pages/NotFoundPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/company-login" element={<CompanyLoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/verify-signup-otp" element={<VerifySignupOtpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* student routes */}
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/interviews" element={<StudentInterviews />} />
        <Route path="/student/practice" element={<StudentPractice />} />
        <Route path="/student/reports" element={<StudentReports />} />

        {/* Company / Recruiter routes */}
        <Route path="/company/dashboard" element={<CompanyDashboard />} />

        {/* Interview flow — public join link, protected room and report */}
        <Route path="/interview/join/:token" element={<JoinInterviewPage />} />
        <Route path="/interview/:id" element={<InterviewRoomPage />} />
        <Route path="/interview/:id/report" element={<InterviewReportPage />} />

        {/* Catch-all route to display the premium 404 page... */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
