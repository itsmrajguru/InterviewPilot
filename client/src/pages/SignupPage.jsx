import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signupUser } from "../services/authService";


export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student"); //default role set to student
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  /* This function calls the SignUpPage axios and now passes the role */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await signupUser({ email, password, role }); //change 1:added role

      if (data && data.success) {
        setError("");
        /* redirect to the OTP verification page, passing email via navigation state
        so VerifySignupOtpPage knows which email to verify */
        navigate("/verify-signup-otp", { state: { email } });
      } else {
        setError(data.message || "Signup failed. Please check your details.");
      }
    } catch (err) {
      console.error("Signup Flow Error:", err);
      const serverMessage = err.response?.data?.message;
      setError(serverMessage || err.message || "Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex ip-bg-page">

      {/*added new 40-60 view
and this is the left side 60 panel*/}
      <div className="hidden lg:flex lg:flex-[0.6] ip-auth-left shadow-[inset_-20px_0_40px_rgba(0,0,0,0.1)]">

        {/* this diaplays the content on the left panel with 
carrersync logo and the text below it
we have also added the return to home page here*/}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[120px]" />
        <div className="relative z-10 w-full max-w-[440px] text-center">
          {/* careersync logo */}
          <img
            src="/logo.svg"
            alt="InterviewPilot Logo"
            className="w-32 h-32 mx-auto mb-6 shadow-2xl rounded-[32px] border border-white/10 p-2"
            style={{ filter: "drop-shadow(0 0 50px rgba(0, 199, 183, 0.3))" }}
          />
          <h2 className="text-[52px] font-display font-black text-white leading-[0.9] tracking-[-3px] mb-3">
            Build your <span className="text-primary-400">future.</span>
          </h2>
          <p className="text-[17px] text-white/60 font-medium leading-relaxed mb-4 mx-auto max-w-[380px]">
            The unified network for professional growth. Join thousands of candidates and companies building the next generation of career infrastructure.
          </p>
        </div>
      </div>

      {/* added new 40-60 view
      and this is the right side 40 panel*/}
      <div className="flex-1 lg:flex-[0.4] ip-auth-right relative z-10">
        <div className="w-full max-w-[320px] flex flex-col gap-4">

          {/* mobile logo - only visible on small screens */}
          <div className="lg:hidden flex justify-center mb-2" onClick={() => navigate("/")}>
            <img src="/logo.svg" alt="Logo" className="w-14 h-14 rounded-2xl shadow-lg ip-border" />
          </div>

          {/* Hero section */}
          <div className="text-left">
            <h1 className="text-[26px] font-display font-black ip-text-primary tracking-[-1.5px] leading-tight mb-0.5">
              Create Account.
            </h1>
            <p className="ip-text-secondary text-[12px] font-medium leading-tight">
              Join the unified network for careers.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="ip-alert ip-alert-danger animate-fade-up">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-1.5" />
              <span>{error}</span>
            </div>
          )}

          {/*through this form, we will take the email and password
from the user and log them in directly  */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">

            {/* Role Selector...
from here we shift the user credentials among student and company
depending upon the type of user */}
            <div className="ip-form-group">
              <label className="ip-label">Identity</label>
              <div className="grid grid-cols-2 gap-1 p-0.5 ip-bg-subtle rounded-lg">
                <button
                  type="button"
                  onClick={() => setRole("student")}
                  className={`py-1 rounded-md text-[10px] font-bold transition-all ${role === "student" ? "bg-white ip-text-primary shadow-sm" : "ip-text-secondary"}`}
                >Candidate
                </button>
                <button
                  type="button"
                  onClick={() => setRole("company")}
                  className={`py-1 rounded-md text-[10px] font-bold transition-all ${role === "company" ? "bg-white ip-text-primary shadow-sm" : "ip-text-secondary"}`}
                >Employer
                </button>
              </div>
            </div>

            <div className="ip-form-group">
              <label className="ip-label">Email address</label>
              <input
                type="email"
                name="email"
                className="ip-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@company.com"
              />
            </div>

            <div className="ip-form-group">
              <label className="ip-label">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="ip-input pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  minLength={6}
                />
                {/* the eye button that display , and undisplay the password 
to show and hide it for the user */}
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 ip-text-muted hover:text-black transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                  )}
                </button>
              </div>
            </div>

            {/* submit button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 mt-0.5"
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          <div className="text-center text-[11px] ip-text-secondary font-medium border-t ip-border-top pt-4">
            Already have an account?{" "}
            <Link to="/login" className="ip-text-primary hover:text-primary-500 font-black transition-colors underline decoration-primary-500/20 hover:decoration-primary-500">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
