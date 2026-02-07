
import api from "../api/axios";
import { createContext, useState, useContext, useEffect } from "react";
import { updateSocketAuth } from "../socket/socket";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Initialize from localStorage if available
    const cached = localStorage.getItem("user");
    return cached ? JSON.parse(cached) : null;
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);



  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const cachedUser = sessionStorage.getItem("user");

        if (token) {
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

          // Try to validate token with backend
          try {
            const res = await api.get("/auth/me");
            const userData = res.data.user;
            setUser(userData);
            sessionStorage.setItem("user", JSON.stringify(userData));
            // Update socket auth when user is validated
            updateSocketAuth(userData);
            setError(null);
          } catch (err) {
            console.warn("Backend not available, using cached user data:", err.message);

            // If backend is not available but we have cached user data, use it
            if (cachedUser) {
              try {
                const userData = JSON.parse(cachedUser);
                setUser(userData);
                setError(null);
                console.log("Using cached user data for offline mode");
              } catch (parseErr) {
                console.error("Invalid cached user data:", parseErr);
                sessionStorage.removeItem("token");
                sessionStorage.removeItem("user");
                delete api.defaults.headers.common["Authorization"];
                setUser(null);
              }
            } else {
              // No cached data, clear everything
              sessionStorage.removeItem("token");
              sessionStorage.removeItem("user");
              delete api.defaults.headers.common["Authorization"];
              setUser(null);
            }
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      const res = await api.post("/auth/login", { email, password });
      const token = res.data.token;
      const userData = res.data.user;
      sessionStorage.setItem("token", token);
      sessionStorage.setItem("user", JSON.stringify(userData));
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser(userData);
      // Update socket auth so server handshake has current user
      try { updateSocketAuth(userData); } catch (err) { console.warn('Failed to update socket auth on login', err); }
      return res.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Login failed";
      setError(errorMsg);
      throw err;
    }
  };

  const register = async (username, email, password, confirmPassword) => {
    try {
      setError(null);
      const res = await api.post("/auth/register", { username, email, password, confirmPassword });
      const token = res.data.token;
      const userData = res.data.user;
      sessionStorage.setItem("token", token);
      sessionStorage.setItem("user", JSON.stringify(userData));
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser(userData);
      try { updateSocketAuth(userData); } catch (err) { console.warn('Failed to update socket auth on register', err); }
      return res.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Registration failed";
      setError(errorMsg);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      localStorage.removeItem("chatMessages");
      localStorage.removeItem("chatsList");
      delete api.defaults.headers.common["Authorization"];
      try { updateSocketAuth(null); } catch (err) { /* ignore */ }
      setUser(null);
      setError(null);
    }
  };

  const updateUserProfile = async (userData) => {
    try {
      const res = await api.put("/auth/update-profile", userData);
      setUser(res.data.user);
      return res.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Update failed";
      setError(errorMsg);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, error, login, register, logout, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
