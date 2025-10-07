import { create } from "zustand"
import { storage } from "./storage"
import { generateId } from "./utils"

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  guruMode: boolean
}

interface AppState {
  apiKey: string | null
  guruMode: boolean
  messages: Message[]
  isLoading: boolean
  showApiKeyModal: boolean

  setApiKey: (key: string) => void
  toggleGuruMode: () => void
  addMessage: (message: Omit<Message, "id" | "timestamp">) => void
  updateLastAssistantMessage: (delta: string) => void
  setLoading: (loading: boolean) => void
  setShowApiKeyModal: (show: boolean) => void
  clearMessages: () => void
  loadFromStorage: () => void
}

export const useStore = create<AppState>((set, get) => ({
  apiKey: null,
  guruMode: false,
  messages: [],
  isLoading: false,
  showApiKeyModal: false,

  setApiKey: (key) => {
    storage.setApiKey(key)
    set({ apiKey: key, showApiKeyModal: false })
  },

  toggleGuruMode: () => {
    const newMode = !get().guruMode
    storage.setGuruMode(newMode)
    set({ guruMode: newMode })
  },

  addMessage: (message) => {
    const newMessage: Message = {
      ...message,
      id: generateId(),
      timestamp: new Date(),
    }
    const messages = [...get().messages, newMessage]
    set({ messages })
    storage.saveChatHistory(messages)
  },

  updateLastAssistantMessage: (delta) => {
    const current = get().messages
    if (current.length === 0) return
    const lastIndex = current.length - 1
    const last = current[lastIndex]
    if (last.role !== "assistant") return
    const updated: Message = { ...last, content: last.content + delta }
    const messages = [...current.slice(0, lastIndex), updated]
    set({ messages })
    storage.saveChatHistory(messages)
  },

  setLoading: (loading) => set({ isLoading: loading }),

  setShowApiKeyModal: (show) => set({ showApiKeyModal: show }),

  clearMessages: () => {
    storage.clearChatHistory()
    set({ messages: [] })
  },

  loadFromStorage: () => {
    const apiKey = storage.getApiKey()
    const guruMode = storage.getGuruMode()
    const messages = storage.getChatHistory()
    set({
      apiKey,
      guruMode,
      messages: messages.map((m: any) => ({
        ...m,
        timestamp: new Date(m.timestamp),
      })),
      showApiKeyModal: !apiKey,
    })
  },
}))
