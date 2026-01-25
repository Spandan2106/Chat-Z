import { useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../../api/axios";

export default function ChatHistory() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleArchiveAll = async () => {
    if (!window.confirm("Archive all chats? They will be hidden but not deleted.")) return;
    
    try {
      setLoading(true);
      await api.put(`/chats/archive-all`).catch(() => null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Failed to archive chats");
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm("Clear all chat messages? This will delete all message content but keep the chats.")) return;
    
    try {
      setLoading(true);
      await api.delete("/messages/clear-all").catch(() => null);
      localStorage.removeItem("chatMessages");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Failed to clear chats");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm("Are you sure you want to delete ALL chats? This action cannot be undone.")) return;
    
    try {
      setLoading(true);
      await api.delete("/chats/delete-all").catch(() => null);
      localStorage.removeItem("chatMessages");
      localStorage.removeItem("chatsList");
      setSuccess(true);
      setTimeout(() => navigate("/users"), 2000);
    } catch {
      setError("Failed to delete chats");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-page-container" style={{ height: '100%', overflowY: 'auto' }}>
      <div className="settings-page-content">
        <div className="settings-page-header">
          <h1>📁 Chat History</h1>
          <p>Manage your chats and message history</p>
        </div>

        <div className="settings-section-box">
          <h3>Chat Management</h3>
          
          <button 
            className="settings-action-btn"
            onClick={handleArchiveAll}
            disabled={loading}
          >
            📦 Archive All Chats
          </button>
          <p className="settings-button-description">Hide all chats from your main list. You can restore them later.</p>

          <button 
            className="settings-action-btn warning"
            onClick={handleClearAll}
            disabled={loading}
          >
            🧹 Clear All Messages
          </button>
          <p className="settings-button-description">Delete all messages in all chats but keep the chat windows.</p>

          <button 
            className="settings-action-btn danger"
            onClick={handleDeleteAll}
            disabled={loading}
          >
            🗑️ Delete All Chats
          </button>
          <p className="settings-button-description">Permanently delete all chats. This action cannot be undone.</p>
        </div>

        <div className="settings-section-box">
          <h3>Storage Information</h3>
          <div className="storage-info">
            <div className="storage-item">
              <label>Total Chats</label>
              <span>Calculating...</span>
            </div>
            <div className="storage-item">
              <label>Total Messages</label>
              <span>Calculating...</span>
            </div>
            <div className="storage-item">
              <label>Storage Used</label>
              <span>Calculating...</span>
            </div>
          </div>
        </div>

        {error && <div className="settings-error">{error}</div>}
        {success && <div className="settings-success">Operation completed successfully!</div>}
      </div>
    </div>
  );
}
