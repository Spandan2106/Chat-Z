import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Notifications() {
  const navigate = useNavigate();
  const [soundEnabled, setSoundEnabled] = useState(localStorage.getItem("soundEnabled") === "true");
  const [desktopEnabled, setDesktopEnabled] = useState(localStorage.getItem("desktopEnabled") === "true");

  useEffect(() => {
    localStorage.setItem("soundEnabled", soundEnabled);
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem("desktopEnabled", desktopEnabled);
  }, [desktopEnabled]);

  return (
    <div className="app-container" style={{ flexDirection: "column", alignItems: "center", paddingTop: "50px" }}>
      <div style={{ width: "100%", maxWidth: "600px", background: "var(--sidebar-bg)", color: "var(--text-primary)", padding: "20px", borderRadius: "10px", boxShadow: "var(--shadow)" }}>
        <button onClick={() => navigate("/settings")} style={{ marginBottom: "20px", background: "none", border: "none", cursor: "pointer", fontSize: "16px", color: "var(--text-primary)" }}>← Back</button>
        <h2 style={{ color: "#00a884", marginBottom: "20px" }}>Notifications</h2>
        <div style={{ padding: "10px 0" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <input type="checkbox" checked={soundEnabled} onChange={(e) => setSoundEnabled(e.target.checked)} /> Play sound for incoming messages
            </label>
        </div>
        <div style={{ padding: "10px 0" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <input type="checkbox" checked={desktopEnabled} onChange={(e) => setDesktopEnabled(e.target.checked)} /> Show desktop notifications
            </label>
        </div>
      </div>
    </div>
  );
}
