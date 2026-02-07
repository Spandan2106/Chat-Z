import { useEffect } from "react";
import ChatList from "../components/ChatList";
import MessageList from "../components/MessageList";
import MessageInput from "../components/MessageInput";
import GroupCreate from "../components/GroupCreate";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";

export default function Chat() {
  const { user } = useAuth();
  const { setupSocket } = useChat();

  useEffect(() => {
    if (user) {
      setupSocket(user);
    }
  }, [user, setupSocket]);

  return (
    <div className="chat-layout">
      <ChatList />
      <div className="chat-window">
        <MessageList />
        <MessageInput />
      </div>
      <GroupCreate />
    </div>
  )
}
