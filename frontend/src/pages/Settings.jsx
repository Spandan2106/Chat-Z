import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

export default function Settings() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      try {
        await api.delete(`/users/${user._id}`);
        logout();
        navigate("/");
      } catch (err) {
        console.error(err);
        alert("Failed to delete account");
      }
    }
  };

  return (
    <div className="app-container" style={{ flexDirection: "column", alignItems: "center", paddingTop: "50px" }}>
      <div style={{ width: "100%", maxWidth: "600px", background: "rgba(32, 44, 51, 0.9)", color: "var(--text-primary)", padding: "20px", borderRadius: "10px", boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)" }}>
        <button onClick={() => navigate("/users")} style={{ marginBottom: "20px", background: "none", border: "none", cursor: "pointer", fontSize: "16px" }}>← Back</button>
        <h2 style={{ color: "#00a884", marginBottom: "20px" }}>Settings</h2>
        
        <div className="setting-item" style={{ padding: "15px", borderBottom: "1px solid #eee", cursor: "pointer" }} onClick={() => navigate("/settings/notifications")}>
          <strong>🔔 Notifications</strong>
          <p style={{ color: "#666", fontSize: "14px" }}>Message, group & call tones</p>
        </div>
        <div className="setting-item" style={{ padding: "15px", borderBottom: "1px solid #eee", cursor: "pointer" }} onClick={() => navigate("/settings/privacy")}>
          <strong>🔒 Privacy</strong>
          <p style={{ color: "#666", fontSize: "14px" }}>Block contacts, disappearing messages</p>
        </div>
        <div className="setting-item" style={{ padding: "15px", borderBottom: "1px solid #eee", cursor: "pointer" }} onClick={() => navigate("/settings/security")}>
          <strong>🔐 Security</strong>
          <p style={{ color: "#666", fontSize: "14px" }}>End-to-end encryption</p>
        </div>
        <div className="setting-item" style={{ padding: "15px", borderBottom: "1px solid #eee", cursor: "pointer" }} onClick={toggleTheme}>
          <strong>🎨 Theme</strong>
          <p style={{ color: "#666", fontSize: "14px" }}>Current: {theme.toUpperCase()} (Click to toggle)</p>
        </div>
        <div className="setting-item" style={{ padding: "15px", borderBottom: "1px solid #eee", cursor: "pointer" }} onClick={() => navigate("/settings/chat-history")}>
          <strong>📁 Chat History</strong>
          <p style={{ color: "#666", fontSize: "14px" }}>Archive all chats, clear all chats, delete all chats</p>
        </div>
        <div className="setting-item" style={{ padding: "15px", cursor: "pointer", color: "red" }} onClick={handleDeleteAccount}>
          <strong>🗑️ Delete Account</strong>
        </div>
      </div>
    </div>
  );
}