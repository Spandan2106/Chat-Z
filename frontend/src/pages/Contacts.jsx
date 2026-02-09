import { useState, useEffect } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { socket } from "../socket/socket";

export default function Contacts() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [globalSearchResults, setGlobalSearchResults] = useState([]);
  const [globalGroupResults, setGlobalGroupResults] = useState([]);
  const [isGlobalSearching, setIsGlobalSearching] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    socket.emit("setup", user);

    const handleOnlineUsers = (users) => {
      setOnlineUsers(users);
    };

    const handleUserOnline = ({ userId }) => {
      setOnlineUsers((prev) => [...new Set([...prev, userId])]);
    };

    const handleUserOffline = ({ userId }) => {
      setOnlineUsers((prev) => prev.filter((id) => id !== userId));
    };

    socket.on("online-users", handleOnlineUsers);
    socket.on("user-online", handleUserOnline);
    socket.on("user-offline", handleUserOffline);

    return () => {
      socket.off("online-users", handleOnlineUsers);
      socket.off("user-online", handleUserOnline);
      socket.off("user-offline", handleUserOffline);
    };
  }, [user]);

  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const contactsRes = await api.get("/users/contacts");
      const contactsData = Array.isArray(contactsRes.data) ? contactsRes.data : [];
      setContacts(contactsData.filter(u => u));
      
      const chatsRes = await api.get("/messages/chat");
      const groupChats = (Array.isArray(chatsRes.data) ? chatsRes.data : []).filter(c => c && c.isGroupChat);
      setGroups(groupChats);
    } catch (err) {
      console.error(err);
      setError("Failed to refresh contacts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleRefresh();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim()) {
        setIsGlobalSearching(true);
        try {
          // Search Users
          const { data: usersData } = await api.get(`/users?search=${searchQuery.trim()}`);
          const newUsers = Array.isArray(usersData) ? usersData.filter(u => 
            u._id !== user._id
          ) : [];
          setGlobalSearchResults(newUsers);

          // Search Groups
          const { data: groupsData } = await api.get(`/messages/groups?search=${searchQuery.trim()}`);
          setGlobalGroupResults(Array.isArray(groupsData) ? groupsData : []);
        } catch (error) {
          console.error("Global search failed", error);
        } finally {
          setIsGlobalSearching(false);
        }
      } else {
        setGlobalSearchResults([]);
        setGlobalGroupResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, contacts, user._id]);

  const handleContactClick = (contact) => {
    navigate("/users", { state: { contactId: contact._id } });
  };

  const handleGroupClick = (group) => {
    navigate("/users", { state: { selectedChat: group } });
  };

  const handleRemoveContact = async (e, contactId) => {
    e.stopPropagation(); // Prevent navigation when clicking the remove button
    if (window.confirm("Are you sure you want to remove this contact?")) {
      try {
        await api.put("/users/removecontact", { userId: contactId });
        setContacts(prevContacts => prevContacts.filter(c => c._id !== contactId));
      } catch (err) {
        console.error("Failed to remove contact", err);
        alert("Failed to remove contact. Please try again.");
      }
    }
  };

  const handleAddGlobalUser = async (e, userId) => {
    e.stopPropagation();
    try {
      const { data } = await api.put("/users/addcontact", { userId });
      setContacts(data);
      setGlobalSearchResults(prev => prev.filter(u => u._id !== userId));
      alert("User added to contacts!");
    } catch (err) {
      console.error(err);
      alert("Failed to add contact");
    }
  };

  const handleJoinGroup = async (e, group) => {
    e.stopPropagation();
    if (window.confirm(`Join group "${group.chatName}"?`)) {
      try {
        await api.put("/messages/groupadd", {
          chatId: group._id,
          userId: user._id
        });
        alert("Joined group!");
        setGroups(prev => [...prev, group]);
        setGlobalGroupResults(prev => prev.filter(g => g._id !== group._id));
      } catch (err) {
        console.error(err);
        alert("Failed to join group");
      }
    }
  };

  const handleBlockContact = async (e, contactId) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to block this contact?")) {
      try {
        await api.put("/users/block", { userId: contactId });
        setContacts(prevContacts => prevContacts.filter(c => c._id !== contactId));
      } catch (err) {
        console.error("Failed to block contact", err);
        alert("Failed to block contact. Please try again.");
      }
    }
  };

  const renderAvatar = (u) => {
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5001";
    const avatarUrl = u.avatar 
      ? u.avatar.startsWith('http') ? u.avatar : `${baseUrl.replace(/\/api$/, '')}/${u.avatar.replace(/\\/g, "/")}`
      : "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg";
    return <img src={avatarUrl} className="avatar" alt={u.username} />;
  };

  const filteredContacts = contacts.filter(c =>
    (c.username && c.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredGroups = groups.filter(g =>
    g.chatName && g.chatName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="app-container" style={{ flexDirection: 'column', height: '100vh', margin: 0, padding: 0 }}>
      <div className="page-layout" style={{ flex: 1, height: 'auto', marginTop: '60px', marginBottom: '30px', overflowY: 'auto', alignItems: 'flex-start', paddingTop: '20px' }}>
        <div className="settings-section-box" style={{ width: '95%', maxWidth: '1000px', margin: '0 auto', paddingBottom: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '24px' }}>Contacts</h2>
              <button onClick={handleRefresh} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' }} title="Refresh">🔄</button>
            </div>
            <input 
              type="text"
              placeholder="Search contacts..."
              className="chat-input"
              style={{ width: '100%', padding: '12px', fontSize: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {searchQuery && (
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ color: 'var(--text-primary)', fontSize: '18px', marginBottom: '10px' }}>Global User Results</h3>
              {isGlobalSearching ? (
                <p style={{ color: 'var(--text-secondary)' }}>Searching...</p>
              ) : globalSearchResults.length > 0 ? (
                <div className="user-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '10px' }}>
                  {globalSearchResults.map(u => {
                    const isContact = contacts.some(c => c._id === u._id);
                    return (
                    <div key={u._id} className="user-item contact-card" style={{ cursor: 'default' }}>
                      {renderAvatar(u)}
                      <div className="user-info">
                        <div className="user-name" style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{u.username}</div>
                        <div className="user-status" style={{ color: 'var(--text-secondary)' }}>{u.email}</div>
                      </div>
                      {isContact ? (
                        <button className="add-contact-btn" disabled style={{ opacity: 0.6, cursor: 'not-allowed', background: 'var(--text-secondary)' }}>
                          Added
                        </button>
                      ) : (
                        <button className="add-contact-btn" onClick={(e) => handleAddGlobalUser(e, u._id)}>
                          Add
                        </button>
                      )}
                    </div>
                  )})}
                </div>
              ) : (
                <p style={{ color: 'var(--text-secondary)' }}>No new users found.</p>
              )}

              <h3 style={{ color: 'var(--text-primary)', fontSize: '18px', marginBottom: '10px', marginTop: '20px' }}>Global Group Results</h3>
              {isGlobalSearching ? (
                <p style={{ color: 'var(--text-secondary)' }}>Searching...</p>
              ) : globalGroupResults.length > 0 ? (
                <div className="user-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '10px' }}>
                  {globalGroupResults.map(g => (
                    <div key={g._id} className="user-item contact-card" style={{ cursor: 'default' }}>
                      <div className="avatar default-avatar">G</div>
                      <div className="user-info">
                        <div className="user-name" style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{g.chatName}</div>
                        <div className="user-status" style={{ color: 'var(--text-secondary)' }}>{g.users.length} members</div>
                      </div>
                      <button className="add-contact-btn" onClick={(e) => handleJoinGroup(e, g)}>
                        Join
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-secondary)' }}>No new groups found.</p>
              )}
            </div>
          )}

          <div className="user-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '10px' }}>
            {loading && <p style={{ padding: '10px', color: 'var(--text-secondary)' }}>Loading contacts...</p>}
            {error && <p style={{color: 'red', padding: '10px'}}>{error}</p>}
            {!loading && !error && (
              <>
                {filteredContacts.map(u => (
                  <div key={u._id} className="user-item contact-card" onClick={() => handleContactClick(u)}>
                    <div style={{ position: "relative" }}>
                      {renderAvatar(u)}
                      {onlineUsers.includes(u._id) && (
                        <span
                          style={{
                            position: "absolute",
                            bottom: "2px",
                            right: "2px",
                            width: "12px",
                            height: "12px",
                            backgroundColor: "#25D366",
                            borderRadius: "50%",
                            border: "2px solid white",
                          }}
                          title="Online"
                        ></span>
                      )}
                    </div>
                    <div className="user-info">
                      <div className="user-name" style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{u.username}</div>
                      <div className="user-status" style={{ color: 'var(--text-secondary)' }}>{u.email}</div>
                    </div>
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                      <button className="block-contact-btn" onClick={(e) => handleBlockContact(e, u._id)}>
                        Block
                      </button>
                      <button className="remove-contact-btn" onClick={(e) => handleRemoveContact(e, u._id)} style={{ marginLeft: 0 }}>
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
                {filteredContacts.length === 0 && contacts.length > 0 && <p style={{padding: '10px', color: 'var(--text-secondary)'}}>No contacts found for "{searchQuery}".</p>}
                {contacts.length === 0 && <p style={{padding: '10px', color: 'var(--text-secondary)'}}>No contacts added. Use the search bar above to find and add users.</p>}
              </>
            )}
          </div>
        </div>

        <div className="settings-section-box" style={{ width: '95%', maxWidth: '1000px', margin: '20px auto', paddingBottom: '20px' }}>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '20px', fontSize: '24px' }}>Groups</h2>
          <div className="user-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '10px' }}>
            {loading && <p style={{ padding: '10px', color: 'var(--text-secondary)' }}>Loading groups...</p>}
            {!loading && !error && (
              <>
                {filteredGroups.map(g => (
                  <div key={g._id} className="user-item contact-card" onClick={() => handleGroupClick(g)}>
                    <div className="avatar default-avatar">G</div>
                    <div className="user-info">
                      <div className="user-name" style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{g.chatName}</div>
                      <div className="user-status" style={{ color: 'var(--text-secondary)' }}>{g.users.length} members</div>
                    </div>
                  </div>
                ))}
                 {filteredGroups.length === 0 && groups.length > 0 && <p style={{padding: '10px', color: 'var(--text-secondary)'}}>No groups found for "{searchQuery}".</p>}
                 {groups.length === 0 && <p style={{padding: '10px', color: 'var(--text-secondary)'}}>You are not a member of any groups.</p>}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}