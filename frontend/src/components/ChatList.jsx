import { useEffect } from "react";
import { useChat } from "../context/ChatContext";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

export default function ChatList() {
  const { onlineUsers, chats, updateChatsList, joinChat, setCurrentChat } = useChat();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Fetch chats for the logged-in user
      const fetchChats = async () => {
        try {
          const response = await api.get("/messages/chat");
          console.log("Fetched chats:", response.data);
          updateChatsList(response.data);
        } catch (error) {
          console.error("Failed to fetch chats:", error);
        }
      };
      fetchChats();
    }
  }, [user, updateChatsList]);

  const isOnline = userId => onlineUsers.some(u => u._id === userId);

  const handleChatClick = (chat) => {
    console.log("Clicking chat:", chat);
    // First join the chat room via socket
    joinChat(chat._id);
    // Then set as current chat (this will also fetch messages)
    setCurrentChat(chat);
  };

  return (
    <div className="chat-list">
      <h3>Chats</h3>
      {chats.length === 0 ? (
        <p style={{ padding: "10px", color: "#999" }}>No chats yet</p>
      ) : (
        chats.map(chat => (
          <div key={chat._id} className="chat-item" onClick={() => handleChatClick(chat)}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <b>{chat.chatName || chat.name || "Unnamed Chat"}</b>
              {chat.isGroupChat ? (
                <span className="group-indicator" style={{ fontSize: "12px", color: "#666" }}>Group</span>
              ) : null}
            </div>
            {!chat.isGroupChat && 
              chat.users?.find(u => u._id !== user?._id) && (
              <span style={{ fontSize: "12px", color: "#999" }}>
                {isOnline(chat.users.find(u => u._id !== user?._id)._id) ? (
                  <span className="online-dot" style={{ color: "green" }}>● Online</span>
                ) : (
                  <span>● Offline</span>
                )}
              </span>
            )}
          </div>
        ))
      )}
    </div>
  )
}
