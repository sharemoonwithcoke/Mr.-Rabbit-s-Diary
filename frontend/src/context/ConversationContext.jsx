import { createContext, useContext, useState } from "react";

const ConversationContext = createContext(null);

const INITIAL = { entry: null, phase: "idle", followups: [] };

export function ConversationProvider({ children }) {
  const [convo, setConvo] = useState(INITIAL);
  const endConversation = () => setConvo(INITIAL);
  return (
    <ConversationContext.Provider value={{ convo, setConvo, endConversation }}>
      {children}
    </ConversationContext.Provider>
  );
}

export function useConversation() {
  return useContext(ConversationContext);
}
