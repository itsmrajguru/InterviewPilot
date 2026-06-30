import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import StudentTopbar from "../../components/StudentTopbar";

export default function StudentSettings() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)", fontFamily: "var(--font-sans)", fontSize: 14 }}>
      <Sidebar role="student" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <StudentTopbar title="Settings" sub="Manage your account preferences and configurations" />
        <main style={{ flex: 1, padding: "28px 32px", overflowY: "auto" }}>
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 22, fontWeight: 500, color: "var(--text-primary)", margin: 0 }}>
              Account Settings
            </h1>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: "4px 0 0 0" }}>
              Update your personal preferences and configure your experience.
            </p>
          </div>
          <div style={{ background: "var(--bg-card)", borderRadius: 12, border: "1px solid var(--border)", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", padding: 32, maxWidth: 600 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 16px 0" }}>Preferences</h2>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0", borderBottom: "1px solid #f1f4f7" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)" }}>Email Notifications</div>
                    <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>Receive updates about your interview reports</div>
                  </div>
                  <button onClick={() => setNotifications(!notifications)} style={{ width: 44, height: 24, borderRadius: 12, background: notifications ? "var(--accent)" : "#e5e7eb", border: "none", position: "relative", cursor: "pointer", transition: "all 0.2s" }}>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", background: "var(--bg-card)", position: "absolute", top: 2, left: notifications ? 22 : 2, transition: "all 0.2s" }} />
                  </button>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)" }}>Dark Theme</div>
                    <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>Toggle application appearance</div>
                  </div>
                  <button onClick={() => setDarkMode(!darkMode)} style={{ width: 44, height: 24, borderRadius: 12, background: darkMode ? "var(--accent)" : "#e5e7eb", border: "none", position: "relative", cursor: "pointer", transition: "all 0.2s" }}>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", background: "var(--bg-card)", position: "absolute", top: 2, left: darkMode ? 22 : 2, transition: "all 0.2s" }} />
                  </button>
                </div>
              </div>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 16px 0" }}>Security</h2>
                <button style={{ background: "var(--bg-card)", border: "1px solid var(--border)", padding: "10px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "var(--accent)", cursor: "pointer" }}>Change Password</button>
              </div>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: "#b91c1c", margin: "0 0 16px 0" }}>Danger Zone</h2>
                <button style={{ background: "#fef2f2", border: "1px solid #fecaca", padding: "10px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#b91c1c", cursor: "pointer" }}>Delete Account</button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
