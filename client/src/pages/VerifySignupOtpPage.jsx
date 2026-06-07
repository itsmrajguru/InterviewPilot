import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { verifySignupOtp } from "../services/authService";


export default function VerifySignupOtpPage() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  /* extract the email passed from SignupPage via navigation state */
  const location = useLocation();
  const email = location.state?.email;

  /* if user lands here without going through signup, send them back */
  if (!email) {
    navigate("/signup");
    return null;
  }

  /* This function verifies the OTP sent to the user's email during signup */
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      //step 1 : call the verifySignupOtp api with email and otp
      const data = await verifySignupOtp({ email, otp });

      if (data && data.success) {
        //step 2 : on success, redirect to login page
        navigate("/login");
      } else {
        setError(data.message || "Invalid OTP. Please try again.");
      }
    } catch (err) {
      console.error("OTP Verify Error:", err);
      setError(err.response?.data?.message || err.message || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row ip-bg-page">

      {/* we created a 40-60 panel view and added the left side showup view here */}
      <div className="hidden lg:flex lg:flex-[0.6] ip-auth-left shadow-[inset_-20px_0_40px_rgba(0,0,0,0.1)]">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[120px]" />
        <div className="relative z-10 w-full max-w-[440px] text-center">
          <img
            src="/logo.svg"
            alt="InterviewPilot Logo"
            className="w-32 h-32 mx-auto mb-6 shadow-2xl rounded-[32px] border border-white/10 p-2"
            style={{ filter: "drop-shadow(0 0 50px rgba(0, 199, 183, 0.3))" }}
          />
          <h2 className="text-[52px] font-display font-black text-white leading-[0.9] tracking-[-3px] mb-3">
            Final <span className="text-primary-400">step.</span>
          </h2>
          <p className="text-[17px] text-white/60 font-medium leading-relaxed mb-4 mx-auto max-w-[380px]">
            We prioritize account integrity above all. This final verification step ensures that your professional profile remains protected.
          </p>
        </div>
      </div>

      {/* and this right side content actuually showws the form here */}
      <div className="flex-1 lg:flex-[0.4] ip-auth-right relative z-10 px-4 md:px-6 lg:px-8">
        <div className="w-full max-w-[320px] flex flex-col gap-8">

          {/* mobile logo - only visible on small screens */}
          <div className="lg:hidden flex justify-center mb-2" onClick={() => navigate("/")}>
            <img src="/logo.svg" alt="Logo" className="w-14 h-14 rounded-2xl shadow-lg ip-border" />
          </div>

          {/* Hero section */}
          <div className="text-left">
            <h1 className="text-[30px] font-display font-black ip-text-primary tracking-[-1.5px] leading-tight mb-2">
              Verify Email.
            </h1>
            <p className="ip-text-secondary text-[12px] font-medium leading-tight">
              A 6-digit code has been sent to <span className="font-black ip-text-primary underline decoration-primary-400">{email}</span>.
            </p>
          </div>


          {/* Displaying state messages 
i.e. those error message , which shoudl be shown on incorrect email,
incorrect password, email not verified... etc*/}
          {error && (
            <div className="ip-alert ip-alert-danger animate-fade-up">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-1.5" />
              <span>{error}</span>
            </div>
          )}

          {/* this form takes the input data from the user
 and sends to the backend through axios */}
          <form onSubmit={handleOtpSubmit} className="flex flex-col gap-6">
            <div className="ip-form-group">
              <label className="ip-label text-center">Verification Code</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                className="ip-input text-center tracking-[0.5em] text-3xl font-black py-4"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                required
                placeholder="000000"
                autoFocus
              />
              <p className="text-[9px] ip-text-muted text-center font-bold uppercase tracking-wider mt-1">Expires in 10 minutes</p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="btn-primary w-full py-3"
              >
                {loading ? "Verifying..." : "Confirm Verification"}
              </button>

              <button
                type="button"
                onClick={() => navigate("/signup")}
                className="btn-ghost text-[11px] font-black uppercase tracking-widest"
              >
                ← Use different email
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
