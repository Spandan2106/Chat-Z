import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

export default function Settings() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

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
          style={location.pathname.includes("notifications") ? { background: "var(--glass-bg)", borderLeft: "4px solid var(--primary-green)" } : {}}
        >
          <span>🔔</span> Notifications
        </div>
        <div 
          className="settings-nav-item" 
          onClick={() => navigate("/settings/privacy")}
          style={location.pathname.includes("privacy") ? { background: "var(--glass-bg)", borderLeft: "4px solid var(--primary-green)" } : {}}
        >
          <span>🔒</span> Privacy
        </div>
        <div 
          className="settings-nav-item" 
          onClick={() => navigate("/settings/security")}
          style={location.pathname.includes("security") ? { background: "var(--glass-bg)", borderLeft: "4px solid var(--primary-green)" } : {}}
        >
          <span>🔐</span> Security
        </div>
        <div 
          className="settings-nav-item" 
          onClick={() => navigate("/settings/chat-history")}
          style={location.pathname.includes("chat-history") ? { background: "var(--glass-bg)", borderLeft: "4px solid var(--primary-green)" } : {}}
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
        <Outlet />
      </div>
    </div>
  );
}