import { useState } from "react";
import { useChat } from "../context/ChatContext";
import { encryptMessage } from "../crypto/encrypt";

export default function MessageInput() {
  const { sendMessage } = useChat();
  const [text,setText] = useState("");

  const handleSend = async () => {
    if(!text) return;
    const encrypted = await encryptMessage(null,text); // placeholder for public key
    sendMessage({ text: encrypted, sender: "You" });
    setText("");
  }

  return (
    <div className="message-input">
      <input value={text} placeholder="Type a message..." onChange={e=>setText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSend()} />
      <button onClick={handleSend}>Send</button>
    </div>
  )
}
