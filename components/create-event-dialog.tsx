"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Send } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
}

export function CreateEventDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hi! I'm your AI event assistant. Tell me about the event you'd like to create and I'll help you set it up. What type of event are you planning?",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Simulate AI response
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content:
        "Based on your description, I suggest creating a tech workshop event. Would you like me to help you with:\n\n1. Setting up the event details\n2. Creating an agenda\n3. Suggesting a venue\n4. Recommending ticket prices\n\nWhat would you like to focus on first?",
    }

    setMessages((prev) => [...prev, aiMessage])
    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Event</DialogTitle>
          <DialogDescription>Chat with our AI assistant to create your event</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col h-[500px]">
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className="flex items-start gap-2 max-w-[80%]">
                    {message.role === "assistant" && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/placeholder.svg?height=32&width=32" />
                        <AvatarFallback>AI</AvatarFallback>
                      </Avatar>
                    )}
                    <Card className={message.role === "user" ? "bg-primary text-primary-foreground" : ""}>
                      <CardContent className="p-3">
                        <p className="whitespace-pre-line text-sm">{message.content}</p>
                      </CardContent>
                    </Card>
                    {message.role === "user" && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/placeholder.svg?height=32&width=32" />
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder.svg?height=32&width=32" />
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                    <Card>
                      <CardContent className="p-3">
                        <div className="flex space-x-2">
                          <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" />
                          <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce delay-150" />
                          <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce delay-300" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          <div className="border-t pt-4 mt-4">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
              />
              <Button size="icon" onClick={handleSend} disabled={isLoading || !input.trim()}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

