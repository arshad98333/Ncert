"use client"

import type { Message } from "@/lib/store"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, User, Bot, Check } from "lucide-react"
import { useEffect, useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface MessageItemProps {
  message: Message
}

export function MessageItem({ message }: MessageItemProps) {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === "user"
  const [animatedText, setAnimatedText] = useState<string>(isUser ? message.content : "")
  const [isAnimating, setIsAnimating] = useState<boolean>(false)

  // Character-by-character animation for assistant messages
  useEffect(() => {
    if (isUser) return setAnimatedText(message.content)
    // If content increased, animate the diff
    const current = animatedText
    const full = message.content
    if (full.length <= current.length) return
    setIsAnimating(true)
    let i = current.length
    const interval = window.setInterval(() => {
      i += 1
      setAnimatedText(full.slice(0, i))
      if (i >= full.length) {
        window.clearInterval(interval)
        setIsAnimating(false)
      }
    }, 12)
    return () => window.clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message.content])

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(message.content)
      } else {
        const textArea = document.createElement("textarea")
        textArea.value = message.content
        textArea.style.position = "fixed"
        textArea.style.left = "-9999px"
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        document.execCommand("copy")
        document.body.removeChild(textArea)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Silently ignore copy errors in unsupported environments
    }
  }

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser
            ? "bg-primary text-primary-foreground"
            : message.guruMode
              ? "bg-[oklch(0.744_0.150_70.317)] text-white"
              : "bg-muted"
        }`}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      <div className={`flex-1 space-y-2 ${isUser ? "flex flex-col items-end" : ""}`}>
        <Card
          className={`p-4 ${
            isUser
              ? "bg-primary text-primary-foreground"
              : message.guruMode
                ? "border-[oklch(0.744_0.150_70.317)] border-2 bg-gradient-to-br from-background to-[oklch(0.744_0.150_70.317)]/5"
                : "bg-muted/50"
          } ${isUser ? "ml-12" : "mr-12"}`}
        >
          {isUser ? (
            <p className="text-pretty whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{animatedText}</ReactMarkdown>
            </div>
          )}
        </Card>

        <div className="flex items-center gap-2 text-xs text-muted-foreground px-1">
          <span>{message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
          {!isUser && (
            <>
              <span>•</span>
              <Button variant="ghost" size="sm" className="h-6 px-2" onClick={handleCopy}>
                {copied ? (
                  <>
                    <Check className="h-3 w-3 mr-1" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </>
                )}
              </Button>
              {message.guruMode && (
                <>
                  <span>•</span>
                  <span className="text-[oklch(0.744_0.150_70.317)] font-medium">Guru Mode</span>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
