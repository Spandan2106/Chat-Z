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
    <div className="app-container" style={{ flexDirection: "column", alignItems: "center", paddingTop: "50px" }}>
      <div style={{ width: "100%", maxWidth: "800px", background: "#fff", padding: "20px", borderRadius: "10px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}>
        <button onClick={() => navigate("/users")} style={{ marginBottom: "20px", background: "none", border: "none", cursor: "pointer", fontSize: "16px" }}>← Back</button>
        <h2 style={{ color: "#00a884", marginBottom: "20px" }}>Admin Panel - Manage Users</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e9edef", textAlign: "left" }}>
              <th style={{ padding: "10px" }}>User</th>
              <th style={{ padding: "10px" }}>Email</th>
              <th style={{ padding: "10px" }}>Role</th>
              <th style={{ padding: "10px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} style={{ borderBottom: "1px solid #e9edef" }}>
                <td style={{ padding: "10px", display: "flex", alignItems: "center", gap: "10px" }}>
                  <img src={u.avatar || "https://via.placeholder.com/40"} style={{ width: "40px", height: "40px", borderRadius: "50%" }} alt={u.username} />
                  {u.username}
                </td>
                <td style={{ padding: "10px" }}>{u.email}</td>
                <td style={{ padding: "10px" }}>{u.isAdmin ? "Admin" : "User"}</td>
                <td style={{ padding: "10px" }}>
                  <button onClick={() => handleDelete(u._id)} style={{ background: "#ff4d4d", color: "white", padding: "5px 10px", border: "none", borderRadius: "5px", cursor: "pointer" }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}