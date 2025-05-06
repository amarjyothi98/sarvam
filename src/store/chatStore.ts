import { create } from 'zustand';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  isStreaming?: boolean;
}

interface ChatState {
  messages: Message[];
  isChatActive: boolean;
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;
  setIsChatActive: (active: boolean) => void;
  clearChat: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isChatActive: false,
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  setMessages: (messages) => set({ messages }),
  setIsChatActive: (isChatActive) => set({ isChatActive }),
  clearChat: () => set({ messages: [], isChatActive: false }),
}));
