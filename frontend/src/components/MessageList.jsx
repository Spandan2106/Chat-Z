import { useEffect } from "react";
import { useChat } from "../context/ChatContext";

export default function MessageList() {
  const { messages } = useChat();

  useEffect(()=>{
    const container = document.getElementById("chat-messages");
    container.scrollTop = container.scrollHeight;
  },[messages]);

  return (
    <div id="chat-messages" className="message-list">
      {messages.map(msg=>(
        <div key={msg._id} className={`message-bubble ${msg.sender==="You"?"me":"other"}`}>
          <b>{msg.sender}</b>: {msg.text}
          {msg.status==="seen" && <span className="seen">✓✓</span>}
        </div>
      ))}
    </div>
  )
}
