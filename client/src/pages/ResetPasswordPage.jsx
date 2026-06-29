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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#e4e8ee", fontFamily: "var(--font-sans)", fontSize: 14 }}>
            <div className="w-full max-w-md p-6 md:p-8">
                
                {/* logo and header */}
                <div className="text-center mb-8 flex flex-col items-center">
                    <Link to="/" className="cursor-pointer mb-4 flex items-center justify-center w-12 h-12 rounded-xl" style={{ background: "linear-gradient(135deg, #0f6e56 0%, #1d9e75 100%)", boxShadow: "0 4px 12px rgba(29, 158, 117, 0.3)" }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight mb-1" style={{ color: "var(--text)" }}>
                        Reset Password
                    </h1>
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                        Generate a new secure password for your account
                    </p>
                </div>

                {/* auth card */}
                <div className="ip-card p-6 md:p-8">
                    {error && (
                        <div className="mb-6 flex items-center gap-2 text-sm px-4 py-3 rounded" style={{ background: "var(--color-danger-bg)", color: "var(--color-danger-text)", border: "1px solid var(--color-danger-border)" }}>
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {message ? (
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center gap-2 text-sm px-4 py-3 rounded" style={{ background: "var(--color-success-bg)", color: "var(--color-success-text)", border: "1px solid var(--color-success-border)" }}>
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                                <span>{message}</span>
                            </div>
                            <Link
                                to="/login"
                                className="btn-primary w-full py-2.5 text-center"
                            >
                                Return to Login
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>New Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        placeholder="••••••••"
                                        minLength={6}
                                        autoComplete="new-password"
                                        className="px-3 py-2 pr-10 rounded-lg text-sm w-full outline-none transition-all"
                                        style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)", color: "var(--text)" }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(v => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                                        style={{ color: "var(--text-muted)" }}
                                        tabIndex={-1}
                                    >
                                        {showPassword ? (
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                                        ) : (
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Confirm New Password</label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        placeholder="••••••••"
                                        minLength={6}
                                        autoComplete="new-password"
                                        className="px-3 py-2 pr-10 rounded-lg text-sm w-full outline-none transition-all"
                                        style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)", color: "var(--text)" }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(v => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                                        style={{ color: "var(--text-muted)" }}
                                        tabIndex={-1}
                                    >
                                        {showConfirmPassword ? (
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                                        ) : (
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full py-2.5 mt-2"
                            >
                                {loading ? "Updating..." : "Update Password"}
                            </button>
                        </form>
                    )}
                </div>
                
                {/* footer */}
                <div className="mt-8 text-center flex items-center justify-center gap-4 text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                    <span>&copy; 2026 InterviewPilot</span>
                    <Link to="/privacy">Privacy</Link>
                    <Link to="/legal">Legal</Link>
                </div>
            </div>
        </div>
    );
}
