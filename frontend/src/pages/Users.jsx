import { useState, useEffect, useRef } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket/socket";
import { initializeChatResizer } from "../utils/chatResizer";

export default function Users() {
  const { user, logout } = useAuth();
  const [chats, setChats] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [allUsers, setAllUsers] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedGroupUsers, setSelectedGroupUsers] = useState([]);
  const navigate = useNavigate();
  const scrollRef = useRef();
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [typingUsername, setTypingUsername] = useState("");
  const [showChatMenu, setShowChatMenu] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [messageSearchQuery, setMessageSearchQuery] = useState("");
  const [showMessageSearch, setShowMessageSearch] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [replyMessage, setReplyMessage] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [onlineUsers, setOnlineUsers] = useState([]);
  const fileInputRef = useRef();
  const textInputRef = useRef();
  const typingTimeoutRef = useRef(null);
  const [filterType, setFilterType] = useState("all"); // 'all', 'users', 'groups'
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [messageToForward, setMessageToForward] = useState(null);
  const [starredMessages, setStarredMessages] = useState([]);

  // Initialize chat resizer
  useEffect(() => {
    const cleanup = initializeChatResizer();
    return cleanup;
  }, []);

  // Socket connection setup
  useEffect(() => {
    if (!user) return;

    socket.emit("setup", user);
    socket.on("connected", () => {
      console.log("Socket connected");
      setSocketConnected(true);
    });

    socket.on("online-users", (users) => {
      console.log("Online users:", users);
      setOnlineUsers(users);
    });

    return () => {
      socket.off("connected");
      socket.off("online-users");
    };
  }, [user]);

  useEffect(() => {
    if (user?.starredMessages) {
      setStarredMessages(user.starredMessages);
    }
  }, [user]);

  // Real-time message and typing handlers
  useEffect(() => {
    if (!socket) return;

    const messageHandler = (newMessageReceived) => {
      console.log("Message received:", newMessageReceived);
      if (!selectedChat || selectedChat._id !== newMessageReceived.chatId._id) {
        // Update chat list
        setChats(prev => {
          const updated = prev.map(chat => 
            chat._id === newMessageReceived.chatId._id 
              ? { ...chat, latestMessage: newMessageReceived }
              : chat
          );
          return updated;
        });
      } else {
        setMessages((prevMessages) => {
          const exists = prevMessages.some(m => m._id === newMessageReceived._id);
          return exists ? prevMessages : [...prevMessages, newMessageReceived];
        });
      }
    };

    const typingHandler = ({ username, chatId }) => {
      if (selectedChat && selectedChat._id === chatId) {
        setTypingUsername(username);
        setIsTyping(true);
      }
    };

    const stopTypingHandler = ({ chatId } = {}) => {
      if (!chatId || !selectedChat) return;
      if (selectedChat._id === chatId) {
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

    socket.on("receive-message", messageHandler);
    socket.on("user-typing", typingHandler);
    socket.on("stop-typing", stopTypingHandler);
    socket.on("user-online", userOnlineHandler);
    socket.on("user-offline", userOfflineHandler);

    return () => {
      socket.off("receive-message", messageHandler);
      socket.off("user-typing", typingHandler);
      socket.off("stop-typing", stopTypingHandler);
      socket.off("user-online", userOnlineHandler);
      socket.off("user-offline", userOfflineHandler);
    };
  }, [selectedChat]);

  // Fetch chats on component mount
  useEffect(() => {
    const fetchChats = async () => {
      if (!user) return;
      try {
        const res = await api.get("/messages/chat");
        console.log("Chats loaded:", res.data);
        setChats(res.data || []);
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
      try {
        const res = await api.get("/users");
        setAllUsers(res.data || []);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    };
    fetchUsers();
  }, [user]);

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

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;
    try {
      const res = await api.post(`/messages`, {
        content: newMessage,
        chatId: selectedChat._id,
        replyTo: replyMessage ? replyMessage._id : null
      });
      socket.emit("send-message", res.data);
      setMessages([...messages, res.data]);
      setNewMessage("");
      setReplyMessage(null);
      socket.emit("stop-typing", selectedChat._id);
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected || !selectedChat) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", { chatId: selectedChat._id, username: user.username });
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

  const handleSearch = async (e) => {
    setSearchQuery(e.target.value);
    if (!e.target.value) {
      setSearchResults([]);
      return;
    }
    try {
      const { data } = await api.get(`/users?search=${e.target.value}`);
      setSearchResults(data);
    } catch (error) {
      console.error(error);
    }
  };

  const accessChat = async (userId) => {
    try {
      const { data } = await api.post("/messages/chat", { userId });
      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      setSelectedChat(data);
      setSearchQuery("");
      setSearchResults([]);
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
      console.error(error);
    }
  };

  const getSender = (loggedUser, users) => {
    return users[0]._id === loggedUser._id ? users[1] : users[0];
  };

  const renderAvatar = (u) => {
    if (u.avatar) return <img src={u.avatar} className="avatar" alt={u.username} />;
    const initials = (u.username || "U").split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
    return <div className="avatar default-avatar">{initials}</div>;
  };

  const handleAddContact = async (e, userId) => {
    e.stopPropagation();
    try {
      await api.put("/users/addcontact", { userId });
      alert("User added to contacts!");
    } catch (err) {
      console.error(err);
      alert("Failed to add contact");
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

  const handleReply = (msg) => {
    setReplyMessage(msg);
    textInputRef.current?.focus();
  };

  const handleStarMessage = async (msgId) => {
    try {
      const { data } = await api.put("/users/star", { messageId: msgId });
      setStarredMessages(data);
    } catch (err) {
      console.error("Failed to star message", err);
    }
  };

  const handleForwardMessage = (msg) => {
    setMessageToForward(msg);
    setShowForwardModal(true);
  };

  const confirmForward = async (targetChat) => {
    if (!messageToForward) return;
    // Send message to targetChat
    await api.post("/messages", { content: messageToForward.content || messageToForward.message, chatId: targetChat._id });
    setShowForwardModal(false);
    setMessageToForward(null);
    alert("Message forwarded!");
  };

  const filteredMessages = messages.filter(msg => (msg.message || msg.content || "").toLowerCase().includes(messageSearchQuery.toLowerCase()));

  const filteredChats = chats.filter(chat => {
    if (filterType === "groups") return chat.isGroupChat;
    if (filterType === "users") return !chat.isGroupChat;
    return true;
  });

  return (
    <div className="chat-layout">
      {/* Chat List Sidebar */}
      <div className="chat-list">
        <div className="sidebar-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }} onClick={() => navigate("/profile")}>
            {user && renderAvatar(user)}
            <span className="user-name" style={{ fontWeight: "bold", fontSize: "18px" }}>Chat_Z</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button onClick={() => setShowGroupModal(!showGroupModal)} title="New Group" style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px" }}>👥</button>
            <button onClick={() => navigate("/settings")} title="Settings" style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px" }}>⚙️</button>
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

        <div style={{ display: "flex", padding: "10px", gap: "10px", borderBottom: "1px solid #e9edef" }}>
          <button onClick={() => setFilterType("all")} style={{ flex: 1, padding: "8px", borderRadius: "20px", border: "none", background: filterType === "all" ? "#00a884" : "#e9edef", color: filterType === "all" ? "white" : "black", cursor: "pointer" }}>All</button>
          <button onClick={() => setFilterType("users")} style={{ flex: 1, padding: "8px", borderRadius: "20px", border: "none", background: filterType === "users" ? "#00a884" : "#e9edef", color: filterType === "users" ? "white" : "black", cursor: "pointer" }}>Users</button>
          <button onClick={() => setFilterType("groups")} style={{ flex: 1, padding: "8px", borderRadius: "20px", border: "none", background: filterType === "groups" ? "#00a884" : "#e9edef", color: filterType === "groups" ? "white" : "black", cursor: "pointer" }}>Groups</button>
        </div>
        
        {showGroupModal && (
          <div style={{ padding: "10px", background: "#f0f2f5" }}>
            <input className="chat-input" placeholder="Group Name" value={groupName} onChange={(e) => setGroupName(e.target.value)} style={{width: "100%", marginBottom: "5px"}} />
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

        {showForwardModal && (
          <div style={{ padding: "10px", background: "#f0f2f5", position: "absolute", top: "60px", left: 0, width: "100%", height: "100%", zIndex: 20 }}>
            <h3>Forward to...</h3>
            <button onClick={() => setShowForwardModal(false)}>Cancel</button>
            <div style={{ overflowY: "auto", height: "calc(100% - 50px)" }}>
              {chats.map(chat => (
                <div key={chat._id} className="user-item" onClick={() => confirmForward(chat)}>{chat.isGroupChat ? chat.chatName : getSender(user, chat.users).username}</div>
              ))}
            </div>
          </div>
        )}

        <div className="search-bar-container" style={{ padding: "10px", borderBottom: "1px solid #e9edef" }}>
          <input 
            type="text" 
            placeholder="Search or start new chat" 
            value={searchQuery}
            onChange={handleSearch}
            className="chat-input"
            style={{ margin: 0, width: "100%" }}
          />
        </div>
        <div className="user-list">
          {/* Search Results */}
          {searchQuery.length > 0 ? searchResults.map((u) => (
            <div
              key={u._id}
              className="user-item"
              style={showGroupModal && selectedGroupUsers.find(sel => sel._id === u._id) ? { backgroundColor: "#d9fdd3" } : {}}
              onClick={() => {
                if (showGroupModal) {
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
              {renderAvatar(u)}
              <div className="user-info">
                <div className="user-name">
                  {u.username}
                  {u.isAdmin && <span style={{ fontSize: "10px", backgroundColor: "#00a884", color: "white", padding: "2px 5px", borderRadius: "4px", marginLeft: "5px" }}>Admin</span>}
                </div>
                <div className="user-status">{u.about || "Available"}</div>
                {!showGroupModal && <button onClick={(e) => handleAddContact(e, u._id)} style={{ marginLeft: "auto", background: "#00a884", color: "white", border: "none", padding: "5px 10px", borderRadius: "3px", cursor: "pointer", fontSize: "12px" }}>Add</button>}
              </div>
            </div>
          )) : (
            /* Chat List */
            filteredChats.map((chat) => (
              <div
                key={chat._id}
                className={`user-item ${selectedChat?._id === chat._id ? "active" : ""}`}
                onClick={() => setSelectedChat(chat)}
              >
                {chat.isGroupChat ? <div className="avatar default-avatar">G</div> : renderAvatar(getSender(user, chat.users))}
                <div className="user-info">
                  <div className="user-name">
                    {chat.isGroupChat ? chat.chatName : getSender(user, chat.users).username}
                  </div>
                  <div className="user-status">
                    {chat.latestMessage ? (
                      <span>{chat.latestMessage.content.substring(0, 20)}...</span>
                    ) : "Start chatting"}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Resizer - Drag to resize chat list */}
      <div className="chat-resizer"></div>

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
                <div className="user-status" style={{color: "#00a884", fontWeight: "bold"}}>typing...</div>
              ) : (
                <div className="user-status">
                  {!selectedChat.isGroupChat && getSender(user, selectedChat.users).lastSeen ? 
                    `Last seen ${new Date(getSender(user, selectedChat.users).lastSeen).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : 
                    "Available"}
                </div>
              )}
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: "15px", position: "relative" }}>
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
              <div key={msg._id || idx} className={`message-bubble ${msg.sender._id === user._id ? "me" : "other"}`}>
                {msg.replyTo && (
                  <div className="message-quote" onClick={() => { /* Optional: scroll to message */ }}>
                    <div className="message-quote-sender">{msg.replyTo.sender.username || "User"}</div>
                    <div>{msg.replyTo.content || msg.replyTo.message}</div>
                  </div>
                )}
                {msg.type === 'image' ? (
                   <img src={`http://localhost:5000/${msg.content}`} alt="shared" style={{maxWidth: "200px", borderRadius: "8px"}} />
                ) : (
                   msg.message || msg.content
                )}
                <span className="message-time">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <span className="msg-tick" style={{ color: msg.status === "seen" ? "#53bdeb" : "#999" }}>{msg.status === "seen" ? "✓✓" : "✓✓"}</span>
                <button className="reply-btn" onClick={() => handleReply(msg)} style={{position: "absolute", top: "5px", right: "5px", background: "none", border: "none", cursor: "pointer", opacity: 0.5, fontSize: "10px"}}>↩</button>
                <div style={{ position: "absolute", top: "5px", right: "25px", display: "flex", gap: "5px" }}>
                  <button onClick={() => handleStarMessage(msg._id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "12px", color: starredMessages.includes(msg._id) ? "gold" : "gray" }}>★</button>
                  <button onClick={() => handleForwardMessage(msg)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "12px" }}>➡</button>
                </div>
              </div>
            ))}
            <div ref={scrollRef} />
          </div>
          <div className="chat-input-area">
            {replyMessage && (
              <div style={{position: "absolute", bottom: "100%", left: "0", width: "100%", zIndex: 5}}>
                <div className="reply-preview">
                  <div className="reply-content">Replying to <b>{replyMessage.sender.username}</b>: {replyMessage.message || replyMessage.content}</div>
                  <button onClick={() => setReplyMessage(null)} style={{background: "none", border: "none", cursor: "pointer"}}>✕</button>
                </div>
              </div>
            )}
            <button onClick={() => fileInputRef.current.click()} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px", marginRight: "10px" }}>📎</button>
            <input type="file" ref={fileInputRef} style={{ display: "none" }} onChange={handleFileUpload} />
            <form onSubmit={handleSendMessage} style={{ display: "flex", width: "100%", padding: 0, background: "transparent", boxShadow: "none" }}>
              <input type="text" ref={textInputRef} className="chat-input" placeholder="Type a message" value={newMessage} onChange={handleTyping} />
              <button type="submit" className="send-btn">➤</button>
            </form>
          </div>
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
                  <h2 style={{color: 'var(--text-primary)'}}>{selectedChat.chatName}</h2>
                  <p style={{color: 'var(--text-secondary)', marginTop: '5px'}}>{selectedChat.users.length} participants</p>
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
        </>
      ) : (
        <div className="chat-window" style={{ alignItems: "center", justifyContent: "center", textAlign: "center", borderBottom: "6px solid #00a884", backgroundColor: "#f0f2f5", backgroundImage: "none" }}>
          <div>
            <h1 style={{ color: "#41525d", fontWeight: 300, fontSize: "32px" }}>Chat_Z Web</h1>
            <p style={{ color: "#667781", fontSize: "14px", marginTop: "10px" }}>Send and receive messages without keeping your phone online.</p>
          </div>
          <footer style={{ position: "absolute", bottom: "20px", width: "100%", textAlign: "center", color: "#888", fontSize: "12px" }}>
            <p>&copy; 2026 Chat_Z Inc. All rights reserved.</p>
          </footer>
        </div>
      )}
    </div>
  );
}