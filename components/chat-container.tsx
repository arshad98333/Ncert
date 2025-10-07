"use client"

import { useEffect, useRef } from "react"
import { useStore } from "@/lib/store"
import { MessageItem } from "./message-item"

export function ChatContainer() {
  const { messages, isLoading } = useStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md space-y-4">
          <h2 className="text-2xl font-bold">Welcome to MathGuru AI! </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            I'm here to help you learn about <span className="font-semibold text-foreground">Rational Numbers</span>{" "}
            from Chapter 1.
          </p>
          <div className="bg-muted/50 p-4 rounded-lg text-left space-y-2 text-sm">
            <p className="font-medium">You can ask me about:</p>
            <ul className="space-y-1 ml-4">
              <li>• What are rational numbers?</li>
              <li>• How to add or multiply fractions</li>
              <li>• Properties like closure, commutativity</li>
              <li>• Practice problems and examples</li>
            </ul>
          </div>
          <p className="text-sm text-muted-foreground">Try asking: "What is a rational number?" to get started!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="container mx-auto max-w-4xl space-y-6">
        {messages.map((message) => (
          <MessageItem key={message.id} message={message} />
        ))}
        {isLoading && messages.length > 0 && messages[messages.length - 1]?.role === "assistant" &&
          !messages[messages.length - 1]?.content && (
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted" />
              <div className="flex-1 mr-12">
                <div className="bg-muted/50 rounded-md p-4">
                  <div className="h-3 w-2/3 bg-muted animate-pulse rounded mb-2" />
                  <div className="h-3 w-1/2 bg-muted animate-pulse rounded mb-2" />
                  <div className="h-3 w-1/3 bg-muted animate-pulse rounded" />
                </div>
              </div>
            </div>
          )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}
