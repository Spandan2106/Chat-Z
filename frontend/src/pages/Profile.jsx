import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { countries } from "../constants.js";


export default function Profile() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [about, setAbout] = useState(user?.about || "");
  const [username, setUsername] = useState(user?.username || "");
  const [country, setCountry] = useState(user?.country || "");
  const [uploading, setUploading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (user) {
      setAbout(user.about || "");
      setUsername(user.username || "");
      setCountry(user.country || "");
    }
  }, [user]);

  const handleUpdate = async () => {
    try {
      const { data } = await api.put("/users/profile", { about, username, country });
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem("userInfo", JSON.stringify(updatedUser));
      alert("Profile updated!");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile");
    }
  };

  const handlePictureUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    setUploading(true);
    try {
      const { data } = await api.put("/users/profile-pic", formData);
      setUser(data);
      alert("Picture uploaded successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to upload picture");
    } finally {
      setUploading(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return "https://via.placeholder.com/150";
    if (avatarPath.startsWith("http")) return avatarPath;
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5001";
    return `${baseUrl.replace(/\/api$/, '')}/${avatarPath}`;
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      return alert("New passwords do not match");
    }
    try {
      await api.put("/users/change-password", { currentPassword, newPassword });
      alert("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to change password");
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      try {
        await api.delete(`/users/account`);
        logout();
        navigate("/");
      } catch (err) {
        console.error(err);
        alert("Failed to delete account");
      }
    }
  };

  return (
    <div className="app-container" style={{ flexDirection: 'column', height: '100vh', margin: 0, padding: 0 }}>
      <div className="app-header">
        <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--text-primary)", fontWeight: "bold", fontSize: "20px" }}>
           <span className="dynamic-logo-text">Chat_Z</span>
        </div>
      </div>

      <div className="page-layout" style={{ flex: 1, height: 'auto', marginTop: '60px', overflowY: 'auto', alignItems: 'flex-start', paddingTop: '20px' }}>
      <div className="about-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="profile-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
          <button
            onClick={() => navigate("/users")}
            className="profile-back-btn"
          >
            ← Back
          </button>
        </div>

        <h1 style={{ marginBottom: '20px', textAlign: 'center', width: '100%' }}>Profile</h1>

        <div className="profile-content-wrapper" style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', justifyContent: 'center' }}>
        <div className="profile-avatar-section" style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div className="profile-avatar-container">
          <img
            src={getAvatarUrl(user?.avatar)}
            alt="Profile"
            className="profile-avatar"
            onClick={handleAvatarClick}
            style={{ cursor: "pointer" }}
          />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handlePictureUpload}
            accept="image/*"
            style={{ display: "none" }}
          />
          {uploading && <p>Uploading...</p>}
        </div>
        <p style={{ marginTop: '10px', color: 'var(--text-secondary)', fontSize: '14px' }}>Click photo to change</p>
        </div>

        <div className="profile-details-section" style={{ flex: '1 1 400px' }}>
        <div className="profile-form-group">
          <label className="profile-label">Your Name</label>
          <input
            className="profile-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your name"
          />
        </div>

        <div className="profile-form-group">
          <label className="profile-label">About</label>
          <input
            className="profile-input"
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            placeholder="Tell us about yourself"
          />
        </div>

        <div className="profile-form-group">
          <label className="profile-label">Country</label>
          <input 
            list="profile-countries"
            className="profile-input"
            value={country} 
            onChange={(e) => setCountry(e.target.value)}
            placeholder="Select Country"
          />
          <datalist id="profile-countries">
            {countries.map(c => (
              <option key={c.code} value={c.name}>
                {c.code.toUpperCase().replace(/./g, char => String.fromCodePoint(char.charCodeAt(0) + 127397))} {c.name}
              </option>
            ))}
          </datalist>
        </div>

        <div className="profile-form-group">
          <label className="profile-label">Email</label>
          <input
            className="profile-input"
            value={user?.email}
            disabled
            style={{ backgroundColor: 'var(--hover-bg)', cursor: 'not-allowed' }}
          />
        </div>

        <button
          onClick={handleUpdate}
          className="profile-save-btn"
        >
          Save Changes
        </button>

        <div style={{ marginTop: '40px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
          <h3 style={{ marginBottom: '20px', color: 'var(--text-primary)' }}>Change Password</h3>
          <div className="profile-form-group">
            <label className="profile-label">Current Password</label>
            <input
              type="password"
              className="profile-input"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div className="profile-form-group">
            <label className="profile-label">New Password</label>
            <input
              type="password"
              className="profile-input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="profile-form-group">
            <label className="profile-label">Confirm New Password</label>
            <input
              type="password"
              className="profile-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <button onClick={handleChangePassword} className="profile-save-btn" style={{ backgroundColor: '#00a884' }}>
            Update Password
          </button>
        </div>

        <div style={{ marginTop: '40px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
          <h3 style={{ marginBottom: '20px', color: '#ff4d4d' }}>Danger Zone</h3>
          <button onClick={handleDeleteAccount} className="profile-save-btn" style={{ backgroundColor: '#ff4d4d' }}>
            Delete Account
          </button>
        </div>
      </div>
      </div>
      </div>
      </div>

      <div className="app-footer">
        © 2026 Chat_Z. All rights reserved.
      </div>
    </div>
  );
}
