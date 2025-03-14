import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

const trendingEvents = [
  {
    id: "1",
    title: "AI Research Symposium",
    image: "/placeholder.svg?height=200&width=400",
    date: "Mar 15, 2024",
    location: "UW Computer Science Building",
    attendees: 120,
    category: "Gen AI",
    link: "/events/ai-symposium",
  },
  {
    id: "2",
    title: "Deep Learning Workshop",
    image: "/placeholder.svg?height=200&width=400",
    date: "Mar 20, 2024",
    location: "UW Engineering Building",
    attendees: 75,
    category: "Machine Learning",
    link: "/events/dl-workshop",
  },
  {
    id: "3",
    title: "NLP Study Group",
    image: "/placeholder.svg?height=200&width=400",
    date: "Mar 25, 2024",
    location: "UW Library",
    attendees: 45,
    category: "LLM",
    link: "/events/nlp-group",
  },
  {
    id: "4",
    title: "AI Ethics Panel",
    image: "/placeholder.svg?height=200&width=400",
    date: "Mar 30, 2024",
    location: "UW Auditorium",
    attendees: 200,
    category: "Gen AI",
    link: "/events/ai-ethics",
  },
]

export function TrendingEvents() {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Top Trending at UW</h2>
        <Link href="/events/trending" className="text-sm text-muted-foreground hover:underline">
          View all
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {trendingEvents.map((event) => (
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
                    {event.attendees} attendees
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Badge variant="secondary">{event.category}</Badge>
              </CardFooter>
            </Link>
          </Card>
        ))}
      </div>
    </section>
  )
}

