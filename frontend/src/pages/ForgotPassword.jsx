import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const { data } = await api.post("/auth/forgot-password", { email });
      setMessage(data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit}>
        <h2>Forgot Password</h2>
        <p style={{textAlign: 'center', marginBottom: '20px', color: 'var(--text-secondary)'}}>
          Enter your email address and we'll send you a link to reset your password.
        </p>
        {message && <p style={{ color: "green", textAlign: "center" }}>{message}</p>}
        {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
        
        <input 
          type="email" 
          placeholder="Enter your email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required
        />
        
        <button type="submit" disabled={loading}>
          {loading ? <span className="loading-spinner"></span> : "Send Reset Link"}
        </button>
        
        <div style={{marginTop: '15px', textAlign: 'center'}}>
          <span 
            onClick={() => navigate("/")} 
            style={{color: 'var(--primary-green)', cursor: 'pointer', fontSize: '14px'}}
          >
            Back to Login
          </span>
        </div>
      </form>
    </div>
  );
}