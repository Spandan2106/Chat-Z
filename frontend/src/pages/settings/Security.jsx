import { useNavigate } from "react-router-dom";

export default function Security() {
  const navigate = useNavigate();
  return (
    <div className="app-container" style={{ flexDirection: "column", alignItems: "center", paddingTop: "50px" }}>
      <div style={{ width: "100%", maxWidth: "600px", background: "var(--sidebar-bg)", color: "var(--text-primary)", padding: "20px", borderRadius: "10px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}>
        <button onClick={() => navigate("/settings")} style={{ marginBottom: "20px", background: "none", border: "none", cursor: "pointer", fontSize: "16px", color: "var(--text-primary)" }}>← Back</button>
        <h2 style={{ color: "#00a884", marginBottom: "20px" }}>Security</h2>
        <p style={{ lineHeight: "1.5", marginBottom: "20px" }}>
            Messages and calls are end-to-end encrypted. No one outside of this chat, not even Chat_Z, can read or listen to them.
        </p>
        <div style={{ padding: "10px 0" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <input type="checkbox" /> Show security notifications
            </label>
        </div>
      </div>
    </div>
  );
}
