import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { resetPassword } from "../services/authService";


export default function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        //step 1: Fetching the token from the params
        if (!token) {
            setError("Invalid or missing reset token.");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);
        setError("");
        setMessage("");

        try {
            //Returning the response given by the backend
            const res = await resetPassword(token, password);
            setMessage(res.message || "Password reset successfully. You can now log in.");
            setPassword("");
            setConfirmPassword("");
        } catch (err) {
            console.error("Reset Password Error:", err.response?.data || err);
            const serverMessage = err.response?.data?.message;
            setError(serverMessage || err.message || "Failed to reset password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex ip-bg-page">
            {/*added new 40-60 view
and this is the left side 60 panel*/}
            <div className="hidden lg:flex lg:flex-[0.6] ip-auth-left shadow-[inset_-20px_0_40px_rgba(0,0,0,0.1)]">
                {/* Decorative elements */}
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[120px]" />

                {/* this diaplays the content on the left panel with 
                carrersync logo and the text below it
                we have also added the return to home page here*/}
                <div className="relative z-10 w-full max-w-[440px] text-center">
                    <img
                        src="/logo.svg"
                        alt="InterviewPilot Logo"
                        className="w-32 h-32 mx-auto mb-6 shadow-2xl rounded-[32px] border border-white/10 p-2"
                        style={{ filter: "drop-shadow(0 0 50px rgba(91, 72, 232, 0.3))" }}
                    />
                    <h2 className="text-[52px] font-display font-black text-white leading-[0.9] tracking-[-3px] mb-3">
                        Secure your <span className="text-primary-400">account.</span>
                    </h2>
                    <p className="text-[17px] text-white/60 font-medium leading-relaxed mb-4 mx-auto max-w-[380px]">
                        Re-establishing trust starts with a secure credential. Update your password to the highest security standards and regain full access.
                    </p>
                </div>
            </div>

            {/*This side shows the actual form with newpassword and confirm newpassword */}
            <div className="flex-1 lg:flex-[0.4] ip-auth-right relative z-10">
                <div className="w-full max-w-[320px] flex flex-col gap-6">

                    {/* mobile logo - only visible on small screens */}
                    <div className="lg:hidden flex justify-center mb-2">
                        <Link to="/">
                            <img src="/logo.svg" alt="Logo" className="w-14 h-14 rounded-2xl shadow-lg ip-border" />
                        </Link>
                    </div>

                    {/* Header section */}
                    <div className="text-left">
                        <h1 className="text-[30px] font-display font-black ip-text-primary tracking-[-1.5px] leading-tight mb-1">
                            Reset Password.
                        </h1>
                        <p className="ip-text-secondary text-[12px] font-medium leading-tight">
                            Generate a new secure password for your account.
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

                    {message ? (
                        <div className="flex flex-col gap-6">
                            <div className="ip-alert ip-alert-success animate-fade-up">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0 mt-1.5" />
                                <span>{message}</span>
                            </div>
                            <Link
                                to="/login"
                                className="btn-primary w-full py-3 text-center"
                            >
                                Return to Login
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">

                            <div className="ip-form-group">
                                <label className="ip-label">New Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className="ip-input pr-10"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        minLength="6"
                                        autoComplete="new-password"
                                    />
                                    <button type="button" onClick={() => setShowPassword(v => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 ip-text-muted hover:text-black transition-colors"
                                        tabIndex={-1} aria-label={showPassword ? "Hide" : "Show"}>
                                        {showPassword ? (
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                                        ) : (
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="ip-form-group">
                                <label className="ip-label">Confirm New Password</label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        className="ip-input pr-10"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        minLength="6"
                                        autoComplete="new-password"
                                    />
                                    {/* we have added teh eye button here
so that user can show and hide the password */}
                                    <button type="button" onClick={() => setShowConfirmPassword(v => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 ip-text-muted hover:text-black transition-colors"
                                        tabIndex={-1} aria-label={showConfirmPassword ? "Hide" : "Show"}>
                                        {showConfirmPassword ? (
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                                        ) : (
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                        )}
                                    </button>
                                </div>
                            </div>
                            {/* at the last this is the submit button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full py-3 mt-1"
                            >
                                {loading ? "Updating..." : "Update Password"}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
