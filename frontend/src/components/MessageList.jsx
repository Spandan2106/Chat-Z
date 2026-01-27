import { useEffect, useState } from "react";
import { useChat } from "../context/ChatContext";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

export default function MessageList() {
  const { messages, typingUsers } = useChat();
  const { user } = useAuth();
  const [contextMenu, setContextMenu] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);

  useEffect(()=>{
    const container = document.getElementById("chat-messages");
    container.scrollTop = container.scrollHeight;
  },[messages]);

  const handleContextMenu = (e, msg) => {
    e.preventDefault();
    setSelectedMessage(msg);
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
    setSelectedMessage(null);
  };

  const handleDeleteForMe = async () => {
    if (!selectedMessage) return;
    try {
      await api.delete(`/messages/${selectedMessage._id}/delete-for-me`);
      // Update local messages
      // This will be handled by socket event
    } catch (error) {
      console.error("Failed to delete message for me:", error);
    }
    handleCloseContextMenu();
  };

  const handleDeleteForEveryone = async () => {
    if (!selectedMessage) return;
    try {
      await api.delete(`/messages/${selectedMessage._id}/delete-for-everyone`);
      // Update local messages
      // This will be handled by socket event
    } catch (error) {
      console.error("Failed to delete message for everyone:", error);
    }
    handleCloseContextMenu();
  };

  const handleReply = () => {
    // TODO: Implement reply functionality
    console.log("Reply to message:", selectedMessage);
    handleCloseContextMenu();
  };

  return (
    <div id="chat-messages" className="message-list" onClick={handleCloseContextMenu}>
      {messages.map(msg=>(
        <div
          key={msg._id}
          className={`message-bubble ${msg.sender._id === user._id ? "me" : "other"}`}
          onContextMenu={(e) => handleContextMenu(e, msg)}
        >
          <div className="message-header">
            <span className="message-sender">{msg.sender.username}</span>
          </div>
          <div className="message-content">
            {msg.type === "image" ? (
              <img
                src={`http://localhost:5000/${msg.content}`}
                alt="Shared image"
                className="message-image"
                onLoad={() => {
                  // Scroll to bottom when image loads
                  const container = document.getElementById("chat-messages");
                  container.scrollTop = container.scrollHeight;
                }}
              />
            ) : (
              <span>{msg.content || msg.text}</span>
            )}
          </div>
          {msg.status==="seen" && <span className="seen">✓✓</span>}
        </div>
      ))}
      {Object.keys(typingUsers).length > 0 && (
        <div className="typing-indicator">
          {Object.values(typingUsers).map((user, index) => (
            <span key={index}>{user.username} is typing...</span>
          ))}
        </div>
      )}

      {contextMenu && (
        <div
          className="context-menu"
          style={{
            position: 'fixed',
            left: contextMenu.x,
            top: contextMenu.y,
            background: 'white',
            border: '1px solid #ccc',
            borderRadius: '4px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            zIndex: 1000,
            minWidth: '150px'
          }}
        >
          <div
            className="context-menu-item"
            onClick={handleReply}
            style={{
              padding: '8px 12px',
              cursor: 'pointer',
              borderBottom: '1px solid #eee'
            }}
          >
            Reply
          </div>
          <div
            className="context-menu-item"
            onClick={handleDeleteForMe}
            style={{
              padding: '8px 12px',
              cursor: 'pointer',
              borderBottom: '1px solid #eee'
            }}
          >
            Delete for Me
          </div>
          {selectedMessage && selectedMessage.sender._id === user._id && (
            <div
              className="context-menu-item"
              onClick={handleDeleteForEveryone}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                color: '#ff4d4d'
              }}
            >
              Delete for Everyone
            </div>
          )}
        </div>
      )}
    </div>
  )
}
