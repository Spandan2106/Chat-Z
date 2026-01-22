import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function ChatHistory() {
  const navigate = useNavigate();

  const handleDeleteAll = async () => {
    if (window.confirm("Are you sure you want to delete all chats? This cannot be undone.")) {
      try {
        await api.delete("/messages/delete-all");
        alert("All chats have been deleted.");
        navigate("/users");
      } catch (error) {
        console.error("Failed to delete chats", error);
        alert("Failed to delete chats.");
      }
    }
  };

  return (
    <div className="app-container" style={{ flexDirection: "column", alignItems: "center", paddingTop: "50px" }}>
      <div style={{ width: "100%", maxWidth: "600px", background: "var(--sidebar-bg)", color: "var(--text-primary)", padding: "20px", borderRadius: "10px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}>
        <button onClick={() => navigate("/settings")} style={{ marginBottom: "20px", background: "none", border: "none", cursor: "pointer", fontSize: "16px", color: "var(--text-primary)" }}>← Back</button>
        <h2 style={{ color: "#00a884", marginBottom: "20px" }}>Chat History</h2>
        <div className="setting-item" style={{ padding: "15px", borderBottom: "1px solid #eee", cursor: "pointer" }}>
            Archive all chats
        </div>
        <div className="setting-item" style={{ padding: "15px", borderBottom: "1px solid #eee", cursor: "pointer" }}>
            Clear all chats
        </div>
        <div className="setting-item" style={{ padding: "15px", cursor: "pointer", color: "red" }} onClick={handleDeleteAll}>
            Delete all chats
        </div>
      </div>
    </div>
  );
}
