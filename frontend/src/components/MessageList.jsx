import { useEffect, useState, useRef } from "react";
import { useChat } from "../context/ChatContext";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

export default function MessageList() {
  const { messages, typingUsers } = useChat();
  const { user } = useAuth();
  const [contextMenu, setContextMenu] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUsers]);

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
    } catch (error) {
      console.error("Failed to delete message for me:", error);
    }
    handleCloseContextMenu();
  };

  const handleDeleteForEveryone = async () => {
    if (!selectedMessage) return;
    try {
      await api.delete(`/messages/${selectedMessage._id}/delete-for-everyone`);
    } catch (error) {
      console.error("Failed to delete message for everyone:", error);
    }
    handleCloseContextMenu();
  };

  const handleReply = () => {
    console.log("Reply to message:", selectedMessage);
    handleCloseContextMenu();
  };

  return (
    <div className="message-list" onClick={handleCloseContextMenu}>
      {messages.length === 0 ? (
        <div className="center" style={{ flex: 1, color: "#999" }}>
          <p>No messages yet. Start a conversation!</p>
        </div>
      ) : (
        <>
          {messages.map((msg) => (
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
                    onLoad={scrollToBottom}
                  />
                ) : (
                  <span>{msg.content || msg.text}</span>
                )}
              </div>
              {msg.status === "seen" && <span className="seen">✓✓</span>}
            </div>
          ))}

          {Object.keys(typingUsers).length > 0 && (
            <div className="typing-indicator">
              {Object.values(typingUsers).map((typingUser, index) => (
                <span key={index}>{typingUser.username} is typing</span>
              ))}
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </>
      )}

      {contextMenu && (
        <div
          className="context-menu"
          style={{
            position: "fixed",
            left: contextMenu.x,
            top: contextMenu.y,
            background: "white",
            border: "1px solid #ccc",
            borderRadius: "4px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            zIndex: 1000,
            minWidth: "150px",
          }}
        >
          <div
            className="context-menu-item"
            onClick={handleReply}
            style={{
              padding: "8px 12px",
              cursor: "pointer",
              borderBottom: "1px solid #eee",
            }}
          >
            Reply
          </div>
          <div
            className="context-menu-item"
            onClick={handleDeleteForMe}
            style={{
              padding: "8px 12px",
              cursor: "pointer",
              borderBottom: "1px solid #eee",
            }}
          >
            Delete for Me
          </div>
          {selectedMessage && selectedMessage.sender._id === user._id && (
            <div
              className="context-menu-item"
              onClick={handleDeleteForEveryone}
              style={{
                padding: "8px 12px",
                cursor: "pointer",
                color: "#ff4d4d",
              }}
            >
              Delete for Everyone
            </div>
          )}
        </div>
      )}
    </div>
  );
}
