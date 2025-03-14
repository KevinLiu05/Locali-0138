import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, Trophy } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

const hackathonEvents = [
  {
    id: "1",
    title: "UW AI Hackathon 2024",
    image: "/placeholder.svg?height=200&width=400",
    date: "Apr 5-7, 2024",
    location: "UW Innovation Hub",
    attendees: 250,
    prize: "$10,000",
    link: "/events/uw-ai-hackathon",
  },
  {
    id: "2",
    title: "ML Models Challenge",
    image: "/placeholder.svg?height=200&width=400",
    date: "Apr 15-16, 2024",
    location: "UW Engineering Center",
    attendees: 150,
    prize: "$5,000",
    link: "/events/ml-challenge",
  },
  {
    id: "3",
    title: "LLM Hackfest",
    image: "/placeholder.svg?height=200&width=400",
    date: "Apr 20-21, 2024",
    location: "UW Tech Center",
    attendees: 180,
    prize: "$7,500",
    link: "/events/llm-hackfest",
  },
  {
    id: "4",
    title: "AI Solutions Sprint",
    image: "/placeholder.svg?height=200&width=400",
    date: "Apr 25-26, 2024",
    location: "UW Startup Hub",
    attendees: 200,
    prize: "$8,000",
    link: "/events/ai-sprint",
  },
]

export function HackathonEvents() {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Upcoming Hackathons</h2>
        <Link href="/events/hackathons" className="text-sm text-muted-foreground hover:underline">
          View all
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {hackathonEvents.map((event) => (
          <Card key={event.id} className="overflow-hidden">
            <Link href={event.link}>
              <div className="aspect-[2/1] relative">
                <Image src={event.image || "/placeholder.svg"} alt={event.title} fill className="object-cover" />
              </div>
              <CardHeader className="p-4">
                <CardTitle className="line-clamp-2 text-lg">{event.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    {event.date}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4" />
                    {event.location}
                  </div>
                  <div className="flex items-center">
                    <Users className="mr-2 h-4 w-4" />
                    {event.attendees} participants
                  </div>
                  <div className="flex items-center">
                    <Trophy className="mr-2 h-4 w-4" />
                    Prize pool: {event.prize}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Badge variant="default">Hackathon</Badge>
              </CardFooter>
            </Link>
          </Card>
        ))}
      </div>
    </section>
  )
}

