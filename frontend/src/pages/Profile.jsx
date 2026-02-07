import { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [about, setAbout] = useState(user?.about || "");
  const [username, setUsername] = useState(user?.username || "");
  const [uploading, setUploading] = useState(false);

  const handleUpdate = async () => {
    try {
      await api.put("/users/profile", { about, username });
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
    formData.append("picture", file);

    setUploading(true);
    try {
      const response = await api.post("/users/upload-picture", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUser(response.data);
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

  return (
    <div className="page-layout">
      <div className="profile-card">
        <div className="profile-header">
          <button
            onClick={() => navigate("/users")}
            className="profile-back-btn"
          >
            ← Back
          </button>
        </div>

        <h2 className="profile-title">Profile</h2>

        <div className="profile-avatar-container">
          <img
            src={user?.avatar || "https://via.placeholder.com/150"}
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

        <button
          onClick={handleUpdate}
          className="profile-save-btn"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
