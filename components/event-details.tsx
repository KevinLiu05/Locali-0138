"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Clock, MapPin, Plus } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function EventDetails({ eventId }: { eventId: string }) {
  // Mock event data
  const [event, setEvent] = useState({
    id: eventId,
    title: "Deep Learning Workshop",
    description:
      "Join us for an interactive workshop on deep learning techniques and applications. We'll cover neural networks, backpropagation, and practical implementations.",
    date: "2024-03-15",
    time: "14:00",
    endTime: "16:00",
    location: "Tech Building, Room 302",
    tags: ["Deep Learning", "Neural Networks", "AI"],
    attendees: 45,
    speakers: [
      {
        name: "Dr. Jane Smith",
        role: "AI Researcher",
        organization: "Tech University",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      {
        name: "Prof. John Davis",
        role: "Computer Science Professor",
        organization: "Innovation College",
        avatar: "/placeholder.svg?height=40&width=40",
      },
    ],
    agenda: [
      {
        time: "14:00 - 14:15",
        title: "Introduction to Deep Learning",
        description: "Overview of key concepts and history",
      },
      {
        time: "14:15 - 14:45",
        title: "Neural Network Architectures",
        description: "Exploring different network structures and their applications",
      },
      {
        time: "14:45 - 15:30",
        title: "Hands-on Workshop",
        description: "Building a simple neural network",
      },
      {
        time: "15:30 - 16:00",
        title: "Q&A and Networking",
        description: "Open discussion and networking opportunity",
      },
    ],
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title</Label>
              <Input id="title" value={event.title} readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={event.description} readOnly />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                  <Input id="date" type="date" value={event.date} readOnly />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Input id="time" type="time" value={event.time} readOnly />
                  <span>to</span>
                  <Input id="endTime" type="time" value={event.endTime} readOnly />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <div className="flex items-center">
                <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                <Input id="location" value={event.location} readOnly />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-medium mb-4">Speakers</h3>
          <div className="space-y-4">
            {event.speakers.map((speaker, index) => (
              <div key={index} className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={speaker.avatar} alt={speaker.name} />
                  <AvatarFallback>{speaker.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{speaker.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {speaker.role}, {speaker.organization}
                  </p>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Speaker
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-medium mb-4">Agenda</h3>
          <div className="space-y-4">
            {event.agenda.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="font-medium">{item.title}</p>
                  <Badge variant="outline">{item.time}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{item.description}</p>
                {index < event.agenda.length - 1 && <Separator className="my-2" />}
              </div>
            ))}
            <Button variant="outline" className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Agenda Item
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

