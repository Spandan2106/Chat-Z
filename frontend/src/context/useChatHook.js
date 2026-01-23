import { useContext } from "react";
import { ChatContext } from "./ChatContextFile";

// Custom hook for using chat context
export const useChat = () => useContext(ChatContext);
