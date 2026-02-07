import { useState, useRef } from "react";
import { useChat } from "../context/ChatContext";
import { useAuth } from "../context/AuthContext";
import { encryptMessage } from "../crypto/encrypt";
import EmojiPicker from "emoji-picker-react";

export default function MessageInput() {
  const { sendMessage, sendTyping, stopTyping, currentChat } = useChat();
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const typingTimeoutRef = useRef(null);
  const textareaRef = useRef(null);

  const handleSend = async () => {
    if (!text.trim() || !currentChat || !user) return;

    try {
      const encrypted = await encryptMessage(null, text); // placeholder for public key
      const messageData = {
        content: encrypted,
        chatId: currentChat._id,
        sender: user,
        replyTo: isReplying && replyingTo ? replyingTo._id : null
      };

      console.log("Sending message:", messageData);
      sendMessage(messageData);
      setText("");
      clearReply();

      // Clear typing timeout on send
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }

      if (currentChat) {
        stopTyping(currentChat._id);
      }

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleInputChange = (e) => {
    setText(e.target.value);

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(
        textareaRef.current.scrollHeight,
        120
      ) + "px";
    }

    // Send typing event
    if (currentChat) {
      sendTyping(currentChat._id);

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set new timeout to stop typing after 1 second of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping(currentChat._id);
      }, 1000);
    }
  };

  const handleFocus = () => {
    if (currentChat) {
      sendTyping(currentChat._id);
    }
  };

  const handleBlur = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    if (currentChat) {
      stopTyping(currentChat._id);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearReply = () => {
    setIsReplying(false);
    setReplyingTo(null);
  };

  const handleEmojiClick = (emojiObject) => {
    setText(prevText => prevText + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  return (
    <div className="message-input-container">
      {isReplying && replyingTo && (
        <div className="reply-panel">
          <div className="reply-panel-content">
            <div className="reply-panel-label">
              Replying to {replyingTo.sender?.username || "User"}
            </div>
            <div className="reply-panel-text">{replyingTo.content}</div>
          </div>
          <button className="reply-panel-close" onClick={clearReply}>
            ✕
          </button>
        </div>
      )}

      <div className="message-input-wrapper">
        <div className="message-input">
          <button
            onClick={toggleEmojiPicker}
            className="emoji-button"
            title="Add emoji"
          >
            😀
          </button>
          <textarea
            ref={textareaRef}
            value={text}
            placeholder="Type a message... (Shift+Enter for new line)"
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          <button
            onClick={handleSend}
            className={`send-button ${text.trim() ? "active" : ""}`}
            disabled={!text.trim()}
            title="Send message (Enter)"
          >
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path
                fill="currentColor"
                d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"
              />
            </svg>
          </button>
        </div>
        {showEmojiPicker && (
          <div className="emoji-picker-container">
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </div>
        )}
      </div>
    </div>
  );
}
