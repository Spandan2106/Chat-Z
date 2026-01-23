import { useState, useRef } from "react";
import { useChat } from "../context/ChatContext";
import { encryptMessage } from "../crypto/encrypt";

export default function MessageInput() {
  const { sendMessage, sendTyping, stopTyping } = useChat();
  const [text,setText] = useState("");
  const typingTimeoutRef = useRef(null);
  const currentChatId = "currentChat"; // TODO: Get actual chat ID from context or props

  const handleSend = async () => {
    if(!text) return;
    const encrypted = await encryptMessage(null,text); // placeholder for public key
    sendMessage({ text: encrypted, sender: "You" });
    setText("");
    // Clear typing timeout on send
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    stopTyping(currentChatId);
  }

  const handleInputChange = (e) => {
    setText(e.target.value);
    // Send typing event
    sendTyping(currentChatId);
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    // Set new timeout to stop typing after 1 second of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(currentChatId);
    }, 1000);
  }

  const handleFocus = () => {
    sendTyping(currentChatId);
  }

  const handleBlur = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    stopTyping(currentChatId);
  }

  return (
    <div className="message-input">
      <input
        value={text}
        placeholder="Type a message..."
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={e=>e.key==="Enter"&&handleSend()}
      />
      <button onClick={handleSend}>Send</button>
    </div>
  )
}
