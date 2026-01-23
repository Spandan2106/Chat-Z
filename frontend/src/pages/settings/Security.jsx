import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

export default function Security() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    twoFactorEnabled: false,
    securityNotifications: true,
    activeDevices: [],
    encryptionEnabled: true
  });
  const [loading, setLoading] = useState(true);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/users/${user._id}/security-settings`).catch(() => null);
      if (res?.data) {
        setSettings(res.data);
      } else {
        const saved = localStorage.getItem("securitySettings");
        if (saved) setSettings(JSON.parse(saved));
      }
    } catch (err) {
      console.error("Error fetching settings:", err);
    } finally {
      setLoading(false);
    }
  }, [user._id]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    setSuccess(false);
  };

  const handleChangePassword = async () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      setError("Please fill in all fields");
      return;
    }
    if (passwords.new !== passwords.confirm) {
      setError("New passwords don't match");
      return;
    }
    if (passwords.new.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setError(null);
      await api.put("/auth/change-password", {
        currentPassword: passwords.current,
        newPassword: passwords.new
      }).catch(err => {
        throw err.response?.data || err;
      });
      
      setPasswords({ current: "", new: "", confirm: "" });
      setShowPasswordChange(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || "Failed to change password");
    }
  };

  const handleLogoutDevice = async (deviceId) => {
    try {
      await api.post(`/auth/logout-device/${deviceId}`).catch(() => null);
      setSettings(prev => ({
        ...prev,
        activeDevices: prev.activeDevices.filter(d => d.id !== deviceId)
      }));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      console.error("Failed to logout device:", err);
    }
  };

  const handleSave = async () => {
    try {
      await api.put(`/users/${user._id}/security-settings`, settings).catch(() => null);
      localStorage.setItem("securitySettings", JSON.stringify(settings));
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
          <h1>🔐 Security Settings</h1>
          <p>Keep your account safe and secure</p>
        </div>

        <div className="settings-section-box">
          <h3>Encryption</h3>
          <div className="settings-info-box">
            <p>🔒 Messages and calls are end-to-end encrypted. No one outside of this chat can read or listen to them.</p>
          </div>
          <div className="settings-toggle-item">
            <div className="toggle-info">
              <label>End-to-End Encryption</label>
              <small>Always enabled for your security</small>
            </div>
            <label className="toggle-switch disabled">
              <input 
                type="checkbox" 
                checked={true}
                disabled={true}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        <div className="settings-section-box">
          <h3>Two-Factor Authentication</h3>
          
          <div className="settings-toggle-item">
            <div className="toggle-info">
              <label>Enable 2FA</label>
              <small>Add an extra layer of security to your account</small>
            </div>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={settings.twoFactorEnabled}
                onChange={() => handleToggle("twoFactorEnabled")}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        <div className="settings-section-box">
          <h3>Password</h3>
          
          {!showPasswordChange ? (
            <button 
              className="settings-action-btn"
              onClick={() => setShowPasswordChange(true)}
            >
              🔑 Change Password
            </button>
          ) : (
            <div className="password-change-form">
              <input
                type="password"
                placeholder="Current password"
                value={passwords.current}
                onChange={(e) => setPasswords(prev => ({ ...prev, current: e.target.value }))}
                className="settings-input"
              />
              <input
                type="password"
                placeholder="New password"
                value={passwords.new}
                onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
                className="settings-input"
              />
              <input
                type="password"
                placeholder="Confirm new password"
                value={passwords.confirm}
                onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                className="settings-input"
              />
              
              {error && <div className="settings-error">{error}</div>}
              
              <div className="password-change-buttons">
                <button className="settings-save-btn" onClick={handleChangePassword}>
                  Save Password
                </button>
                <button className="settings-cancel-btn" onClick={() => setShowPasswordChange(false)}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="settings-section-box">
          <h3>Active Devices ({settings.activeDevices?.length || 0})</h3>
          
          {settings.activeDevices && settings.activeDevices.length > 0 ? (
            <div className="devices-list">
              {settings.activeDevices.map(device => (
                <div key={device.id} className="device-item">
                  <div className="device-info">
                    <div className="device-name">{device.name || "Unknown Device"}</div>
                    <div className="device-details">
                      {device.lastActive && <span>Last active: {new Date(device.lastActive).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  <button 
                    className="logout-device-btn"
                    onClick={() => handleLogoutDevice(device.id)}
                  >
                    Logout
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="settings-info-text">No active devices</p>
          )}
        </div>

        <div className="settings-section-box">
          <h3>Security Notifications</h3>
          
          <div className="settings-toggle-item">
            <div className="toggle-info">
              <label>Enable Notifications</label>
              <small>Get alerts for security-related activities</small>
            </div>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={settings.securityNotifications}
                onChange={() => handleToggle("securityNotifications")}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        {success && <div className="settings-success">Settings updated successfully!</div>}

        <button className="settings-save-btn" onClick={handleSave}>
          💾 Save Settings
        </button>
      </div>
    </div>
  );
}
