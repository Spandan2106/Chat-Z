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
    <div className="settings-container">
      <div className="settings-sidebar">
        <div className="settings-sidebar-title">Settings Menu</div>
        <div className="settings-nav-item" onClick={() => navigate("/users")} style={{ fontWeight: "bold", color: "var(--primary-green)" }}>
          <span>←</span> Back to Chat
        </div>
        <div 
          className="settings-nav-item" 
          onClick={() => navigate("/settings/notifications")}
        >
          <span>🔔</span> Notifications
        </div>
        <div 
          className="settings-nav-item" 
          onClick={() => navigate("/settings/privacy")}
        >
          <span>🔒</span> Privacy
        </div>
        <div 
          className="settings-nav-item" 
          onClick={() => navigate("/settings/security")}
        >
          <span>🔐</span> Security
        </div>
        <div 
          className="settings-nav-item" 
          onClick={toggleTheme}
        >
          <span>🎨</span> Theme
        </div>
        <div 
          className="settings-nav-item" 
          onClick={() => navigate("/settings/chat-history")}
        >
          <span>📁</span> Chat History
        </div>
        <div 
          className="settings-nav-item" 
          onClick={handleDeleteAccount}
          style={{ color: "#e74c3c" }}
        >
          <span>🗑️</span> Delete Account
        </div>
      </div>

      <div className="settings-content">
        <div className="settings-section">
          <h2 className="settings-section-title">Settings</h2>
          <p className="settings-section-subtitle">Manage your account preferences and security</p>

          <div className="settings-item" onClick={() => navigate("/settings/notifications")}>
            <div className="settings-item-info">
              <div className="settings-item-label">🔔 Notifications</div>
              <div className="settings-item-description">Message, group & call tones</div>
            </div>
            <div className="settings-item-action">→</div>
          </div>

          <div className="settings-item" onClick={() => navigate("/settings/privacy")}>
            <div className="settings-item-info">
              <div className="settings-item-label">🔒 Privacy</div>
              <div className="settings-item-description">Block contacts, disappearing messages</div>
            </div>
            <div className="settings-item-action">→</div>
          </div>

          <div className="settings-item" onClick={() => navigate("/settings/security")}>
            <div className="settings-item-info">
              <div className="settings-item-label">🔐 Security</div>
              <div className="settings-item-description">End-to-end encryption</div>
            </div>
            <div className="settings-item-action">→</div>
          </div>

          <div className="settings-item" onClick={toggleTheme}>
            <div className="settings-item-info">
              <div className="settings-item-label">🎨 Theme</div>
              <div className="settings-item-description">Current: {theme.toUpperCase()} (Click to toggle)</div>
            </div>
            <div className="settings-item-action">
              <button className={`settings-toggle ${theme === "dark" ? "active" : ""}`} />
            </div>
          </div>

          <div className="settings-item" onClick={() => navigate("/settings/chat-history")}>
            <div className="settings-item-info">
              <div className="settings-item-label">📁 Chat History</div>
              <div className="settings-item-description">Archive, clear, or delete all chats</div>
            </div>
            <div className="settings-item-action">→</div>
          </div>

          <div className="settings-item" onClick={handleDeleteAccount} style={{ borderColor: "#e74c3c" }}>
            <div className="settings-item-info">
              <div className="settings-item-label" style={{ color: "#e74c3c" }}>🗑️ Delete Account</div>
              <div className="settings-item-description">Permanently delete your account and all data</div>
            </div>
            <div className="settings-item-action">→</div>
          </div>
        </div>
      </div>
    </div>
  );
}