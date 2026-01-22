import { createContext, useContext, useState, useEffect } from "react";
import io from "socket.io-client";

const ChatContext = createContext();
let socket;

export const ChatProvider = ({ children }) => {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket = io("http://localhost:5000");

    socket.on("online-users", users => setOnlineUsers(users));
    socket.on("receive-message", msg => setMessages(prev => [...prev, msg]));
    socket.on("message-seen", ({ messageId }) => {
      setMessages(prev => prev.map(m => m._id === messageId ? { ...m, status: "seen" } : m));
    });

    return () => socket.disconnect();
  }, []);

  const sendMessage = msg => {
    socket.emit("send-message", msg);
    setMessages(prev => [...prev, { ...msg, status: "sent" }]);
  };

  const markSeen = messageId => {
    socket.emit("seen-message", { messageId });
  };

  return (
    <ChatContext.Provider value={{ onlineUsers, messages, sendMessage, markSeen }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
