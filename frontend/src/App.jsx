import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Users from "./pages/Users";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import Settings from "./pages/Settings";
import Notifications from "/src/pages/settings/Notifications.jsx";
import Privacy from "/src/pages/settings/Privacy.jsx";
import Security from "/src/pages/settings/Security.jsx";
import ChatHistory from "/src/pages/settings/ChatHistory.jsx";
import { useAuth } from "./context/AuthContext";

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><div className="loading-spinner" style={{ borderTopColor: '#00a884', borderRightColor: '#00a884' }}></div></div>;
  }

  return (
    <Routes>
      <Route path="/" element={!user ? <Login /> : <Navigate to="/users" />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/users" />} />
      <Route path="/users" element={user ? <Users /> : <Navigate to="/" />} />
      <Route path="/profile" element={user ? <Profile /> : <Navigate to="/" />} />
      <Route path="/admin" element={user?.isAdmin ? <Admin /> : <Navigate to="/" />} />
      <Route path="/settings" element={user ? <Settings /> : <Navigate to="/" />} />
      <Route path="/settings/notifications" element={user ? <Notifications /> : <Navigate to="/" />} />
      <Route path="/settings/privacy" element={user ? <Privacy /> : <Navigate to="/" />} />
      <Route path="/settings/security" element={user ? <Security /> : <Navigate to="/" />} />
      <Route path="/settings/chat-history" element={user ? <ChatHistory /> : <Navigate to="/" />} />
    </Routes>
  );
}
