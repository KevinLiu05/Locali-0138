"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, ThumbsUp, ThumbsDown, Check } from "lucide-react"
import { useState } from "react"

type Suggestion = {
  id: string
  type: "topic" | "format" | "timing" | "audience"
  content: string
  reason: string
  applied: boolean
}

export function EventOptimizationSuggestions({ eventId }: { eventId: string }) {
  // Mock suggestions data
  const [suggestions, setSuggestions] = useState<Suggestion[]>([
    {
      id: "1",
      type: "topic",
      content: "Add a section on ethical considerations in deep learning",
      reason: "5 participants have expressed interest in AI ethics in their profiles",
      applied: false,
    },
    {
      id: "2",
      type: "format",
      content: "Include a hands-on coding session",
      reason: "70% of registered participants have technical backgrounds",
      applied: false,
    },
    {
      id: "3",
      type: "timing",
      content: "Extend Q&A session by 15 minutes",
      reason: "Based on similar events, Q&A sessions for this topic typically run longer",
      applied: false,
    },
    {
      id: "4",
      type: "audience",
      content: "Consider inviting beginners with a separate introduction track",
      reason: "30% of registered participants are new to the field",
      applied: false,
    },
  ])

  const handleApply = (id: string) => {
    setSuggestions(
      suggestions.map((suggestion) => (suggestion.id === id ? { ...suggestion, applied: true } : suggestion)),
    )
  }

  const handleFeedback = (id: string, positive: boolean) => {
    // In a real app, you would send this feedback to your AI system
    alert(`Feedback recorded: ${positive ? "Helpful" : "Not helpful"} for suggestion #${id}`)
  }

  const getTypeBadge = (type: Suggestion["type"]) => {
    switch (type) {
      case "topic":
        return <Badge className="bg-blue-500">Topic</Badge>
      case "format":
        return <Badge className="bg-purple-500">Format</Badge>
      case "timing":
        return <Badge className="bg-amber-500">Timing</Badge>
      case "audience":
        return <Badge className="bg-green-500">Audience</Badge>
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Sparkles className="h-5 w-5 text-primary" />
        <p>
          Our AI has analyzed the profiles of registered participants and similar events to generate these suggestions.
        </p>
      </div>

      <div className="space-y-4">
        {suggestions.map((suggestion) => (
          <Card key={suggestion.id} className={suggestion.applied ? "bg-muted" : ""}>
            <CardContent className="p-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getTypeBadge(suggestion.type)}
                    <h4 className="font-medium">{suggestion.content}</h4>
                  </div>
                  {suggestion.applied ? (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      Applied
                    </Badge>
                  ) : (
                    <Button size="sm" onClick={() => handleApply(suggestion.id)}>
                      Apply
                    </Button>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  <strong>Why:</strong> {suggestion.reason}
                </p>
                {!suggestion.applied && (
                  <div className="flex items-center gap-2 self-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleFeedback(suggestion.id, true)}
                    >
                      <ThumbsUp className="h-4 w-4" />
                      <span className="sr-only">Helpful</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleFeedback(suggestion.id, false)}
                    >
                      <ThumbsDown className="h-4 w-4" />
                      <span className="sr-only">Not helpful</span>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-center">
        <Button variant="outline">
          <Sparkles className="mr-2 h-4 w-4" />
          Generate More Suggestions
        </Button>
      </div>
    </div>
  )
}

