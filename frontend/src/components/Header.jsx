import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <header className="app-header">
      <div className="header-logo" onClick={() => navigate("/")}>
        <img src="/Chat_Z.jpeg" alt="Chat_Z Logo" className="logo-image" onError={(e) => {e.target.style.display='none'}} />
        <span className="dynamic-logo-text">Chat_Z</span>
      </div>
      <nav className="header-nav">
        <button onClick={() => navigate("/status")}>Status</button>
        <button onClick={() => navigate("/users")}>Chats</button>
        <button onClick={() => navigate("/about")}>About</button>
        {user ? (
          <button onClick={() => { logout(); navigate("/"); }}>Logout</button>
        ) : (
          <button onClick={() => navigate("/")}>Login</button>
        )}
      </nav>
    </header>
  );
}