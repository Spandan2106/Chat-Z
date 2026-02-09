import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Simple SVG Line Chart Component
const LineChart = ({ data }) => {
  const width = 600;
  const height = 300;
  const padding = 40;
  const maxValue = 2500; // Scale for 2.5B
  
  const points = data.map((d, i) => {
    const x = padding + (i * (width - 2 * padding)) / (data.length - 1);
    const y = height - padding - (d.value / maxValue) * (height - 2 * padding);
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: "auto", background: "var(--app-bg)", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
      <polyline fill="none" stroke="#00a884" strokeWidth="3" points={points} />
      {data.map((d, i) => {
        const x = padding + (i * (width - 2 * padding)) / (data.length - 1);
        const y = height - padding - (d.value / maxValue) * (height - 2 * padding);
        return (
          <g key={i}>
            <circle cx={x} cy={y} r="4" fill="#fff" stroke="#00a884" strokeWidth="2" />
            <text x={x} y={height - 10} textAnchor="middle" fontSize="12" fill="var(--text-secondary)">{d.year}</text>
            <text x={x} y={y - 10} textAnchor="middle" fontSize="10" fill="var(--text-primary)">
              {d.value >= 1000 ? (d.value / 1000).toFixed(1) + "B" : d.value + "M"}
            </text>
          </g>
        );
      })}
      <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="var(--border-color)" />
      <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="var(--border-color)" />
      <text x={padding + 10} y={padding} fontSize="14" fontWeight="bold" fill="var(--text-primary)">Market Cap Growth ($)</text>
    </svg>
  );
};

export default function Admin() {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    api.get("/users")
      .then((res) => setUsers(res.data))
      .catch((err) => console.error("Failed to fetch users:", err));
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

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Mock Data for Charts
  const marketCapData = [
    { year: 2019, value: 1 },
    { year: 2020, value: 5 },
    { year: 2021, value: 20 },
    { year: 2022, value: 80 },
    { year: 2023, value: 250 },
    { year: 2024, value: 600 },
    { year: 2025, value: 1200 },
    { year: 2026, value: 2100 }, // 2.1B
  ];

  const activeHoursData = [
    { day: "Mon", hours: 5000000 },
    { day: "Tue", hours: 5200000 },
    { day: "Wed", hours: 4800000 },
    { day: "Thu", hours: 5500000 },
    { day: "Fri", hours: 6000000 },
    { day: "Sat", hours: 7000000 },
    { day: "Sun", hours: 6500000 },
  ];

  // Mock Logs Data
  const [systemLogs] = useState(() => [
    { id: 1, level: "INFO", message: "Admin logged in", timestamp: new Date().toISOString() },
    { id: 2, level: "WARNING", message: "High CPU usage detected (85%)", timestamp: new Date(Date.now() - 3600000).toISOString() },
    { id: 3, level: "ERROR", message: "Database connection timeout", timestamp: new Date(Date.now() - 7200000).toISOString() },
    { id: 4, level: "INFO", message: "System backup completed", timestamp: new Date(Date.now() - 86400000).toISOString() },
  ]);

  return (
    <div className="admin-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <button 
          onClick={() => navigate("/users")} 
          className="profile-back-btn"
          style={{ margin: 0 }}
        >
          ← Back
        </button>
        <button 
          onClick={handleLogout} 
          className="admin-action-btn danger"
          style={{ padding: "10px 20px" }}
        >
          Logout
        </button>
      </div>
      
      <div className="admin-header">
        <h1 className="admin-title">Admin Panel</h1>
        <p className="admin-subtitle">Manage users and monitor system activity</p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", borderBottom: "1px solid var(--border-color)" }}>
        <button 
          onClick={() => setActiveTab("dashboard")}
          style={{
            padding: "10px 20px",
            background: activeTab === "dashboard" ? "var(--primary-green)" : "transparent",
            color: activeTab === "dashboard" ? "white" : "var(--text-primary)",
            border: "none",
            borderRadius: "8px 8px 0 0",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          Dashboard
        </button>
        <button 
          onClick={() => setActiveTab("logs")}
          style={{
            padding: "10px 20px",
            background: activeTab === "logs" ? "var(--primary-green)" : "transparent",
            color: activeTab === "logs" ? "white" : "var(--text-primary)",
            border: "none",
            borderRadius: "8px 8px 0 0",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          System Logs
        </button>
      </div>

      {activeTab === "dashboard" ? (
        <>
      {/* Global Stats */}
      <div className="admin-stats">
        <div className="admin-stat-card">
          <div className="admin-stat-label">Total Users (Global)</div>
          <div className="admin-stat-value">300M+</div>
          <div style={{ fontSize: "12px", color: "#00a884", marginTop: "5px" }}>Daily Avg: 40M+</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-label">Total Revenue</div>
          <div className="admin-stat-value">$300M+</div>
          <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "5px" }}>Lifetime Earnings</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-label">Market Cap (2026)</div>
          <div className="admin-stat-value">$2.1B</div>
          <div style={{ fontSize: "12px", color: "#00a884", marginTop: "5px" }}>High Cap</div>
        </div>
      </div>

      {/* Charts Section */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px", marginBottom: "40px" }}>
        
        {/* Market Cap Graph */}
        <div className="admin-chart-container">
          <LineChart data={marketCapData} />
        </div>

        {/* Active Hours Bar Chart */}
        <div className="admin-chart-container" style={{ background: "var(--app-bg)", padding: "20px", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
          <h3 style={{ margin: "0 0 20px 0", color: "var(--text-primary)", fontSize: "16px" }}>Daily Active Hours (Millions)</h3>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", height: "200px" }}>
            {activeHoursData.map((d, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
                <div style={{ 
                  width: "30px", 
                  height: `${(d.hours / 8000000) * 100}%`, 
                  background: "linear-gradient(to top, #00a884, #25d366)", 
                  borderRadius: "4px 4px 0 0",
                  transition: "height 0.5s ease"
                }}></div>
                <span style={{ marginTop: "8px", fontSize: "12px", color: "var(--text-secondary)" }}>{d.day}</span>
                <span style={{ fontSize: "10px", fontWeight: "bold", color: "var(--text-primary)" }}>{(d.hours / 1000000).toFixed(1)}M</span>
              </div>
            ))}
          </div>
        </div>

        {/* User Distribution Pie Chart (CSS Conic Gradient) */}
        <div className="admin-chart-container" style={{ background: "var(--app-bg)", padding: "20px", borderRadius: "12px", border: "1px solid var(--border-color)", display: "flex", flexDirection: "column", alignItems: "center" }}>
           <h3 style={{ margin: "0 0 20px 0", color: "var(--text-primary)", fontSize: "16px" }}>User Distribution</h3>
           <div style={{
             width: "200px",
             height: "200px",
             borderRadius: "50%",
             background: "conic-gradient(#00a884 0% 40%, #25d366 40% 70%, #34b7f1 70% 90%, #ffad1f 90% 100%)",
             position: "relative"
           }}></div>
           <div style={{ display: "flex", gap: "15px", marginTop: "20px", flexWrap: "wrap", justifyContent: "center" }}>
             <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px" }}><span style={{width: 10, height: 10, background: "#00a884", borderRadius: "50%"}}></span> NA (40%)</div>
             <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px" }}><span style={{width: 10, height: 10, background: "#25d366", borderRadius: "50%"}}></span> EU (30%)</div>
             <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px" }}><span style={{width: 10, height: 10, background: "#34b7f1", borderRadius: "50%"}}></span> AS (20%)</div>
             <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px" }}><span style={{width: 10, height: 10, background: "#ffad1f", borderRadius: "50%"}}></span> Other (10%)</div>
           </div>
        </div>
      </div>

      <h3 style={{ marginBottom: "20px", color: "var(--text-primary)" }}>User Management</h3>
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
                  {u.email !== "admin@gmail.com" && (
                    <button 
                      onClick={() => handleDelete(u._id)} 
                      className="admin-action-btn danger"
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
        </>
      ) : (
        <div className="admin-table">
          <h3 style={{ padding: "16px", margin: 0, borderBottom: "1px solid var(--border-color)", color: "var(--text-primary)" }}>System Activity Logs</h3>
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Level</th>
                <th>Message</th>
              </tr>
            </thead>
            <tbody>
              {systemLogs.map((log) => (
                <tr key={log.id}>
                  <td style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{new Date(log.timestamp).toLocaleString()}</td>
                  <td>
                    <span style={{
                      padding: "4px 8px",
                      borderRadius: "4px",
                      fontSize: "10px",
                      fontWeight: "bold",
                      color: "white",
                      backgroundColor: log.level === "ERROR" ? "#ff4d4d" : log.level === "WARNING" ? "#ff9800" : "#00a884"
                    }}>
                      {log.level}
                    </span>
                  </td>
                  <td>{log.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}