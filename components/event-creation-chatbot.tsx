"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, Send, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
}

export function EventCreationChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hi there! I'm your AI event assistant. I'll help you create the perfect AI event. What type of event are you planning? (Workshop, Conference, Meetup, etc.)",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    topics: [],
    format: "",
    audience: [],
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [scrollToBottom])

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

    // Simulate AI response based on the current step
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const assistantResponse: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "",
    }

    if (step === 1) {
      // After user specifies event type
      setEventData((prev) => ({ ...prev, format: input }))
      assistantResponse.content = `Great! A ${input} sounds exciting. What's the main topic or focus area of your ${input}?`
      setStep(2)
    } else if (step === 2) {
      // After user specifies topic
      setEventData((prev) => ({ ...prev, topics: [input] }))
      assistantResponse.content = `A ${eventData.format} about ${input} sounds interesting! Based on similar events, I suggest the title: "Exploring ${input}: Innovations and Applications". What do you think of this title?`
      setStep(3)
    } else if (step === 3) {
      // After user responds to title suggestion
      setEventData((prev) => ({ ...prev, title: input }))
      assistantResponse.content = `Great title! Now, who is your target audience for this event? (Students, Professionals, Researchers, etc.)`
      setStep(4)
    } else if (step === 4) {
      // After user specifies audience
      setEventData((prev) => ({ ...prev, audience: [input] }))
      assistantResponse.content = `Perfect! Based on your ${eventData.format} about ${eventData.topics[0]} for ${input}, I recommend the following agenda structure:
      
1. Introduction to ${eventData.topics[0]} (15 min)
2. Current Challenges and Opportunities (20 min)
3. Interactive Demo/Workshop (30 min)
4. Q&A and Networking (25 min)

Would you like to use this agenda or modify it?`
      setStep(5)
    } else if (step === 5) {
      // After user responds to agenda
      assistantResponse.content = `Excellent! I've created your event. You can now add additional details like date, time, location, and speakers. Would you like to continue to the event details page?`
      setStep(6)
    } else if (step === 6) {
      // Final step
      assistantResponse.content = `Great! I've prepared the event details page for you. Click "Continue" to add the final details to your event.`
      setStep(7)
    }

    setMessages((prev) => [...prev, assistantResponse])
    setIsLoading(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleContinue = () => {
    router.push("/dashboard/events")
  }

  return (
    <div className="flex flex-col h-[600px]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className="flex items-start gap-2 max-w-[80%]">
              {message.role === "assistant" && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" alt="AI Assistant" />
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
              )}
              <Card className={message.role === "user" ? "bg-primary text-primary-foreground" : ""}>
                <CardContent className="p-3">
                  <p className="whitespace-pre-line">{message.content}</p>
                </CardContent>
              </Card>
              {message.role === "user" && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-start gap-2 max-w-[80%]">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg?height=32&width=32" alt="AI Assistant" />
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
        <div ref={messagesEndRef} />
      </div>
      {step < 7 ? (
        <div className="border-t p-4">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />
            <Button size="icon" onClick={handleSend} disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </div>
          <div className="mt-2 text-xs text-muted-foreground flex items-center">
            <Sparkles className="h-3 w-3 mr-1" />
            AI-powered suggestions help you create better events
          </div>
        </div>
      ) : (
        <div className="border-t p-4">
          <Button className="w-full" onClick={handleContinue}>
            Continue to Event Details
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}

