"use client"

import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { BookOpen, Settings, Sparkles } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function Header() {
  const { guruMode, toggleGuruMode, setShowApiKeyModal, clearMessages } = useStore()

  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary text-primary-foreground rounded-lg p-2">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg">MathGuru AI</h1>
            <p className="text-xs text-muted-foreground">Your Math Learning Companion</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm font-medium">
          <span className="hidden sm:inline">Chapter 1: Rational Numbers</span>
        </div>

        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={guruMode ? "default" : "outline"}
                  size="sm"
                  onClick={toggleGuruMode}
                  className={
                    guruMode
                      ? "bg-[oklch(0.744_0.150_70.317)] hover:bg-[oklch(0.744_0.150_70.317)]/90 text-white guru-mode-active border-[oklch(0.744_0.150_70.317)]"
                      : ""
                  }
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Guru Mode</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-sm max-w-xs">
                  {guruMode
                    ? "Guru Mode Active: Detailed, precise explanations with step-by-step reasoning"
                    : "Enable Guru Mode for comprehensive, detailed explanations"}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Settings</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowApiKeyModal(true)}>Update API Key</DropdownMenuItem>
              <DropdownMenuItem onClick={clearMessages}>Clear Chat History</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="font-normal text-xs text-muted-foreground">
                MathGuru AI v1.0
              </DropdownMenuLabel>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
