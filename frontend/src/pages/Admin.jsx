import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function Admin() {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/users").then((res) => setUsers(res.data));
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await api.delete(`/users/${id}`);
        setUsers(users.filter((u) => u._id !== id));
      } catch (err) {
        console.error(err);
        alert("Failed to delete user");
      }
    }
  };

  return (
    <div className="admin-container">
      <button 
        onClick={() => navigate("/users")} 
        className="profile-back-btn"
        style={{ alignSelf: "flex-start", marginBottom: "20px" }}
      >
        ← Back
      </button>
      
      <div className="admin-header">
        <h1 className="admin-title">Admin Panel</h1>
        <p className="admin-subtitle">Manage users and monitor system activity</p>
      </div>

      <div className="admin-stats">
        <div className="admin-stat-card">
          <div className="admin-stat-label">Total Users</div>
          <div className="admin-stat-value">{users.length}</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-label">Active Users</div>
          <div className="admin-stat-value">{users.filter(u => u.isActive).length}</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-label">Admins</div>
          <div className="admin-stat-value">{users.filter(u => u.isAdmin).length}</div>
        </div>
      </div>

      <div className="admin-table">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <img 
                      src={u.avatar || "https://via.placeholder.com/40"} 
                      style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }} 
                      alt={u.username} 
                    />
                    <strong>{u.username}</strong>
                  </div>
                </td>
                <td>{u.email}</td>
                <td>{u.isAdmin ? "🔐 Admin" : "👤 User"}</td>
                <td>
                  <button 
                    onClick={() => handleDelete(u._id)} 
                    className="admin-action-btn danger"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}