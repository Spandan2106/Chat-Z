import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <header className="app-header">
      <div className="header-logo" onClick={() => navigate("/")}>Chat_Z</div>
      <nav className="header-nav">
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