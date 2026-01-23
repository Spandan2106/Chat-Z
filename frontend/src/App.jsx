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
import Header from "./components/Header";
import Footer from "./components/Footer";
import About from "./pages/About";

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
          <ProtectedRoute user={user}>
            <Settings />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/settings/notifications" 
        element={
          <ProtectedRoute user={user}>
            <Notifications />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/settings/privacy" 
        element={
          <ProtectedRoute user={user}>
            <Privacy />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/settings/security" 
        element={
          <ProtectedRoute user={user}>
            <Security />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/settings/chat-history" 
        element={
          <ProtectedRoute user={user}>
            <ChatHistory />
          </ProtectedRoute>
        } 
      />

      {/* Catch All - Redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    {user && <Footer />}
    </>
  );
}
