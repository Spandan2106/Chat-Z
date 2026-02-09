import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Login() {
  const { login, setUser } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginType, setLoginType] = useState("user"); // 'user' | 'admin'

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      if (loginType === "admin") {
        if (email.trim() !== "admin@gmail.com" || password !== "admin2019usaNY2026@$") {
          throw new Error("Invalid Admin Credentials");
        }
        const { data } = await api.post("/users/admin-login", { email: email.trim(), password });
        localStorage.setItem("userInfo", JSON.stringify(data));
        api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
        setUser(data);
        navigate("/admin", { replace: true });
        return;
      } else if (loginType === "support") {
        if (email.trim().toLowerCase() !== "customercare@gmail.com" || password !== "####123") {
          throw new Error("Invalid Support Credentials");
        }
        const { data } = await api.post("/users/support-login", { email: email.trim().toLowerCase(), password });
        localStorage.setItem("userInfo", JSON.stringify(data));
        api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
        setUser(data);
        navigate("/users", { replace: true });
        return;
      }
      await login(email, password);
      return;
    } catch (error) {
      console.log(error);
      setError(error.message || error.response?.data?.message || "Invalid email or password");
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
    <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
      <h2>Login</h2>
      
      <div style={{ display: "flex", marginBottom: "20px", background: "#e9edef", borderRadius: "8px", padding: "4px" }}>
        <button
          type="button"
          onClick={() => setLoginType("user")}
          style={{
            flex: 1,
            background: loginType === "user" ? "#00a884" : "transparent",
            color: loginType === "user" ? "white" : "#54656f",
            margin: 0,
            boxShadow: "none"
          }}
        >
          User
        </button>
        <button
          type="button"
          onClick={() => setLoginType("admin")}
          style={{
            flex: 1,
            background: loginType === "admin" ? "#00a884" : "transparent",
            color: loginType === "admin" ? "white" : "#54656f",
            margin: 0,
            boxShadow: "none"
          }}
        >
          Admin
        </button>
        <button
          type="button"
          onClick={() => setLoginType("support")}
          style={{
            flex: 1,
            background: loginType === "support" ? "#00a884" : "transparent",
            color: loginType === "support" ? "white" : "#54656f",
            margin: 0,
            boxShadow: "none"
          }}
        >
          Support
        </button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}
      <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
      
      <div className="forgot-password" onClick={() => navigate("/forgot-password")}>
        Forgot Password?
      </div>

      <button type="submit" disabled={loading}>
        {loading ? <span className="loading-spinner"></span> : "Login"}
      </button>
      <p style={{cursor:"pointer",color:"blue", textAlign: 'center'}} onClick={()=>navigate("/register")}>Create an account</p>
    </form>
    </div>
  );
}
