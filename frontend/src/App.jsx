import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Users from "./pages/Users.jsx";
import Profile from "./pages/Profile.jsx";
import Admin from "./pages/Admin.jsx";
import Settings from "./pages/Settings.jsx";
import Notifications from "/src/pages/settings/Notifications.jsx";
import Privacy from "/src/pages/settings/Privacy.jsx";
import Security from "/src/pages/settings/Security.jsx";
import ChatHistory from "/src/pages/settings/ChatHistory.jsx";
import { useAuth } from "./context/AuthContext";
import DeviceLinking from "/src/pages/settings/DeviceLinking.jsx";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import About from "./pages/About.jsx";
import Status from "./pages/Status.jsx";
import VirtualKeyboard from "./components/VirtualKeyboard.jsx";

// Protected Route Wrapper
const ProtectedRoute = ({ children, user, isAdmin = false }) => {
  if (!user) return <Navigate to="/" replace />;
  if (isAdmin && !user.isAdmin) return <Navigate to="/" replace />;
  return children;
};

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="loading-spinner" style={{ borderTopColor: '#00a884', borderRightColor: '#00a884' }}></div>
      </div>
    );
  }

  return (
    <>
    {user && <Header />}
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/" 
        element={user ? <Navigate to="/users" replace /> : <Login />} 
      />
      <Route 
        path="/register" 
        element={user ? <Navigate to="/users" replace /> : <Register />} 
      />
      <Route 
        path="/status"
        element={
          <ProtectedRoute user={user}><Status /></ProtectedRoute>
        }
      />
      <Route path="/about" element={<About />} />

      {/* Protected Routes */}
      <Route 
        path="/users" 
        element={
          <ProtectedRoute user={user}>
            <Users />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute user={user}>
            <Profile />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile/:userId" 
        element={
          <ProtectedRoute user={user}>
            <Profile />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute user={user} isAdmin={true}>
            <Admin />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/settings" 
        element={
          <ProtectedRoute user={user}><Settings /></ProtectedRoute>
        }
      >
        <Route index element={
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
            <span style={{ fontSize: '48px', marginBottom: '20px' }}>⚙️</span>
            <h2>Settings</h2>
            <p>Select a category from the menu to configure your preferences.</p>
          </div>
        } />
        <Route path="notifications" element={<Notifications />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="security" element={<Security />} />
        <Route path="chat-history" element={<ChatHistory />} />
        <Route path="device-linking" element={<DeviceLinking />} />
      </Route>

      {/* Catch All - Redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    {user && <Footer />}
    <VirtualKeyboard />
    </>
  );
}
