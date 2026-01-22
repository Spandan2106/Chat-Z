import ChatList from "../components/ChatList";
import MessageList from "../components/MessageList";
import MessageInput from "../components/MessageInput";
import GroupCreate from "../components/GroupCreate";

export default function Chat() {
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
