"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { validateApiKey } from "@/lib/gemini"
import { useStore } from "@/lib/store"
import { ExternalLink, Key, Loader2 } from "lucide-react"

export function ApiKeyModal() {
  const { showApiKeyModal, setShowApiKeyModal, setApiKey } = useStore()
  const [inputKey, setInputKey] = useState("")
  const [isValidating, setIsValidating] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!inputKey.trim()) {
      setError("Please enter an API key")
      return
    }

    setIsValidating(true)

    try {
      const isValid = await validateApiKey(inputKey.trim())

      if (isValid) {
        setApiKey(inputKey.trim())
        setInputKey("")
      } else {
        setError("Invalid API key. Double-check and try again.")
      }
    } catch (err: any) {
      // Preserve useful error details (network/model issues) so users don't get misled
      const msg =
        typeof err?.message === "string" && err.message.length < 200
          ? err.message
          : "Failed to validate API key. Please try again."
      setError(msg)
    } finally {
      setIsValidating(false)
    }
  }

  return (
    <Dialog open={showApiKeyModal} onOpenChange={setShowApiKeyModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            Welcome to MathGuru AI
          </DialogTitle>
          <DialogDescription className="text-base">
            To get started, please enter your Google Gemini API key. Your key is stored securely in your browser.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey">Gemini API Key</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="Enter your API key"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              disabled={isValidating}
              className="font-mono text-sm"
            />
          </div>

          {error && (
            <>
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              <div className="text-xs text-muted-foreground">
                <ul className="list-disc pl-4 space-y-1 mt-2">
                  <li>Make sure you pasted the full key from Google AI Studio (no extra spaces).</li>
                  <li>
                    If your key is restricted by HTTP referrer, add{" "}
                    <code className="font-mono">{typeof window !== "undefined" ? window.location.origin : ""}</code> to
                    Allowed referrers in AI Studio.
                  </li>
                  <li>If you see quota/billing errors, check Usage & Billing in AI Studio.</li>
                </ul>
              </div>
            </>
          )}

          <div className="bg-muted p-3 rounded-lg text-sm space-y-2">
            <p className="font-medium">Don't have an API key?</p>
            <a
              href="https://makersuite.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-primary hover:underline"
            >
              Get your free API key from Google AI Studio
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <Button type="submit" className="w-full" disabled={isValidating}>
            {isValidating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Validating...
              </>
            ) : (
              "Continue"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
