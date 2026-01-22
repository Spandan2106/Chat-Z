import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../../api/axios";

export default function Privacy() {
  const navigate = useNavigate();
  const [blockedUsers, setBlockedUsers] = useState([]);

  useEffect(() => {
    api.get("/users/blocked").then((res) => setBlockedUsers(res.data)).catch(console.error);
  }, []);

  const handleUnblock = async (userId) => {
    try {
      await api.put("/users/unblock", { userId });
      setBlockedUsers(blockedUsers.filter(u => u._id !== userId));
    } catch (error) {
      console.error("Failed to unblock", error);
    }
  };

  return (
    <div className="app-container" style={{ flexDirection: "column", alignItems: "center", paddingTop: "50px" }}>
      <div style={{ width: "100%", maxWidth: "600px", background: "var(--sidebar-bg)", color: "var(--text-primary)", padding: "20px", borderRadius: "10px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}>
        <button onClick={() => navigate("/settings")} style={{ marginBottom: "20px", background: "none", border: "none", cursor: "pointer", fontSize: "16px", color: "var(--text-primary)" }}>← Back</button>
        <h2 style={{ color: "#00a884", marginBottom: "20px" }}>Privacy</h2>
        <div className="setting-item" style={{ padding: "15px", borderBottom: "1px solid #eee" }}>
            <strong>Last Seen</strong>
            <p style={{ fontSize: "14px", color: "#666" }}>Everyone</p>
        </div>
        <div className="setting-item" style={{ padding: "15px", borderBottom: "1px solid #eee" }}>
            <strong>Profile Photo</strong>
            <p style={{ fontSize: "14px", color: "#666" }}>Everyone</p>
        </div>
        <div className="setting-item" style={{ padding: "15px", borderBottom: "1px solid #eee" }}>
            <strong>Blocked Contacts</strong>
            <p style={{ fontSize: "14px", color: "#666" }}>{blockedUsers.length} contacts</p>
            <div style={{ marginTop: "10px" }}>
              {blockedUsers.map(user => (
                <div key={user._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0" }}>
                  <span>{user.username}</span>
                  <button onClick={() => handleUnblock(user._id)} style={{ padding: "5px 10px", fontSize: "12px", background: "#ff4d4d" }}>Unblock</button>
                </div>
              ))}
            </div>
        </div>
      </div>
    </div>
  );
}
