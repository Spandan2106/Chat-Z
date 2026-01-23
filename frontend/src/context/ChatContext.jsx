import { useState, useEffect } from "react";
import io from "socket.io-client";
import { ChatContext } from "./ChatContextFile";

let socket;

export const ChatProvider = ({ children }) => {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [messages, setMessages] = useState(() => {
    // Load messages from localStorage on init
    const cached = localStorage.getItem("chatMessages");
    return cached ? JSON.parse(cached) : [];
  });
  const [chats, setChats] = useState(() => {
    // Load chats from localStorage on init
    const cached = localStorage.getItem("chatsList");
    return cached ? JSON.parse(cached) : [];
  });
  const [typingUsers, setTypingUsers] = useState({});
  const [onlineStatus, setOnlineStatus] = useState({});

  useEffect(() => {
    // Persist messages to localStorage whenever they change
    localStorage.setItem("chatMessages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    // Persist chats to localStorage whenever they change
    localStorage.setItem("chatsList", JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    socket = io("http://localhost:5000", {
      reconnectionDelay: 1000,
      reconnection: true,
      reconnectionAttempts: 10,
      transports: ["websocket"],
    });

    // User online/offline events
    socket.on("online-users", users => {
      setOnlineUsers(users);
      const statusMap = {};
      users.forEach(u => { statusMap[u._id] = true; });
      setOnlineStatus(statusMap);
    });

    // Message events
    socket.on("receive-message", msg => {
      setMessages(prev => {
        const exists = prev.some(m => m._id === msg._id);
        return exists ? prev : [...prev, msg];
      });
    });

    socket.on("message-seen", ({ messageId }) => {
      setMessages(prev => prev.map(m => m._id === messageId ? { ...m, status: "seen" } : m));
    });

    // Typing indicators
    socket.on("user-typing", ({ chatId, userId, username }) => {
      setTypingUsers(prev => ({
        ...prev,
        [chatId]: { userId, username }
      }));
    });

    socket.on("stop-typing", ({ chatId }) => {
      setTypingUsers(prev => {
        const newState = { ...prev };
        delete newState[chatId];
        return newState;
      });
    });

    // User online/offline status
    socket.on("user-online", ({ userId }) => {
      setOnlineStatus(prev => ({ ...prev, [userId]: true }));
    });

    socket.on("user-offline", ({ userId }) => {
      setOnlineStatus(prev => ({ ...prev, [userId]: false }));
    });

    return () => {
      socket.off("online-users");
      socket.off("receive-message");
      socket.off("message-seen");
      socket.off("user-typing");
      socket.off("user-stopped-typing");
      socket.off("user-online");
      socket.off("user-offline");
      socket.disconnect();
    };
  }, []);

  const sendMessage = msg => {
    socket.emit("send-message", msg);
    setMessages(prev => [...prev, { ...msg, status: "sent" }]);
  };

  const markSeen = messageId => {
    socket.emit("seen-message", { messageId });
  };

  const sendTyping = (chatId) => {
    socket.emit("typing", chatId);
  };

  const stopTyping = (chatId) => {
    socket.emit("stop-typing", chatId);
  };

  const updateChatsList = (newChats) => {
    setChats(newChats);
  };

  const clearChatHistory = () => {
    localStorage.removeItem("chatMessages");
    localStorage.removeItem("chatsList");
    setMessages([]);
    setChats([]);
  };

  return (
    <ChatContext.Provider value={{ 
      onlineUsers, 
      messages, 
      chats,
      sendMessage, 
      markSeen,
      sendTyping,
      stopTyping,
      typingUsers,
      onlineStatus,
      updateChatsList,
      clearChatHistory
    }}>
      {children}
    </ChatContext.Provider>
  );
};
