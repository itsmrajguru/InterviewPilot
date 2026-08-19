import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import StudentTopbar from "../../components/StudentTopbar";

import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import PageHeader from "../../components/ui/PageHeader";

export default function StudentSettings() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className="ip-app-wrapper" style={{ display:"flex", minHeight:"100vh", background: "var(--bg)", fontFamily: "var(--sans)", fontSize: 14 }}>
      <Sidebar role="student" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <StudentTopbar title="Settings" sub="Manage your account preferences and configurations" />
        
        <main style={{ flex: 1, overflowY: "auto" }}>
          <PageHeader 
            title="Account Settings" 
            subtitle="Update your personal preferences and configure your experience." 
          />

          <div style={{ maxWidth: 1180, margin: "-24px auto 0", padding: "0 24px 24px" }}>
            
            <Card style={{ padding: "var(--space-8)", maxWidth: 600, marginTop: "var(--space-6)" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-8)" }}>
                <div>
                  <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 var(--space-4) 0" }}>Preferences</h2>
                  
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "var(--space-4) 0", borderBottom: "1px solid var(--color-border-subtle)" }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)" }}>Email Notifications</div>
                      <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>Receive updates about your interview reports</div>
                    </div>
                    <button onClick={() => setNotifications(!notifications)} style={{ width: 44, height: 24, borderRadius: 12, background: notifications ? "var(--accent)" : "var(--color-border-shadow)", border: "none", position: "relative", cursor: "pointer", transition: "all 0.2s" }}>
                      <div style={{ width: 20, height: 20, borderRadius: "50%", background: "var(--color-bg-panel)", position: "absolute", top: 2, left: notifications ? 22 : 2, transition: "all 0.2s", boxShadow: "var(--shadow-sm)" }} />
                    </button>
                  </div>
                  
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "var(--space-4) 0" }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)" }}>Dark Theme</div>
                      <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>Toggle application appearance</div>
                    </div>
                    <button onClick={() => setDarkMode(!darkMode)} style={{ width: 44, height: 24, borderRadius: 12, background: darkMode ? "var(--accent)" : "var(--color-border-shadow)", border: "none", position: "relative", cursor: "pointer", transition: "all 0.2s" }}>
                      <div style={{ width: 20, height: 20, borderRadius: "50%", background: "var(--color-bg-panel)", position: "absolute", top: 2, left: darkMode ? 22 : 2, transition: "all 0.2s", boxShadow: "var(--shadow-sm)" }} />
                    </button>
                  </div>
                </div>

                <div>
                  <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 var(--space-4) 0" }}>Security</h2>
                  <Button variant="secondary">Change Password</Button>
                </div>

                <div>
                  <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--danger-text)", margin: "0 0 var(--space-4) 0" }}>Danger Zone</h2>
                  <Button variant="danger">Delete Account</Button>
                </div>
              </div>
            </Card>

          </div>
        </main>
      </div>
    </div>
  );
}
