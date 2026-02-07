import { useState, useEffect, useCallback, useRef } from "react";
import { socket } from "../socket/socket";
import { ChatContext } from "./ChatContextFile";
import api from "../api/axios";

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
  const [currentChat, setCurrentChat] = useState(null);
  const autoRefreshRef = useRef(null);

  useEffect(() => {
    // Persist messages to localStorage whenever they change
    localStorage.setItem("chatMessages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    // Persist chats to localStorage whenever they change
    localStorage.setItem("chatsList", JSON.stringify(chats));
  }, [chats]);

  // Fetch messages for the current chat
  const fetchMessages = useCallback(async (chatId) => {
    if (!chatId) return;
    try {
      console.log("Fetching messages for chat:", chatId);
      const response = await api.get(`/messages/${chatId}`);
      console.log("Messages fetched:", response.data?.length);
      setMessages(response.data || []);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  }, []);

  // Update current chat and fetch its messages
  const updateCurrentChat = useCallback((chat) => {
    console.log("Setting current chat:", chat?._id);
    setCurrentChat(chat);
    
    // Clear auto-refresh timer for previous chat
    if (autoRefreshRef.current) {
      clearInterval(autoRefreshRef.current);
    }

    if (chat && chat._id) {
      // Fetch messages immediately
      fetchMessages(chat._id);

      // Set up auto-refresh every 3 seconds to ensure real-time updates
      autoRefreshRef.current = setInterval(() => {
        fetchMessages(chat._id);
      }, 3000);
    }

    return () => {
      if (autoRefreshRef.current) {
        clearInterval(autoRefreshRef.current);
      }
    };
  }, [fetchMessages]);

  useEffect(() => {
    // User online/offline events
    socket.on("online-users", users => {
      console.log("Online users updated:", users);
      setOnlineUsers(users);
      const statusMap = {};
      users.forEach(u => { statusMap[u._id] = true; });
      setOnlineStatus(statusMap);
    });

    // Message events - add message once without duplicates
    socket.on("message received", msg => {
      console.log("Socket: Message received event fired:", msg?._id);
      setMessages(prev => {
        const exists = prev.some(m => m._id === msg._id);
        if (exists) {
          console.log("Message already exists, skipping");
          return prev;
        }
        console.log("Adding new message to state");
        return [...prev, msg];
      });
    });

    // Chat updated event - update chat list with new message indicator
    socket.on("chat-updated", ({ chatId, latestMessage, updatedAt }) => {
      console.log("Chat updated:", chatId);
      setChats(prev => 
        prev.map(chat => 
          chat._id === chatId 
            ? { ...chat, latestMessage, updatedAt } 
            : chat
        ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      );
    });

    socket.on("message-seen", ({ messageId }) => {
      console.log("Message seen:", messageId);
      setMessages(prev => 
        prev.map(m => m._id === messageId ? { ...m, status: "seen" } : m)
      );
    });

    // Typing indicators
    socket.on("user-typing", ({ chatId, userId, username }) => {
      console.log("User typing:", username);
      setTypingUsers(prev => ({
        ...prev,
        [chatId]: { userId, username }
      }));
    });

    socket.on("stop-typing", ({ chatId }) => {
      console.log("User stopped typing");
      setTypingUsers(prev => {
        const newState = { ...prev };
        delete newState[chatId];
        return newState;
      });
    });

    // User online/offline status
    socket.on("user-online", ({ userId }) => {
      console.log("User online:", userId);
      setOnlineStatus(prev => ({ ...prev, [userId]: true }));
    });

    socket.on("user-offline", ({ userId }) => {
      console.log("User offline:", userId);
      setOnlineStatus(prev => ({ ...prev, [userId]: false }));
    });

    // Listen for group creation and updates
    socket.on("chat-group-update", (updatedGroup) => {
      console.log("Group updated:", updatedGroup?._id);
      setChats(prev => {
        const index = prev.findIndex(c => c._id === updatedGroup._id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = updatedGroup;
          return updated;
        }
        return [...prev, updatedGroup];
      });
    });

    socket.on("group-created", (newGroup) => {
      console.log("Group created:", newGroup?._id);
      setChats(prev => {
        const exists = prev.some(chat => chat._id === newGroup._id);
        return exists ? prev : [...prev, newGroup];
      });
    });

    return () => {
      socket.off("online-users");
      socket.off("message received");
      socket.off("chat-updated");
      socket.off("message-seen");
      socket.off("user-typing");
      socket.off("stop-typing");
      socket.off("user-online");
      socket.off("user-offline");
      socket.off("chat-group-update");
      socket.off("group-created");
    };
  }, []);

  const sendMessage = msg => {
    console.log("Sending message:", msg);
    socket.emit("send-message", msg);
  };

  const markSeen = messageId => {
    socket.emit("seen-message", { messageId });
  };

  const sendTyping = (chatId) => {
    socket.emit("typing", { chatId });
  };

  const stopTyping = (chatId) => {
    socket.emit("stop-typing", { chatId });
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

  const setupSocket = (userData) => {
    if (userData && userData._id) {
      console.log("Setting up socket with user:", userData._id);
      socket.emit("setup", userData);
    }
  };

  const joinChat = (chatId) => {
    if (chatId) {
      console.log("Joining chat:", chatId);
      socket.emit("join-chat", chatId);
    }
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
      clearChatHistory,
      setupSocket,
      joinChat,
      currentChat,
      setCurrentChat: updateCurrentChat,
      fetchMessages
    }}>
      {children}
    </ChatContext.Provider>
  );
};
