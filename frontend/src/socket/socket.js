import { io } from "socket.io-client";

// Get user from sessionStorage if available
const getUserFromStorage = () => {
  try {
    const user = sessionStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

const SOCKET_URL = (import.meta.env.VITE_API_URL || "http://localhost:5001").replace(/\/api$/, "");

export const socket = io(SOCKET_URL, {
  reconnectionDelay: 1000,
  reconnection: true,
  reconnectionAttempts: 10,
  transports: ["websocket", "polling"],
  autoConnect: true,
  auth: {
    user: getUserFromStorage()
  }
});

socket.on("connect", () => {
  console.log("Socket connected:", socket.id);
  console.log("Auth user:", socket.auth?.user);
});

socket.on("connect_error", (error) => {
  console.error("Socket connection error:", error);
});

socket.on("disconnect", (reason) => {
  console.log("Socket disconnected:", reason);
});

// Update socket auth when user changes
export const updateSocketAuth = (user) => {
  console.log("Updating socket auth with user:", user);
  socket.auth.user = user;
  if (socket.connected) {
    // Reconnect with new auth
    socket.disconnect();
    socket.connect();
  }
};
