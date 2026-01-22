import { useEffect, useState } from "react";
import { useChat } from "../context/ChatContext";
import api from "../api/axios";

export default function ChatList() {
  const { onlineUsers } = useChat();
  const [chats,setChats] = useState([]);

  useEffect(()=>{
    api.get("/chats").then(res=>setChats(res.data));
  },[]);

  const isOnline = userId => onlineUsers.includes(userId);

  return (
    <div className="chat-list">
      <h3>Chats</h3>
      {chats.map(chat=>(
        <div key={chat._id} className="chat-item" onClick={()=>window.location.href=`/chat/${chat._id}`}>
          <b>{chat.name}</b> {isOnline(chat.userId) && <span className="online-dot"></span>}
        </div>
      ))}
    </div>
  )
}
