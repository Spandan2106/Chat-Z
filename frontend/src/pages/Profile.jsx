import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [about, setAbout] = useState(user?.about || "");
  const [username, setUsername] = useState(user?.username || "");

  const handleUpdate = async () => {
    try {
      await api.put("/users/profile", { about, username });
      alert("Profile updated!");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile");
    }
  };

  return (
    <div className="app-container" style={{ flexDirection: "column", alignItems: "center", paddingTop: "50px" }}>
      <div style={{ width: "100%", maxWidth: "600px", background: "#fff", padding: "20px", borderRadius: "10px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}>
        <button onClick={() => navigate("/users")} style={{ marginBottom: "20px", background: "none", border: "none", cursor: "pointer", fontSize: "16px" }}>← Back</button>
        <h2 style={{ color: "#00a884", marginBottom: "20px" }}>Profile</h2>
        
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
          <img src={user?.avatar || "https://via.placeholder.com/150"} alt="Profile" style={{ width: "150px", height: "150px", borderRadius: "50%", objectFit: "cover" }} />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", color: "#00a884", marginBottom: "5px" }}>Your Name</label>
          <input className="chat-input" value={username} onChange={(e) => setUsername(e.target.value)} style={{ width: "100%", margin: 0 }} />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", color: "#00a884", marginBottom: "5px" }}>About</label>
          <input className="chat-input" value={about} onChange={(e) => setAbout(e.target.value)} style={{ width: "100%", margin: 0 }} />
        </div>

        <button onClick={handleUpdate} style={{ width: "100%" }}>Save Changes</button>
      </div>
    </div>
  );
}