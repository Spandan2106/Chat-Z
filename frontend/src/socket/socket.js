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

export const socket = io("http://localhost:5000", {
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
  console.log("Auth user:", socket.handshake.auth?.user);
});

socket.on("connect_error", (error) => {
  console.error("Socket connection error:", error);
});

socket.on("disconnect", (reason) => {
  console.log("Socket disconnected:", reason);
});
