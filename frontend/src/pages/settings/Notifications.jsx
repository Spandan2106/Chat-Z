import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

export default function Notifications() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    soundEnabled: true,
    desktopEnabled: true,
    muteGroupNotifications: false,
    muteCallNotifications: false,
    groupTone: "default",
    messageTone: "default",
    callTone: "default"
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      // Try to fetch from API, otherwise use defaults
      const res = await api.get(`/users/${user._id}/notification-settings`).catch(() => null);
      if (res?.data) {
        setSettings(res.data);
      } else {
        // Load from localStorage as fallback
        const saved = localStorage.getItem("notificationSettings");
        if (saved) {
          setSettings(JSON.parse(saved));
        }
      }
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

  const handleToneChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setSuccess(false);
  };

  const handleSave = async () => {
    try {
      // Try to save to API
      await api.put(`/users/${user._id}/notification-settings`, settings).catch(() => null);
      // Always save to localStorage
      localStorage.setItem("notificationSettings", JSON.stringify(settings));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError("Failed to save settings");
    }
  };

  if (loading) {
    return (
      <div className="settings-page-container">
        <div className="settings-back-btn" onClick={() => navigate("/settings")}>← Back to Settings</div>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="settings-page-container">
      <div className="settings-back-btn" onClick={() => navigate("/settings")}>← Back</div>
      
      <div className="settings-page-content">
        <div className="settings-page-header">
          <h1>🔔 Notification Settings</h1>
          <p>Control how you receive notifications</p>
        </div>

        <div className="settings-section-box">
          <h3>Message Notifications</h3>
          
          <div className="settings-toggle-item">
            <div className="toggle-info">
              <label>Enable Sound</label>
              <small>Play sound when you receive a message</small>
            </div>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={settings.soundEnabled}
                onChange={() => handleToggle("soundEnabled")}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="settings-toggle-item">
            <div className="toggle-info">
              <label>Desktop Notifications</label>
              <small>Show browser notifications</small>
            </div>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={settings.desktopEnabled}
                onChange={() => handleToggle("desktopEnabled")}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="settings-dropdown-item">
            <label>Message Tone</label>
            <select 
              value={settings.messageTone}
              onChange={(e) => handleToneChange("messageTone", e.target.value)}
            >
              <option value="default">Default</option>
              <option value="silent">Silent</option>
              <option value="bell">Bell</option>
              <option value="chime">Chime</option>
            </select>
          </div>
        </div>

        <div className="settings-section-box">
          <h3>Group Notifications</h3>
          
          <div className="settings-toggle-item">
            <div className="toggle-info">
              <label>Mute Group Notifications</label>
              <small>Don't get notified for group messages</small>
            </div>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={settings.muteGroupNotifications}
                onChange={() => handleToggle("muteGroupNotifications")}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="settings-dropdown-item">
            <label>Group Tone</label>
            <select 
              value={settings.groupTone}
              onChange={(e) => handleToneChange("groupTone", e.target.value)}
              disabled={settings.muteGroupNotifications}
            >
              <option value="default">Default</option>
              <option value="silent">Silent</option>
              <option value="bell">Bell</option>
              <option value="chime">Chime</option>
            </select>
          </div>
        </div>

        <div className="settings-section-box">
          <h3>Call Notifications</h3>
          
          <div className="settings-toggle-item">
            <div className="toggle-info">
              <label>Mute Call Notifications</label>
              <small>Don't get notified for incoming calls</small>
            </div>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={settings.muteCallNotifications}
                onChange={() => handleToggle("muteCallNotifications")}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="settings-dropdown-item">
            <label>Call Tone</label>
            <select 
              value={settings.callTone}
              onChange={(e) => handleToneChange("callTone", e.target.value)}
              disabled={settings.muteCallNotifications}
            >
              <option value="default">Default</option>
              <option value="silent">Silent</option>
              <option value="bell">Bell</option>
              <option value="chime">Chime</option>
            </select>
          </div>
        </div>

        {error && <div className="settings-error">{error}</div>}
        {success && <div className="settings-success">Settings saved successfully!</div>}

        <button className="settings-save-btn" onClick={handleSave}>
          💾 Save Settings
        </button>
      </div>
    </div>
  );
}
