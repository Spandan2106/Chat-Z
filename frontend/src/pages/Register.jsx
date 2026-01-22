import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username,setUsername] = useState("");
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error,setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      alert("Registration successful!");
      navigate("/users");
    }catch(err){
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return(
    <form onSubmit={(e) => { e.preventDefault(); handleRegister(); }}>
      <h2>Register</h2>
      {error && <p style={{color:"red"}}>{error}</p>}
      <input placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} />
      <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
      <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} />
      <button type="submit" disabled={loading}>
        {loading ? <span className="loading-spinner"></span> : "Register"}
      </button>
      <p style={{cursor:"pointer",color:"blue", textAlign: 'center'}} onClick={()=>navigate("/")}>Already have an account? Login</p>
    </form>
  )
}
