import { useState, useEffect, useRef, useCallback } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket/socket";

export default function Users() {
  const { user, setUser, logout } = useAuth();
  const [chats, setChats] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState(null);
  const [searchError, setSearchError] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResultLimit, setSearchResultLimit] = useState(10);
  const [selectedChat, setSelectedChat] = useState(null);
  const selectedChatRef = useRef(null); // Ref to track selected chat without re-running effects
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedGroupUsers, setSelectedGroupUsers] = useState([]);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [searchAddMemberQuery, setSearchAddMemberQuery] = useState("");
  const [addMemberSearchResults, setAddMemberSearchResults] = useState([]);
  const navigate = useNavigate();
  const scrollRef = useRef();
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsername, setTypingUsername] = useState("");
  const [showChatMenu, setShowChatMenu] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [messageSearchQuery, setMessageSearchQuery] = useState("");
  const [showMessageSearch, setShowMessageSearch] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const fileInputRef = useRef();
  const textInputRef = useRef();
  const typingTimeoutRef = useRef(null);
  const [filterType, setFilterType] = useState("all"); // 'all', 'users', 'groups'
  const [sidebarWidth, setSidebarWidth] = useState(350);
  const sidebarRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  // const [starredMessages, setStarredMessages] = useState([]);
  const [contextMenu, setContextMenu] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [messageToForward, setMessageToForward] = useState(null);
  
  // --- Status State ---
  const [statuses, setStatuses] = useState([]);
  const [viewingStatusGroup, setViewingStatusGroup] = useState(null);
  const [showStatusUpload, setShowStatusUpload] = useState(false);
  const [statusContent, setStatusContent] = useState("");
  const [statusColor, setStatusColor] = useState("#008069");

  // --- Call State ---
  const [stream, setStream] = useState();
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callAccepted, setCallAccepted] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [callEnded, setCallEnded] = useState(false);
  const myVideo = useRef();
  const userVideo = useRef();

  const startResizing = useCallback((mouseDownEvent) => {
    mouseDownEvent.preventDefault();
    const startX = mouseDownEvent.clientX;
    const startWidth = sidebarRef.current.getBoundingClientRect().width;

    const doDrag = (mouseMoveEvent) => {
      const newWidth = startWidth + (mouseMoveEvent.clientX - startX);
      if (newWidth > 250 && newWidth < 800) {
        setSidebarWidth(newWidth);
      }
    };

    const stopDrag = () => {
      document.removeEventListener('mousemove', doDrag);
      document.removeEventListener('mouseup', stopDrag);
    };

    document.addEventListener('mousemove', doDrag);
    document.addEventListener('mouseup', stopDrag);
  }, []);

  // Socket connection setup
  useEffect(() => {
    if (!user) return;

    socket.emit("setup", user);
    socket.on("connected", () => {
      console.log("Socket connected");
      setSocketConnected(true);
    });
    // Also listen for standard connect event
    socket.on("connect", () => {
      setSocketConnected(true);
      // Re-establish setup and room join on reconnect
      socket.emit("setup", user);
      if (selectedChatRef.current) {
        socket.emit("join-chat", selectedChatRef.current._id);
      }
    });

    socket.on("online-users", (users) => {
      console.log("Online users:", users);
      setOnlineUsers(users);
    });

    return () => {
      socket.off("connected");
      socket.off("connect");
      socket.off("online-users");
    };
  }, [user]);

  // Keep selectedChatRef in sync
  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  // Real-time message and typing handlers
  useEffect(() => {
    if (!socket) return;

    const messageHandler = (newMessageReceived) => {
      // Always update the chat list for notifications and ordering
      setChats(prevChats => {
        const chatIndex = prevChats.findIndex(c => c._id === newMessageReceived.chatId._id);
        let newChats;

        if (chatIndex !== -1) {
          // Chat exists, update it and move to top
          const updatedChat = { ...prevChats[chatIndex], latestMessage: newMessageReceived };
          newChats = [
            updatedChat,
            ...prevChats.slice(0, chatIndex),
            ...prevChats.slice(chatIndex + 1)
          ];
        } else {
          // New chat (e.g., user was added to a group), add it to the top
          const newChat = { ...newMessageReceived.chatId, latestMessage: newMessageReceived };
          newChats = [newChat, ...prevChats];
        }
        return newChats;
      });

      // If the message is for the currently open chat, update the message view
      if (selectedChatRef.current && selectedChatRef.current._id === newMessageReceived.chatId._id) {
        setMessages(prevMessages => {
          // Strict string comparison to prevent duplicates
          const exists = prevMessages.some(m => String(m._id) === String(newMessageReceived._id));
          return exists ? prevMessages : [...prevMessages, newMessageReceived];
        });
      }
    };

    const typingHandler = ({ username, chatId }) => {
      if (selectedChatRef.current && selectedChatRef.current._id === chatId) {
        setTypingUsername(username);
        setIsTyping(true);
      }
    };

    const stopTypingHandler = ({ chatId } = {}) => {
      if (!chatId || !selectedChatRef.current) return;
      if (selectedChatRef.current._id === chatId) {
        setIsTyping(false);
        setTypingUsername("");
      }
    };

    const userOnlineHandler = ({ userId, username }) => {
      console.log(`${username} is online`);
      setOnlineUsers(prev => [...new Set([...prev, userId])]);
    };

    const userOfflineHandler = ({ userId }) => {
      console.log(`User ${userId} is offline`);
      setOnlineUsers(prev => prev.filter(id => id !== userId));
    };

    // Listen for group updates (added to group, etc.)
    const chatGroupUpdateHandler = (updatedChat) => {
        setChats(prev => {
            const exists = prev.find(c => c._id === updatedChat._id);
            if (exists) return prev.map(c => c._id === updatedChat._id ? updatedChat : c);
            return [updatedChat, ...prev];
        });
    };

    const chatGroupDeletedHandler = (chatId) => {
      setChats(prev => prev.filter(c => c._id !== chatId));
      if (selectedChatRef.current && selectedChatRef.current._id === chatId) {
        setSelectedChat(null);
      }
    };

    const messageDeletedHandler = (updatedMessage) => {
      setMessages(prev => prev.map(m => m._id === updatedMessage._id ? updatedMessage : m));
    };

    const messagesReadHandler = ({ chatId }) => {
      if (selectedChatRef.current && selectedChatRef.current._id === chatId) {
        setMessages(prev => prev.map(m => ({ ...m, status: "seen" })));
      }
    };

    socket.on("message received", messageHandler);
    socket.on("user-typing", typingHandler);
    socket.on("stop-typing", stopTypingHandler);
    socket.on("user-online", userOnlineHandler);
    socket.on("user-offline", userOfflineHandler);
    socket.on("chat-group-update", chatGroupUpdateHandler); // Listen for group updates
    socket.on("chat-group-deleted", chatGroupDeletedHandler);
    socket.on("message-deleted", messageDeletedHandler);
    socket.on("messages-read", messagesReadHandler);

    return () => {
      socket.off("message received", messageHandler);
      socket.off("user-typing", typingHandler);
      socket.off("stop-typing", stopTypingHandler);
      socket.off("user-online", userOnlineHandler);
      socket.off("user-offline", userOfflineHandler);
      socket.off("chat-group-update", chatGroupUpdateHandler);
      socket.off("chat-group-deleted", chatGroupDeletedHandler);
      socket.off("message-deleted", messageDeletedHandler);
      socket.off("messages-read", messagesReadHandler);
    };
  }, []); // Empty dependency array ensures listeners are stable

  // --- Call useEffect ---
  useEffect(() => {
    socket.on("callUser", (data) => {
      setReceivingCall(true);
      setCaller(data.from);
    });

    return () => {
      socket.off("callUser");
    }
  }, []);

  // Fetch chats on component mount
  useEffect(() => {
    const fetchChats = async () => {
      if (!user) return;
      try {
        const res = await api.get("/messages/chat");
        console.log("Chats loaded:", res.data);
        setChats(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to fetch chats:", err);
        setChats([]);
      }
    };
    fetchChats();
  }, [user]);

  // Fetch all users for group creation
  useEffect(() => {
    const fetchUsers = async () => {
      setUsersLoading(true);
      setUsersError(null);
      try {
        const res = await api.get("/users");
        setAllUsers(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to fetch users:", err);
        setUsersError("Failed to load users. The server might be down or there's a network issue.");
      } finally {
        setUsersLoading(false);
      }
    };
    fetchUsers();
  }, [user]);

  // Fetch Statuses
  useEffect(() => {
    if (filterType === "status") {
      api.get("/status")
        .then(res => setStatuses(res.data))
        .catch(err => console.error("Failed to fetch statuses:", err));
    }
  }, [filterType]);

  // Fetch messages when chat is selected
  useEffect(() => {
    const getMessages = async () => {
      if (!selectedChat) return;
      try {
        const res = await api.get(`/messages/${selectedChat._id}`);
        console.log("Messages loaded:", res.data);
        setMessages(res.data || []);
        socket.emit("join-chat", selectedChat._id);
        setIsMuted(user?.mutedChats?.includes(selectedChat._id) || false);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
        setMessages([]);
      }
    };
    getMessages();
  }, [selectedChat, user]);

  // Auto-scroll to latest message
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark messages as read
  useEffect(() => {
    if (selectedChat && messages.length > 0) {
      const unread = messages.some(m => m.sender._id !== user._id && m.status !== "seen");
      if (unread) {
        api.put("/messages/read", { chatId: selectedChat._id }).catch(console.error);
        socket.emit("read-messages", { chatId: selectedChat._id });
        // Optimistically update
        setMessages(prev => prev.map(m => m.sender._id !== user._id ? { ...m, status: "seen" } : m));
      }
    }
  }, [messages, selectedChat, user._id]);

  // Close context menu on click outside
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setUsersError(null); // Reset error on refresh
    try {
      const usersRes = await api.get("/users");
      setAllUsers(Array.isArray(usersRes.data) ? usersRes.data : []);

      const chatsRes = await api.get("/messages/chat");
      setChats(chatsRes.data || []);
      setUsersError(null);
    } catch (err) {
      console.error("Failed to refresh:", err);
      setUsersError("Failed to refresh data. Check your connection.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat || isSending) return;
    try {
      setIsSending(true);
      const res = await api.post(`/messages`, {
        content: newMessage,
        chatId: selectedChat._id,
        replyTo: replyingTo?._id
      });
      // Emit socket event
      socket.emit("send-message", res.data);
      // Use functional update to prevent stale state issues
      setMessages(prev => {
        if (prev.some(m => String(m._id) === String(res.data._id))) return prev;
        return [...prev, res.data];
      });
      setNewMessage("");
      setReplyingTo(null);
      socket.emit("stop-typing", { chatId: selectedChat._id });
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setIsSending(false);
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected || !selectedChat) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", { chatId: selectedChat._id });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop-typing", { chatId: selectedChat._id });
      setTyping(false);
    }, 3000);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("chatId", selectedChat._id);

    try {
      const res = await api.post("/messages/media", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // Adjust based on your media message response structure
      const msg = { ...res.data, sender: user, createdAt: new Date() };
      setMessages([...messages, msg]);
      socket.emit("send-message", msg);
    } catch (err) {
      console.error("File upload failed", err);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], "voice_message.webm", { type: 'audio/webm' });
        
        const formData = new FormData();
        formData.append("file", audioFile);
        formData.append("chatId", selectedChat._id);

        try {
          const res = await api.post("/messages/media", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          const msg = { ...res.data, sender: user, createdAt: new Date() };
          setMessages(prev => [...prev, msg]);
          socket.emit("send-message", msg);
        } catch (err) {
          console.error("Audio upload failed", err);
        }
        
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handlePostStatus = async () => {
    if (!statusContent.trim()) return;
    try {
      await api.post("/status", {
        type: "text",
        content: statusContent,
        backgroundColor: statusColor
      });
      setShowStatusUpload(false);
      setStatusContent("");
      api.get("/status").then(res => setStatuses(res.data));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setSearchResultLimit(10);
    setSearchError(null);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!query) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    // Search Groups locally
    const groupResults = chats.filter(c => 
      c.isGroupChat && c.chatName.toLowerCase().includes(query.toLowerCase())
    );

    // Prioritize client-side search if allUsers is available
    if (allUsers.length > 0) {
      const clientResults = allUsers.filter((u) => {
        const username = u.username ? u.username.toLowerCase() : "";
        const email = u.email ? u.email.toLowerCase() : "";
        const q = query.toLowerCase();
        return (username.includes(q) || email.includes(q)) && u._id !== user?._id;
      });
      
      // Combine group results with user results
      if (clientResults.length > 0 || groupResults.length > 0) {
        setSearchResults([...groupResults, ...clientResults]);
        return;
      }
    }

    // Fallback to API search with debounce and loading spinner
    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const { data } = await api.get(`/users?search=${query}`);
        const userResults = Array.isArray(data) ? data.filter(u => u._id !== user?._id) : [];
        setSearchResults([...groupResults, ...userResults]);
      } catch (error) {
        console.error("Search failed:", error.response?.data || error.message);
        setSearchResults(groupResults); // Show groups even if user search fails
        setSearchError(error.response?.data?.message || "Failed to search users. Please try again.");
      } finally {
        setIsSearching(false);
      }
    }, 300); // 300ms debounce
  };

  const accessChat = async (userId) => {
    try {
      const { data } = await api.post("/messages/chat", { userId });
      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      setSelectedChat(data);
      setSearchQuery("");
      setSearchResults([]);

      // Auto-save contact if not already in contacts
      const isContact = user.contacts?.some(c => (typeof c === 'string' ? c : c._id) === userId);
      if (!isContact) {
        await handleAddContact(null, userId, true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const createGroup = async () => {
    if (!groupName || selectedGroupUsers.length < 1) return alert("Need name and at least 1 user");
    try {
      const { data } = await api.post("/messages/group", {
        name: groupName,
        users: JSON.stringify(selectedGroupUsers.map((u) => u._id)),
      });
      setChats([data, ...chats]);
      setShowGroupModal(false);
      setSelectedGroupUsers([]);
      setGroupName("");
    } catch (error) {
      console.error("Failed to create group:", error);
      alert("Failed to create group. Please try again.");
    }
  };

  const getSender = (loggedUser, users) => {
    if (!users || !loggedUser) return { username: "Unknown User", avatar: "", email: "" };

    // For non-group chats, users array should have two users.
    if (users.length >= 2) {
      const user1 = users[0];
      const user2 = users[1];
      if (user1?._id === loggedUser._id) {
        return user2 || { username: "Deleted User", avatar: "", email: "" };
      }
      return user1 || { username: "Deleted User", avatar: "", email: "" };
    }
    // Fallback for unexpected data shape
    return { username: "Unknown User", avatar: "", email: "" };
  };

  const renderAvatar = (u) => {
    if (u.avatar) return <img src={u.avatar} className="avatar" alt={u.username} />;
    const initials = (u.username || "U").split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
    return <div className="avatar default-avatar">{initials}</div>;
  };

  const handleAddContact = async (e, userId, silent = false) => {
    if (e) e.stopPropagation();
    try {
      const { data } = await api.put("/users/addcontact", { userId });
      if (!silent) alert("User added to contacts!");
      setUser(prev => ({ ...prev, contacts: data })); // Update local user state immediately
    } catch (err) {
      console.error(err);
      if (!silent) alert("Failed to add contact");
    }
  };

  const handleMessageClick = (msg) => {
    setReplyingTo(msg);
  };

  const handleContextMenu = (e, msg) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      message: msg
    });
  };

  const handleForward = (msg) => {
    setMessageToForward(msg);
    setShowForwardModal(true);
    setContextMenu(null);
  };

  const confirmForward = async (chat) => {
    try {
      const res = await api.post(`/messages`, {
        content: messageToForward.content,
        chatId: chat._id,
        type: messageToForward.type,
        isForwarded: true
      });
      socket.emit("send-message", res.data);
      alert(`Forwarded to ${chat.isGroupChat ? chat.chatName : getSender(user, chat.users).username}`);
    } catch (err) {
      console.error("Forward failed", err);
    }
  };

  const handleDeleteForEveryone = async () => {
    if (!contextMenu?.message) return;
    try {
      const { data } = await api.delete(`/messages/${contextMenu.message._id}/delete-for-everyone`);
      setMessages(prev => prev.map(m => m._id === data._id ? data : m));
      socket.emit("message-deleted", data);
    } catch (err) {
      console.error(err);
      alert("Failed to delete message");
    }
  };

  const handleExitGroup = async () => {
    if (!selectedChat || !selectedChat.isGroupChat) return;
    if (window.confirm("Are you sure you want to leave this group?")) {
      try {
        // Assuming backend endpoint for removing user from group
        await api.put("/messages/groupremove", {
          chatId: selectedChat._id,
          userId: user._id,
        });
        setSelectedChat(null);
        handleRefresh();
    } catch (err) {
        console.error("Failed to exit group:", err);
        alert("Failed to exit group");
      }
    }
  };

  const handleDeleteGroup = async () => {
    if (!selectedChat || !selectedChat.isGroupChat) return;
    if (window.confirm("Are you sure you want to delete this group permanently? This action cannot be undone.")) {
      try {
        // Assuming you add this route to your backend router pointing to deleteGroup controller
        await api.delete(`/messages/group/${selectedChat._id}`); 
        setSelectedChat(null);
        alert("Group deleted successfully");
      } catch (err) {
        console.error("Failed to delete group:", err);
        alert(err.response?.data?.message || "Failed to delete group");
      }
    }
  };

  const handleRemoveUser = async (userId) => {
    if (!selectedChat || !selectedChat.isGroupChat) return;
    if (window.confirm("Remove this user from the group?")) {
      try {
        const { data } = await api.put("/messages/groupremove", {
          chatId: selectedChat._id,
          userId: userId,
        });
        setSelectedChat(data);
    } catch (err) {
        console.error("Failed to remove user:", err);
        alert("Failed to remove user");
      }
    }
  };

  const handleTransferAdmin = async (userId) => {
    if (!selectedChat || !selectedChat.isGroupChat) return;
    if (window.confirm("Make this user the group admin?")) {
      try {
        const { data } = await api.put("/messages/group/admin", {
          chatId: selectedChat._id,
          userId: userId,
        });
        setSelectedChat(data);
      } catch (err) {
        console.error(err);
        alert("Failed to transfer admin rights");
      }
    }
  };

  const handleRenameGroup = async () => {
    if (!newGroupName.trim()) return;
    try {
      const { data } = await api.put("/messages/grouprename", {
        chatId: selectedChat._id,
        chatName: newGroupName,
      });
      setSelectedChat(data);
      setChats(chats.map(c => c._id === data._id ? data : c));
      socket.emit("chat-group-update", data); // Notify others
      setIsRenaming(false);
    } catch (err) {
      console.error(err);
      alert("Failed to rename group");
    }
  };

  const handleSearchAddMember = async (query) => {
    setSearchAddMemberQuery(query);
    if (!query) {
      setAddMemberSearchResults([]);
      return;
    }
    try {
      const { data } = await api.get(`/users?search=${query}`);
      setAddMemberSearchResults(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to search users:", error);
    }
  };

  const handleAddMemberToGroup = async (userToAdd) => {
    if (selectedChat.users.find(u => u._id === userToAdd._id)) {
      alert("User already in group");
      return;
    }
    try {
      const { data } = await api.put("/messages/groupadd", {
        chatId: selectedChat._id,
        userId: userToAdd._id,
      });
      setSelectedChat(data);
      setSearchAddMemberQuery("");
      setAddMemberSearchResults([]);
      socket.emit("chat-group-update", data); // Notify others
    } catch (err) {
      console.error(err);
      alert("Failed to add user");
    }
  };

  const handleBlockUser = async () => {
    if (!selectedChat || selectedChat.isGroupChat) return;
    const userToBlock = getSender(user, selectedChat.users);
    if (window.confirm(`Block ${userToBlock.username}?`)) {
      try {
        await api.put("/users/block", { userId: userToBlock._id });
        alert("User blocked");
        setShowChatMenu(false);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleClearChat = async () => {
    if (!selectedChat) return;
    if (window.confirm("Clear this chat?")) {
      try {
        await api.delete(`/messages/${selectedChat._id}`);
        setMessages([]);
        setShowChatMenu(false);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleReportUser = async () => {
    if (!selectedChat) return;
    const targetName = selectedChat.isGroupChat ? selectedChat.chatName : getSender(user, selectedChat.users).username;
    if (window.confirm(`Are you sure you want to report ${targetName}?`)) {
      try {
        // Mock API call - in production connect to a real endpoint
        // await api.post("/users/report", { chatId: selectedChat._id });
        alert(`Report submitted for ${targetName}. We will investigate.`);
        setShowChatMenu(false);
      } catch (err) {
        console.error(err);
        alert("Failed to submit report.");
      }
    }
  };

  const handleExportChat = () => {
    if (!messages.length) return alert("No messages to export.");
    const chatText = messages.map(m => {
      const senderName = m.sender._id === user._id ? "Me" : m.sender.username;
      const time = new Date(m.createdAt).toLocaleString();
      return `[${time}] ${senderName}: ${m.content || m.message}`;
    }).join('\n');

    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat_export_${selectedChat.isGroupChat ? selectedChat.chatName : getSender(user, selectedChat.users).username}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setShowChatMenu(false);
  };

  const handleShowContactInfo = () => {
    setShowContactInfo(true);
    setShowChatMenu(false);
  };

  const handleToggleMute = async () => {
    if (!selectedChat) return;
    try {
      await api.put("/users/mute", { chatId: selectedChat._id });
      setIsMuted(!isMuted);
      // Local state only - don't mutate hook values
    } catch (err) {
      console.error(err);
    }
  };

  // --- Call Functions ---
  const callUser = () => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
      setStream(stream);
      if (myVideo.current) myVideo.current.srcObject = stream;

      // To enable calls, install simple-peer: npm install simple-peer
      // const peer = new Peer({ initiator: true, trickle: false, stream: stream });
      // peer.on("signal", (data) => {
      //   socket.emit("callUser", { userToCall: id, signalData: data, from: user._id });
      // });
      // peer.on("stream", (stream) => {
      //   if (userVideo.current) userVideo.current.srcObject = stream;
      // });

      // socket.on("callAccepted", (signal) => {
      //   setCallAccepted(true);
      //   peer.signal(signal);
      // });

      // connectionRef.current = peer;
    });
  };

  const answerCall = () => {
    setCallAccepted(true);
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
      setStream(stream);
      if (myVideo.current) myVideo.current.srcObject = stream;

      // To enable calls, install simple-peer: npm install simple-peer
      // const peer = new Peer({ initiator: false, trickle: false, stream: stream });
      // peer.on("signal", (data) => {
      //   socket.emit("answerCall", { signal: data, to: caller });
      // });
      // peer.on("stream", (stream) => {
      //   userVideo.current.srcObject = stream;
      // });

      // connectionRef.current = peer;
    });
  };

  const filteredMessages = messages.filter(msg => (msg.message || msg.content || "").toLowerCase().includes(messageSearchQuery.toLowerCase()));

  const filteredChats = chats.filter(chat => {
    if (filterType === "groups") return chat.isGroupChat;
    if (filterType === "users") return !chat.isGroupChat;
    if (filterType === "saved") {
      if (!chat) return false;
      if (chat.isGroupChat) return true; // Include groups in saved
      const otherUser = getSender(user, chat.users);
      return user?.contacts?.some(c => (typeof c === 'string' ? c : c._id) === otherUser._id);
    }
    return true;
  });

  return (
    <div className="app-container">
      {/* Chat List Sidebar */}
      <div className="chat-list" ref={sidebarRef} style={{ width: sidebarWidth, flex: "none" }}>
        <div className="sidebar-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }} onClick={() => navigate("/profile")}>
            {user && renderAvatar(user)}
            <span className="sidebar-title-text">Chat_Z</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button onClick={() => setShowGroupModal(!showGroupModal)} title="New Group" style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px" }}>👥</button>
            <button onClick={() => navigate("/settings")} title="Settings" style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px" }}>⚙️</button>
            <button onClick={handleRefresh} title="Refresh List" disabled={isRefreshing} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px", opacity: isRefreshing ? 0.5 : 1 }}>🔄</button>
            {user?.isAdmin && (
              <button onClick={() => navigate("/admin")} style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "18px" }} title="Admin Panel">🛡️</button>
            )}
          <button 
            onClick={handleLogout} 
            style={{ marginLeft: "auto", background: "transparent", border: "none", color: "#54656f", cursor: "pointer", fontSize: "18px" }}
            title="Logout"
          >
            ↪️
          </button>
          </div>
        </div>

        <div style={{ display: "flex", padding: "10px", gap: "10px", borderBottom: "1px solid #e9edef", overflowX: "auto" }}>
          <button onClick={() => setFilterType("all")} style={{ flex: 1, padding: "8px", borderRadius: "20px", border: "none", background: filterType === "all" ? "#00a884" : "#e9edef", color: filterType === "all" ? "white" : "black", cursor: "pointer", whiteSpace: "nowrap" }}>All</button>
          <button onClick={() => setFilterType("users")} style={{ flex: 1, padding: "8px", borderRadius: "20px", border: "none", background: filterType === "users" ? "#00a884" : "#e9edef", color: filterType === "users" ? "white" : "black", cursor: "pointer", whiteSpace: "nowrap" }}>Users</button>
          <button onClick={() => setFilterType("groups")} style={{ flex: 1, padding: "8px", borderRadius: "20px", border: "none", background: filterType === "groups" ? "#00a884" : "#e9edef", color: filterType === "groups" ? "white" : "black", cursor: "pointer", whiteSpace: "nowrap" }}>Groups</button>
          <button onClick={() => setFilterType("saved")} style={{ flex: 1, padding: "8px", borderRadius: "20px", border: "none", background: filterType === "saved" ? "#00a884" : "#e9edef", color: filterType === "saved" ? "white" : "black", cursor: "pointer", whiteSpace: "nowrap" }}>Saved</button>
          <button onClick={() => setFilterType("status")} style={{ flex: 1, padding: "8px", borderRadius: "20px", border: "none", background: filterType === "status" ? "#00a884" : "#e9edef", color: filterType === "status" ? "white" : "black", cursor: "pointer", whiteSpace: "nowrap" }}>Status</button>
        </div>
        
        {showGroupModal && (
          <div style={{ padding: "10px", background: "#f0f2f5" }}>
            <input className="chat-input" placeholder="Group Name" value={groupName} onChange={(e) => setGroupName(e.target.value)} style={{width: "100%", marginBottom: "5px"}} />
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
              <button 
                onClick={() => {
                  const candidates = allUsers.filter(u => u._id !== user._id);
                  if (selectedGroupUsers.length === candidates.length) {
                    setSelectedGroupUsers([]);
                  } else {
                    setSelectedGroupUsers(candidates);
                  }
                }}
                style={{ fontSize: "12px", padding: "5px 10px", background: "#e9edef", color: "black", border: "none", borderRadius: "4px", cursor: "pointer" }}
              >
                {selectedGroupUsers.length === allUsers.filter(u => u._id !== user._id).length ? "Deselect All" : "Select All"}
              </button>
              <span style={{ fontSize: "12px", alignSelf: "center", color: "var(--text-secondary)" }}>{selectedGroupUsers.length} selected</span>
            </div>
            <div className="group-chips">
              {selectedGroupUsers.map(u => (
                <div key={u._id} className="chip">
                  {u.username}
                  <span style={{cursor: "pointer", fontWeight: "bold"}} onClick={() => setSelectedGroupUsers(selectedGroupUsers.filter(sel => sel._id !== u._id))}>×</span>
                </div>
              ))}
            </div>
            <button onClick={createGroup} style={{width: "100%"}}>Create Group</button>
          </div>
        )}

        {filterType !== "status" && <div className="search-bar-container" style={{ padding: "10px", borderBottom: "1px solid #e9edef" }}>
          <input 
            type="text" 
            placeholder="Search or start new chat" 
            value={searchQuery}
            onChange={handleSearch}
            className="chat-input"
            style={{ margin: 0, width: "100%", backgroundColor: usersLoading ? '#f0f2f5' : 'var(--input-bg)' }}
            disabled={usersLoading}
          />
        </div>}

        <div className="user-list">
          {/* Status List */}
          {filterType === "status" ? (
            <div style={{padding: '10px'}}>
              <div className="user-item" onClick={() => setShowStatusUpload(true)} style={{cursor: 'pointer', marginBottom: '10px'}}>
                <div className="avatar default-avatar" style={{background: '#00a884'}}>+</div>
                <div className="user-info">
                  <div className="user-name">My Status</div>
                  <div className="user-status">Click to add status update</div>
                </div>
              </div>
              <div style={{padding: '10px 0', color: 'var(--text-secondary)', fontWeight: 'bold', fontSize: '13px'}}>RECENT UPDATES</div>
              {statuses.map((group, idx) => (
                <div key={idx} className="user-item" onClick={() => setViewingStatusGroup(group)}>
                  <div className={`avatar ${!group.user.avatar ? "default-avatar" : ""}`} style={{border: '2px solid #00a884', padding: '2px'}}>
                    {group.user.avatar ? <img src={group.user.avatar} alt="" style={{borderRadius: '50%', width: '100%', height: '100%'}} /> : 
                    (group.user.username || "U").substring(0, 2).toUpperCase()}
                  </div>
                  <div className="user-info">
                    <div className="user-name">{group.user.username}</div>
                    <div className="user-status">
                      {new Date(group.statuses[0].createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </div>
                </div>
              ))}
              {statuses.length === 0 && <div style={{textAlign: 'center', padding: '20px', color: 'var(--text-secondary)'}}>No recent updates</div>}
            </div>
          ) : (
          <>
            {/* Search Results */}
            {searchQuery.length > 0 ? (
            isSearching ? (
              <div style={{ padding: "20px", textAlign: "center", color: "var(--text-secondary)", display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div className="loading-spinner" style={{ width: '24px', height: '24px' }}></div>
                <span style={{ marginLeft: '10px' }}>Searching...</span>
              </div>
            ) : (
              searchResults.length > 0 ? (
                <>
                  {searchResults.slice(0, searchResultLimit).map((u) => (
                    <div
                      key={u._id}
                      className="user-item"
                      style={showGroupModal && selectedGroupUsers.find(sel => sel._id === u._id) ? { backgroundColor: "#d9fdd3" } : {}}
                      onClick={() => {
                        if (u.isGroupChat) {
                          setSelectedChat(u);
                          setSearchQuery("");
                          setSearchResults([]);
                        } else if (showGroupModal) {
                          if (selectedGroupUsers.find(sel => sel._id === u._id)) {
                            setSelectedGroupUsers(selectedGroupUsers.filter(sel => sel._id !== u._id));
                          } else {
                            setSelectedGroupUsers([...selectedGroupUsers, u]);
                          }
                        } else {
                          accessChat(u._id);
                        }
                      }}
                    >
                      {u.isGroupChat ? <div className="avatar default-avatar">G</div> : renderAvatar(u)}
                      <div className="user-info">
                        <div className="user-name">
                          {u.isGroupChat ? u.chatName : u.username}
                          {!u.isGroupChat && u.isAdmin && <span style={{ fontSize: "10px", backgroundColor: "#00a884", color: "white", padding: "2px 5px", borderRadius: "4px", marginLeft: "5px" }}>Admin</span>}
                        </div>
                        <div className="user-status">{u.isGroupChat ? `${u.users.length} members` : (u.about || "Available")}</div>
                        {!u.isGroupChat && !showGroupModal && <button onClick={(e) => handleAddContact(e, u._id)} style={{ marginLeft: "auto", background: "#00a884", color: "white", border: "none", padding: "5px 10px", borderRadius: "3px", cursor: "pointer", fontSize: "12px" }}>Add</button>}
                      </div>
                    </div>
                  ))}
                  {searchResults.length > searchResultLimit && (
                    <button 
                      onClick={() => setSearchResultLimit(prev => prev + 10)}
                      style={{ width: "100%", padding: "10px", background: "transparent", border: "none", color: "#00a884", cursor: "pointer", fontWeight: "bold" }}
                    >
                      Load More
                    </button>
                  )}
                </>
              ) : (
                <div style={{ padding: "20px", textAlign: "center", color: searchError ? "red" : "var(--text-secondary)" }}>
                  {searchError || `No users found matching "${searchQuery}"`}
                </div>
              )
            )
          ) : (
            <>
              {usersLoading && <div style={{ padding: "20px", textAlign: "center", color: "var(--text-secondary)" }}>Loading chats...</div>}
              {usersError && (
                <div style={{ padding: "20px", textAlign: "center", color: "red" }}>
                  <p>{usersError}</p>
                  <button onClick={handleRefresh} style={{ marginTop: "10px", padding: "8px 16px", background: "var(--primary-green)", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>Retry Connection</button>
                </div>
              )}
              {!usersLoading && !usersError && (
                filteredChats.map((chat) => (
                  <div
                    key={chat._id}
                    className={`user-item ${selectedChat?._id === chat._id ? "active" : ""}`}
                    onClick={() => setSelectedChat(chat)}
                  >
                    {chat.isGroupChat ? <div className="avatar default-avatar">G</div> : renderAvatar(getSender(user, chat.users))}
                    <div className="user-info">
                      <div className="user-name">
                        {chat.isGroupChat ? chat.chatName : (getSender(user, chat.users)?.username || "Unknown User")}
                        {!chat.isGroupChat && onlineUsers.includes(getSender(user, chat.users)?._id) && (
                          <span title="Online" style={{
                            height: '10px',
                            width: '10px',
                            backgroundColor: '#25D366',
                            borderRadius: '50%',
                            display: 'inline-block',
                            marginLeft: '8px',
                            border: '1px solid white'
                          }}></span>
                        )}
                      </div>
                      <div className="user-status">
                        {chat.latestMessage ? (
                          <span>{(chat.latestMessage.content || chat.latestMessage.message || "").substring(0, 20)}...</span>
                        ) : "Start chatting"}
                      </div>
                    </div>
                  </div>
                )))}
            </>
            )}
          </>)}
        </div>
      </div>

      {/* Chat Resizer - Drag to resize chat list */}
      <div className="chat-resizer" onMouseDown={startResizing}></div>

      {/* Chat Window */}
      {selectedChat ? (
        <>
        <div className="chat-window">
          <div className="chat-header">
            {showMessageSearch ? (
              <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
                <input autoFocus className="chat-input" placeholder="Search messages..." value={messageSearchQuery} onChange={(e) => setMessageSearchQuery(e.target.value)} style={{ margin: "0 10px" }} />
                <button onClick={() => { setShowMessageSearch(false); setMessageSearchQuery(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}>✕</button>
              </div>
            ) : (
              <>
            {selectedChat.isGroupChat ? <div className="avatar default-avatar">G</div> : renderAvatar(getSender(user, selectedChat.users))}
            <div className="user-info">
              <div className="user-name">{selectedChat.isGroupChat ? selectedChat.chatName : getSender(user, selectedChat.users).username}</div>
              {isTyping ? (
                <div className="user-status" style={{color: "#00a884", fontWeight: "bold"}}>{selectedChat.isGroupChat ? `${typingUsername} is typing...` : "typing..."}</div>
              ) : (
                <div className="user-status">
                  {!selectedChat.isGroupChat && getSender(user, selectedChat.users).lastSeen ? 
                    `Last seen ${new Date(getSender(user, selectedChat.users).lastSeen).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : 
                    "Available"}
                </div>
              )}
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: "15px", position: "relative" }}>
               <button title="Video Call" onClick={() => callUser(getSender(user, selectedChat.users)._id)} style={{background:"none", border:"none", cursor:"pointer"}}>📞</button>
               <button title="Search" onClick={() => setShowMessageSearch(true)} style={{background:"none", border:"none", cursor:"pointer"}}>🔍</button>
               <button title="More options" onClick={() => setShowChatMenu(!showChatMenu)} style={{background:"none", border:"none", cursor:"pointer", color: "var(--text-secondary)"}}>⋮</button>
               {showChatMenu && (
                 <div className="menu-dropdown">
                   <div className="menu-item" onClick={handleShowContactInfo}>Contact Info</div>
                   <div className="menu-item" onClick={handleClearChat}>Clear Chat</div>
                   <div className="menu-item" onClick={handleExportChat}>Export Chat</div>
                   <div className="menu-item" onClick={handleReportUser} style={{color: "orange"}}>Report</div>
                   {!selectedChat.isGroupChat && <div className="menu-item" onClick={handleBlockUser} style={{color: "#ff4d4d"}}>Block</div>}
                 </div>
               )}
            </div>
              </>
            )}
          </div>
          <div className="chat-messages">
            {filteredMessages.map((msg, idx) => (
              <div 
                key={msg._id || idx} 
                className={`message-bubble ${msg.sender._id === user._id ? "me" : "other"}`}
                onClick={() => handleMessageClick(msg)}
                onContextMenu={(e) => handleContextMenu(e, msg)}
                style={{ cursor: "pointer" }}
              >
                {msg.isForwarded && (
                  <div style={{ fontSize: '11px', color: '#667781', fontStyle: 'italic', marginBottom: '2px', display: 'flex', alignItems: 'center' }}>
                    <span style={{ marginRight: '4px' }}>↪</span> Forwarded
                  </div>
                )}

                {msg.replyTo && (
                  <div className="reply-quote" style={{ background: "rgba(0,0,0,0.05)", padding: "5px", borderRadius: "4px", marginBottom: "5px", borderLeft: "4px solid #00a884", fontSize: "12px" }}>
                    <div style={{ fontWeight: "bold", color: "#00a884" }}>{msg.replyTo.sender?.username || "User"}</div>
                    <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {msg.replyTo.type === 'image' ? '📷 Photo' : msg.replyTo.type === 'audio' ? '🎤 Voice Message' : msg.replyTo.content}
                    </div>
                  </div>
                )}
                
                {msg.isDeleted ? <span style={{fontStyle: "italic", color: "#777"}}>🚫 This message was deleted</span> : 
                 msg.type === 'image' ? (
                   <img src={`http://localhost:5000/${msg.content}`} alt="shared" style={{maxWidth: "200px", borderRadius: "8px"}} />
                 ) : msg.type === 'audio' ? (
                   <audio controls src={`http://localhost:5000/${msg.content}`} style={{ maxWidth: "250px" }} />
                 ) : (
                   msg.message || msg.content
                 )}
                <div className="message-meta">
                  <span className="message-time">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <span className="msg-tick" style={{ color: msg.status === "seen" ? "#53bdeb" : "#999" }}>{msg.status === "seen" ? "✓✓" : "✓✓"}</span>
                </div>
              </div>
            ))}
            <div ref={scrollRef} />
          </div>
          <div className="chat-input-area">
            {replyingTo && (
              <div className="reply-preview" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#e9edef", padding: "10px", borderRadius: "8px", borderLeft: "5px solid #00a884", position: "absolute", bottom: "60px", left: "16px", right: "16px", zIndex: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: "bold", color: "#00a884", fontSize: "13px" }}>Replying to {replyingTo.sender.username}</div>
                  <div style={{ fontSize: "12px", color: "#54656f", marginTop: "2px" }}>
                    {replyingTo.type === 'image' ? '📷 Photo' : replyingTo.type === 'audio' ? '🎤 Voice Message' : replyingTo.content}
                  </div>
                </div>
                <button onClick={() => setReplyingTo(null)} style={{ border: "none", background: "none", cursor: "pointer", fontWeight: "bold", color: "#00a884", marginLeft: "10px", flexShrink: 0 }}>✕</button>
              </div>
            )}
            <button onClick={() => fileInputRef.current.click()} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px" }} title="Attach File">📎</button>
            <input type="file" ref={fileInputRef} style={{ display: "none" }} onChange={handleFileUpload} />
            
            <form onSubmit={handleSendMessage} style={{ display: "flex", flex: 1, padding: 0, background: "transparent", boxShadow: "none", gap: "8px" }}>
              <input type="text" ref={textInputRef} className="chat-input" placeholder="Type a message" value={newMessage} onChange={handleTyping} style={{ margin: 0 }} />
              {newMessage.trim() ? (
                <button type="submit" className="send-btn" style={{ marginLeft: "10px" }}>➤</button>
              ) : (
                <button type="button" onClick={isRecording ? stopRecording : startRecording} className="send-btn" style={{ marginLeft: "10px", background: isRecording ? "red" : "var(--primary-green)" }}>
                  {isRecording ? "⏹" : "🎤"}
                </button>
              )}
            </form>
          </div>
          {contextMenu && (
            <div className="context-menu" style={{ top: contextMenu.y, left: contextMenu.x, position: "fixed", zIndex: 1000, background: "white", border: "1px solid #ccc", borderRadius: "5px", padding: "5px", boxShadow: "0 2px 5px rgba(0,0,0,0.2)" }}>
              {contextMenu.message.sender._id === user._id && !contextMenu.message.isDeleted && <div onClick={handleDeleteForEveryone} style={{ padding: "8px 12px", cursor: "pointer", color: "#ff4d4d" }}>Delete for everyone</div>}
              <div onClick={() => handleForward(contextMenu.message)} style={{ padding: "8px 12px", cursor: "pointer" }}>Forward</div>
              <div onClick={() => setContextMenu(null)} style={{ padding: "8px 12px", cursor: "pointer" }}>Cancel</div>
            </div>
          )}
        </div>
        {showContactInfo && (
          <div className="contact-info-panel">
            <div className="contact-info-header">
              <button onClick={() => setShowContactInfo(false)} style={{background:'none', border:'none', cursor:'pointer', fontSize:'16px', marginRight:'15px', color: 'var(--text-primary)'}}>✕</button>
              <h3>Contact Info</h3>
            </div>
            <div className="contact-info-content">
              {!selectedChat.isGroupChat ? (
                <div className="contact-info-section">
                  {renderAvatar({...getSender(user, selectedChat.users), avatar: getSender(user, selectedChat.users).avatar?.replace('49', '200')})}
                  <h2 style={{marginTop: '15px', color: 'var(--text-primary)'}}>{getSender(user, selectedChat.users).username}</h2>
                  <p style={{color: 'var(--text-secondary)', marginTop: '5px'}}>{getSender(user, selectedChat.users).email}</p>
                  <p style={{color: 'var(--text-primary)', marginTop: '20px', fontStyle: 'italic'}}>"{getSender(user, selectedChat.users).about || "Available"}"</p>
                </div>
              ) : (
                <div className="contact-info-section">
                  <div className="avatar default-avatar" style={{width: '200px', height: '200px', fontSize: '60px', margin: '0 auto 20px'}}>G</div>
                  {isRenaming ? (
                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', marginBottom: '10px'}}>
                      <input 
                        value={newGroupName} 
                        onChange={(e) => setNewGroupName(e.target.value)}
                        className="chat-input"
                        style={{width: '150px', margin: 0}}
                      />
                      <button onClick={handleRenameGroup} style={{background: '#00a884', color: 'white', border: 'none', borderRadius: '4px', padding: '5px 10px', cursor: 'pointer'}}>Save</button>
                      <button onClick={() => setIsRenaming(false)} style={{background: '#e9edef', color: 'black', border: 'none', borderRadius: '4px', padding: '5px 10px', cursor: 'pointer'}}>Cancel</button>
                    </div>
                  ) : (
                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'}}>
                      <h2 style={{color: 'var(--text-primary)'}}>{selectedChat.chatName}</h2>
                      {selectedChat.groupAdmin && (selectedChat.groupAdmin._id === user._id || selectedChat.groupAdmin === user._id) && (
                        <button onClick={() => { setIsRenaming(true); setNewGroupName(selectedChat.chatName); }} style={{background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px'}}>✏️</button>
                      )}
                    </div>
                  )}
                  <p style={{color: 'var(--text-secondary)', marginTop: '5px'}}>{selectedChat.users.length} participants</p>
                  
                  <div style={{marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '10px'}}>
                    <h4 style={{color: 'var(--text-primary)', marginBottom: '10px'}}>Participants</h4>
                    <div style={{maxHeight: '300px', overflowY: 'auto'}}>
                    {(() => {
                      const isAdmin = selectedChat.groupAdmin && (selectedChat.groupAdmin._id === user._id || selectedChat.groupAdmin === user._id);
                      return selectedChat.users.map(u => (
                        <div key={u._id} style={{display: 'flex', alignItems: 'center', padding: '8px 0'}}>
                          {renderAvatar({...u, avatar: u.avatar || ""})} 
                          <div style={{marginLeft: '10px', flex: 1}}>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                              <span style={{color: 'var(--text-primary)', fontWeight: '500'}}>{u.username}</span>
                              {selectedChat.groupAdmin && (selectedChat.groupAdmin._id === u._id || selectedChat.groupAdmin === u._id) && (
                                <span style={{fontSize: '10px', backgroundColor: '#00a884', color: 'white', padding: '2px 6px', borderRadius: '4px'}}>Admin</span>
                              )}
                            </div>
                            <div style={{fontSize: '12px', color: 'var(--text-secondary)'}}>{u.email}</div>
                          </div>
                          {isAdmin && u._id !== user._id && (
                            <div style={{display: 'flex', gap: '5px', marginLeft: '10px'}}>
                              <button 
                                onClick={() => handleTransferAdmin(u._id)}
                                style={{background: '#00a884', color: 'white', border: 'none', borderRadius: '4px', padding: '2px 6px', cursor: 'pointer', fontSize: '10px'}}
                              >
                                Make Admin
                              </button>
                              <button 
                                onClick={() => handleRemoveUser(u._id)}
                                style={{background: '#ff4d4d', color: 'white', border: 'none', borderRadius: '4px', padding: '2px 6px', cursor: 'pointer', fontSize: '10px'}}
                              >
                                Remove
                              </button>
                            </div>
                          )}
                        </div>
                      ));
                    })()}
                    </div>
                    {/* Add Member Section for Admins */}
                    {selectedChat.groupAdmin && (selectedChat.groupAdmin._id === user._id || selectedChat.groupAdmin === user._id) && (
                      <div style={{marginTop: '15px', borderTop: '1px solid var(--border-color)', paddingTop: '10px'}}>
                        <h4 style={{color: 'var(--text-primary)', marginBottom: '10px'}}>Add Member</h4>
                        <div style={{display: 'flex', gap: '5px', marginBottom: '10px'}}>
                          <input 
                            placeholder="Search user to add" 
                            value={searchAddMemberQuery}
                            onChange={(e) => handleSearchAddMember(e.target.value)}
                            className="chat-input"
                            style={{width: '100%', margin: 0}}
                          />
                        </div>
                        {addMemberSearchResults.length > 0 && (
                          <div style={{maxHeight: '150px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '4px'}}>
                            {addMemberSearchResults.slice(0, 5).map(u => (
                              <div key={u._id} 
                                onClick={() => handleAddMemberToGroup(u)}
                                style={{padding: '8px', cursor: 'pointer', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center'}}
                              >
                                {renderAvatar(u)}
                                <div style={{marginLeft: '10px'}}>
                                  <div style={{fontWeight: '500'}}>{u.username}</div>
                                  <div style={{fontSize: '10px', color: 'gray'}}>{u.email}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Admin Actions: Delete vs Exit */}
                    {selectedChat.groupAdmin && (selectedChat.groupAdmin._id === user._id || selectedChat.groupAdmin === user._id) ? (
                      <div style={{marginTop: '15px', textAlign: 'center'}}>
                        <button onClick={handleDeleteGroup} style={{background: '#ff4d4d', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer'}}>Delete Group</button>
                      </div>
                    ) : (
                      <div style={{marginTop: '15px', textAlign: 'center'}}>
                        <button onClick={handleExitGroup} style={{background: '#ff4d4d', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer'}}>Exit Group</button>
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div className="contact-info-section" style={{ borderTop: "1px solid var(--border-color)", marginTop: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--text-primary)" }}>Mute Notifications</span>
                <label className="toggle-switch">
                  <input type="checkbox" checked={isMuted} onChange={handleToggleMute} />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          </div>
        )}
        {/* --- Call UI --- */}
        <div>
          {stream && <video playsInline muted ref={myVideo} autoPlay style={{ width: "300px" }} />}
        </div>
        <div>
          {callAccepted && !callEnded ?
            <video playsInline ref={userVideo} autoPlay style={{ width: "300px" }} />
            : null}
        </div>
        <div>
          {receivingCall && !callAccepted ? (
            <div>
              <h1>{caller} is calling...</h1>
              <button onClick={answerCall}>Answer</button>
            </div>
          ) : null}
        </div>
        </>
      ) : (
        <div className="chat-window placeholder-window">
          <div className="placeholder-content">
            <img src="/WhatsApp Image 2026-01-26 at 9.13.02 PM.jpeg" alt="Chat Connection" className="placeholder-image" />
            <h1 className="placeholder-title">Chat_Z Web</h1>
            <p className="placeholder-subtitle">Send and receive messages without keeping your phone online.<br/>Use Chat_Z on up to 4 linked devices and 1 phone at the same time.</p>
            <div className="placeholder-footer">
              <p>🔒 End-to-end encrypted</p>
            </div>
          </div>
        </div>
      )}

      {/* Forward Message Modal */}
      {showForwardModal && (
        <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000}}>
          <div style={{background: 'white', padding: '20px', borderRadius: '10px', width: '400px', maxHeight: '80vh', display: 'flex', flexDirection: 'column'}}>
            <h3>Forward Message</h3>
            <div className="user-list" style={{ overflowY: "auto", flex: 1, margin: '10px 0' }}>
              {chats.map(chat => (
                <div key={chat._id} className="user-item" onClick={() => { confirmForward(chat); setShowForwardModal(false); }} style={{cursor: 'pointer'}}>
                  {chat.isGroupChat ? <div className="avatar default-avatar">G</div> : renderAvatar(getSender(user, chat.users))}
                  <div className="user-info">
                    <div className="user-name">{chat.isGroupChat ? chat.chatName : getSender(user, chat.users).username}</div>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setShowForwardModal(false)} style={{ padding: "10px", background: "#e9edef", border: "none", borderRadius: "5px", cursor: "pointer" }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Status Upload Modal */}
      {showStatusUpload && (
        <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: statusColor, zIndex: 2000, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
          <textarea autoFocus value={statusContent} onChange={(e) => setStatusContent(e.target.value)} placeholder="Type a status..." style={{background: 'transparent', border: 'none', color: 'white', fontSize: '30px', textAlign: 'center', width: '80%', resize: 'none', outline: 'none'}} />
          <div style={{marginTop: '20px', display: 'flex', gap: '10px', alignItems: 'center'}}>
            <input type="color" value={statusColor} onChange={(e) => setStatusColor(e.target.value)} title="Change Background Color" />
            <button onClick={handlePostStatus} style={{background: 'white', color: statusColor, border: 'none', padding: '10px 20px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold'}}>Send</button>
            <button onClick={() => setShowStatusUpload(false)} style={{background: 'rgba(0,0,0,0.3)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '20px', cursor: 'pointer'}}>Cancel</button>
          </div>
        </div>
      )}

      {/* View Status Modal */}
      {viewingStatusGroup && (
        <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'black', zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
           <button onClick={() => setViewingStatusGroup(null)} style={{position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'white', fontSize: '30px', cursor: 'pointer'}}>✕</button>
           <div style={{backgroundColor: viewingStatusGroup.statuses[0].backgroundColor || '#333', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}>
              <h1 style={{color: 'white', textAlign: 'center', padding: '20px', fontSize: '40px'}}>{viewingStatusGroup.statuses[0].content}</h1>
              <div style={{color: 'rgba(255,255,255,0.7)', marginTop: '20px'}}>{new Date(viewingStatusGroup.statuses[0].createdAt).toLocaleString()}</div>
           </div>
        </div>
      )}
    </div>
  );
}
