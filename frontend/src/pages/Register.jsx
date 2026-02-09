import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { countries } from "../constants.js";


export default function Register() {
  const { register, setUser } = useAuth();
  const navigate = useNavigate();
  const [username,setUsername] = useState("");
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error,setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [country, setCountry] = useState("");

  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then(res => res.json())
      .then(data => setCountry(data.country_name))
      .catch(() => console.error("Failed to detect country"));
  }, []);

  const handleRegister = async () => {
    if(!username || !email || !password || !confirmPassword){setError("All fields are required"); return;}
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError("");
    try{
      await register(username, email, password, confirmPassword);
      if (country) {
        try {
          const { data } = await api.put("/users/profile", { country });
          // Update local user state and storage with the new country data
          setUser(prev => {
            const updated = { ...prev, ...data };
            localStorage.setItem("userInfo", JSON.stringify(updated));
            return updated;
          });
        } catch { console.error("Failed to save country"); }
      }
      alert("Registration successful!");
      navigate("/users");
    }catch(err){
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return(
    <div className="auth-container">
    <form onSubmit={(e) => { e.preventDefault(); handleRegister(); }}>
      <h2>Register</h2>
      {error && <p style={{color:"red"}}>{error}</p>}
      <input placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} />
      <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
      <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} />
      
      <input 
        list="register-countries"
        placeholder="Select Country"
        value={country} 
        onChange={(e) => setCountry(e.target.value)}
        style={{ width: "100%", padding: "13px 16px", marginBottom: "14px", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", background: "var(--input-bg)", color: "var(--text-primary)", fontSize: "15px", outline: "none" }}
      />
      <datalist id="register-countries">
        {countries.map(c => (
          <option key={c.code} value={c.name}>
            {c.code.toUpperCase().replace(/./g, char => String.fromCodePoint(char.charCodeAt(0) + 127397))} {c.name}
          </option>
        ))}
      </datalist>

      <button type="submit" disabled={loading}>
        {loading ? <span className="loading-spinner"></span> : "Register"}
      </button>
      <p style={{cursor:"pointer",color:"blue", textAlign: 'center'}} onClick={()=>navigate("/")}>Already have an account? Login</p>
    </form>
    </div>
  )
}
