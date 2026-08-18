import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

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
import StudentProfile from "./pages/student/StudentProfile";
import StudentSettings from "./pages/student/StudentSettings";

/* company / recruiter pages */
import CompanyDashboard from "./pages/company/CompanyDashboard";
import CompanyInterviews from "./pages/company/CompanyInterviews";
import CompanyCompare from "./pages/company/CompanyCompare";
import CompanyProfile from "./pages/company/CompanyProfile";

/* Interview flow pages — join link → room → report */
import JoinInterviewPage from "./pages/interview/JoinInterviewPage";
import InterviewRoomPage from "./pages/interview/InterviewRoomPage";
import InterviewReportPage from "./pages/interview/InterviewReportPage";

//Page Not Found Page
import NotFoundPage from "./pages/NotFoundPage";
import PrivateRoute from "./components/PrivateRoute";

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public routes */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/company-login" element={<CompanyLoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/verify-signup-otp" element={<VerifySignupOtpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* student routes */}
        <Route path="/student/dashboard" element={<PrivateRoute role="student"><StudentDashboard /></PrivateRoute>} />
        <Route path="/student/interviews" element={<PrivateRoute role="student"><StudentInterviews /></PrivateRoute>} />
        <Route path="/student/practice" element={<PrivateRoute role="student"><StudentPractice /></PrivateRoute>} />
        <Route path="/student/reports" element={<PrivateRoute role="student"><StudentReports /></PrivateRoute>} />
        <Route path="/student/profile" element={<PrivateRoute role="student"><StudentProfile /></PrivateRoute>} />
        <Route path="/student/settings" element={<PrivateRoute role="student"><StudentSettings /></PrivateRoute>} />

        {/* company / recruiter routes */}
        <Route path="/company/dashboard" element={<PrivateRoute role="company"><CompanyDashboard /></PrivateRoute>} />
        <Route path="/company/interviews" element={<PrivateRoute role="company"><CompanyInterviews /></PrivateRoute>} />
        <Route path="/company/compare" element={<PrivateRoute role="company"><CompanyCompare /></PrivateRoute>} />
        <Route path="/company/profile" element={<PrivateRoute role="company"><CompanyProfile /></PrivateRoute>} />

        {/* Interview flow — public join link, protected room and report */}
        <Route path="/interview/join/:token" element={<JoinInterviewPage />} />
        <Route path="/interview/:id" element={<InterviewRoomPage />} />
        <Route path="/interview/:id/report" element={<InterviewReportPage />} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

export default App;
