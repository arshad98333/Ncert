// Simple localStorage wrapper for API key and settings
export const storage = {
  getApiKey(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem("mathguru_api_key")
  },

  setApiKey(key: string): void {
    if (typeof window === "undefined") return
    localStorage.setItem("mathguru_api_key", key)
  },

  removeApiKey(): void {
    if (typeof window === "undefined") return
    localStorage.removeItem("mathguru_api_key")
  },

  getGuruMode(): boolean {
    if (typeof window === "undefined") return false
    return localStorage.getItem("mathguru_guru_mode") === "true"
  },

  setGuruMode(enabled: boolean): void {
    if (typeof window === "undefined") return
    localStorage.setItem("mathguru_guru_mode", enabled.toString())
  },

  getChatHistory(): any[] {
    if (typeof window === "undefined") return []
    const history = localStorage.getItem("mathguru_chat_history")
    return history ? JSON.parse(history) : []
  },

  saveChatHistory(messages: any[]): void {
    if (typeof window === "undefined") return
    localStorage.setItem("mathguru_chat_history", JSON.stringify(messages))
  },

  clearChatHistory(): void {
    if (typeof window === "undefined") return
    localStorage.removeItem("mathguru_chat_history")
  },
}
