"use client"

import { useEffect } from "react"
import { useStore } from "@/lib/store"
import { sendMessage, sendMessageStream } from "@/lib/gemini"
import { ApiKeyModal } from "@/components/api-key-modal"
import { Header } from "@/components/header"
import { ChatContainer } from "@/components/chat-container"
import { ChatInput } from "@/components/chat-input"
import { useToast } from "@/hooks/use-toast"

export default function Home() {
  const { apiKey, guruMode, messages, isLoading, loadFromStorage, addMessage, setLoading } = useStore()
  const { toast } = useToast()

  useEffect(() => {
    loadFromStorage()
  }, [loadFromStorage])

  const handleSendMessage = async (content: string) => {
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter your Gemini API key to continue.",
        variant: "destructive",
      })
      return
    }

    addMessage({ role: "user", content, guruMode })
    setLoading(true)

    try {
      // Convert messages to Gemini format
      const history = messages.map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      }))

      // Create a placeholder assistant message and stream into it
      addMessage({ role: "assistant", content: "", guruMode })
      await sendMessageStream(
        apiKey,
        content,
        guruMode,
        history,
        (delta) => {
          // We cannot access store here directly; use the store's action
          // Importing useStore hook at top already; call the action imperatively
          // eslint-disable-next-line @typescript-eslint/no-use-before-define
          useStore.getState().updateLastAssistantMessage(delta)
        },
      )
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to get response. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <ApiKeyModal />
      <Header />
      <ChatContainer />
      <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
    </div>
  )
}
