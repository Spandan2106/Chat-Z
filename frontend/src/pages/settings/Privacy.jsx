import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

export default function Privacy() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    lastSeen: "everyone",
    profilePhoto: "everyone",
    readReceipts: true,
    onlineStatus: "everyone",
    disappearingMessages: false,
    disappearingTime: 7 // days
  });
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      // Try to fetch from API
      const res = await api.get(`/users/${user._id}/privacy-settings`).catch(() => null);
      if (res?.data) {
        setSettings(res.data);
      } else {
        const saved = localStorage.getItem("privacySettings");
        if (saved) setSettings(JSON.parse(saved));
      }
      
      // Fetch blocked users
      const blockedRes = await api.get("/users/blocked").catch(() => ({ data: [] }));
      setBlockedUsers(blockedRes.data || []);
    } catch (err) {
      console.error("Error fetching settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    setSuccess(false);
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setSuccess(false);
  };

  const handleUnblock = async (userId) => {
    try {
      await api.put("/users/unblock", { userId }).catch(() => null);
      setBlockedUsers(blockedUsers.filter(u => u._id !== userId));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (error) {
      console.error("Failed to unblock", error);
    }
  };

  const handleSave = async () => {
    try {
      await api.put(`/users/${user._id}/privacy-settings`, settings).catch(() => null);
      localStorage.setItem("privacySettings", JSON.stringify(settings));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save:", err);
    }
  };

  if (loading) {
    return (
      <div className="settings-page-container">
        <div className="settings-back-btn" onClick={() => navigate("/settings")}>← Back</div>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="settings-page-container">
      <div className="settings-back-btn" onClick={() => navigate("/settings")}>← Back</div>
      
      <div className="settings-page-content">
        <div className="settings-page-header">
          <h1>🔒 Privacy Settings</h1>
          <p>Control who can see your information</p>
        </div>

        <div className="settings-section-box">
          <h3>Visibility</h3>
          
          <div className="settings-dropdown-item">
            <label>Last Seen</label>
            <select 
              value={settings.lastSeen}
              onChange={(e) => handleChange("lastSeen", e.target.value)}
            >
              <option value="everyone">Everyone</option>
              <option value="contacts">My Contacts</option>
              <option value="nobody">Nobody</option>
            </select>
          </div>

          <div className="settings-dropdown-item">
            <label>Profile Photo</label>
            <select 
              value={settings.profilePhoto}
              onChange={(e) => handleChange("profilePhoto", e.target.value)}
            >
              <option value="everyone">Everyone</option>
              <option value="contacts">My Contacts</option>
              <option value="nobody">Nobody</option>
            </select>
          </div>

          <div className="settings-dropdown-item">
            <label>Online Status</label>
            <select 
              value={settings.onlineStatus}
              onChange={(e) => handleChange("onlineStatus", e.target.value)}
            >
              <option value="everyone">Everyone</option>
              <option value="contacts">My Contacts</option>
              <option value="nobody">Nobody</option>
            </select>
          </div>
        </div>

        <div className="settings-section-box">
          <h3>Messages</h3>
          
          <div className="settings-toggle-item">
            <div className="toggle-info">
              <label>Read Receipts</label>
              <small>Let others know when you've read their messages</small>
            </div>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={settings.readReceipts}
                onChange={() => handleToggle("readReceipts")}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="settings-toggle-item">
            <div className="toggle-info">
              <label>Disappearing Messages</label>
              <small>Messages will auto-delete after set time</small>
            </div>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={settings.disappearingMessages}
                onChange={() => handleToggle("disappearingMessages")}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          {settings.disappearingMessages && (
            <div className="settings-dropdown-item">
              <label>Disappear After</label>
              <select 
                value={settings.disappearingTime}
                onChange={(e) => handleChange("disappearingTime", parseInt(e.target.value))}
              >
                <option value={1}>1 Day</option>
                <option value={7}>7 Days</option>
                <option value={30}>30 Days</option>
                <option value={90}>90 Days</option>
              </select>
            </div>
          )}
        </div>

        <div className="settings-section-box">
          <h3>Blocked Contacts ({blockedUsers.length})</h3>
          
          {blockedUsers.length === 0 ? (
            <p className="settings-info-text">No blocked contacts</p>
          ) : (
            <div className="blocked-users-list">
              {blockedUsers.map(blockUser => (
                <div key={blockUser._id} className="blocked-user-item">
                  <div className="blocked-user-info">
                    <div className="blocked-user-name">{blockUser.username}</div>
                    <div className="blocked-user-email">{blockUser.email}</div>
                  </div>
                  <button 
                    className="unblock-btn"
                    onClick={() => handleUnblock(blockUser._id)}
                  >
                    Unblock
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {success && <div className="settings-success">Settings updated successfully!</div>}

        <button className="settings-save-btn" onClick={handleSave}>
          💾 Save Settings
        </button>
      </div>
    </div>
  );
}
