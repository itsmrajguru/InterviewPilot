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
        <div className="min-h-screen w-full flex flex-col lg:flex-row ip-bg-page">
            {/*added new 40-60 view
            and this is the left side 60 panel*/}
            <div className="hidden lg:flex lg:flex-[0.6] ip-auth-left shadow-[inset_-20px_0_40px_rgba(0,0,0,0.1)]">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[120px]" />
                <div className="relative z-10 w-full max-w-[440px] text-center">
                    {/* this diaplays the content on the left panel with 
                    carrersync logo and the text below it
                    we have also added the return to home page here*/}
                    <img
                        src="/logo.svg"
                        alt="InterviewPilot Logo"
                        className="w-32 h-32 mx-auto mb-6 shadow-2xl rounded-[32px] border border-white/10 p-2"
                        style={{ filter: "drop-shadow(0 0 50px rgba(0, 199, 183, 0.3))" }}
                    />
                    <h2 className="text-[52px] font-display font-black text-white leading-[0.9] tracking-[-3px] mb-3">
                        Recover your <span className="text-primary-400">access.</span>
                    </h2>
                    <p className="text-[17px] text-white/60 font-medium leading-relaxed mb-4 mx-auto max-w-[380px]">
                        Identity protection is a core pillar of InterviewPilot. Recover your credentials through our encrypted channels to ensure your data remains yours.
                    </p>
                </div>
            </div>

            {/* added new 40-60 view
            and this is the right side 40 panel*/}
            <div className="flex-1 lg:flex-[0.4] ip-auth-right relative z-10 px-4 md:px-6 lg:px-8">
                <div className="w-full max-w-[320px] flex flex-col gap-6">

                    {/* mobile logo - only visible on small screens */}
                    <div className="lg:hidden flex justify-center mb-2">
                        <Link to="/">
                            <img src="/logo.svg" alt="Logo" className="w-14 h-14 rounded-2xl shadow-lg ip-border" />
                        </Link>
                    </div>

                    {/* Hero section */}
                    <div className="text-left">
                        <h1 className="text-[30px] font-display font-black ip-text-primary tracking-[-1.5px] leading-tight mb-1">
                            Account Recovery.
                        </h1>
                        <p className="ip-text-secondary text-[12px] font-medium leading-relaxed">
                            Enter your email below to receive a secure recovery link.
                        </p>
                    </div>

                    {/* Displaying state messages */}
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
                        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                            <div className="ip-form-group">
                                <label className="ip-label">Email Address</label>
                                <input
                                    type="email"
                                    className="ip-input"
                                    placeholder="name@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full py-3"
                            >
                                {loading ? "Sending link..." : "Send Reset Link"}
                            </button>
                        </form>
                    )}

                    {/* Navigation Footer */}
                    {!message && (
                        <div className="text-center text-[12px] ip-text-secondary font-medium border-t ip-border-top pt-6 flex flex-col gap-3">
                            <div>
                                <Link to="/login" className="ip-text-primary hover:text-primary-500 font-black transition-colors underline decoration-primary-500/20 hover:decoration-primary-500">
                                    Back to Login
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
