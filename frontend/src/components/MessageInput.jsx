import { useState, useRef } from "react";
import { useChat } from "../context/ChatContext";
import { encryptMessage } from "../crypto/encrypt";

export default function MessageInput() {
  const { sendMessage, sendTyping, stopTyping } = useChat();
  const [text,setText] = useState("");
  const typingTimeoutRef = useRef(null);
  const textareaRef = useRef(null);
  const currentChatId = "currentChat"; // TODO: Get actual chat ID from context or props

  const handleSend = async () => {
    if(!text.trim()) return;
    const encrypted = await encryptMessage(null,text); // placeholder for public key
    sendMessage({ text: encrypted, sender: "You" });
    setText("");
    // Clear typing timeout on send
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    stopTyping(currentChatId);
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }

  const handleInputChange = (e) => {
    setText(e.target.value);
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
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

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="message-input-container">
      <div className="message-input">
        <textarea
          ref={textareaRef}
          value={text}
          placeholder="Type a message..."
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          rows={1}
        />
        <button
          onClick={handleSend}
          className={`send-button ${text.trim() ? 'active' : ''}`}
          disabled={!text.trim()}
        >
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
