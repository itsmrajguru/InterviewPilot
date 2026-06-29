import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../services/authService";


export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    /* This function call the forgotPassword axios,and just returns
    the response coming from the server,whether it may be error or success */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setMessage("");

        try {
            const res = await forgotPassword(email);
            setMessage(res.message || "Password reset link sent to your email.");
            setEmail("");
        } catch (err) {
            setError(err.message || "Failed to send reset email.");
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
                        Account Recovery
                    </h1>
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                        Enter your email below to receive a secure recovery link
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
                                <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="name@example.com"
                                    className="px-3 py-2 rounded-lg text-sm w-full outline-none transition-all"
                                    style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)", color: "var(--text)" }}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full py-2.5 mt-2"
                            >
                                {loading ? "Sending link..." : "Send Reset Link"}
                            </button>
                        </form>
                    )}

                    {!message && (
                        <div className="mt-6 pt-5 flex flex-col gap-2 text-center text-xs" style={{ borderTop: "1px solid var(--border)", color: "var(--text-secondary)" }}>
                            <div>
                                Remember your password? <Link to="/login" className="font-bold" style={{ color: "var(--text)" }}>Back to Login</Link>
                            </div>
                        </div>
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
