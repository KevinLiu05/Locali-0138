"use client"

import { useEvents } from "@/lib/firebase-hooks"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Calendar, MapPin, Users } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { format, addDays } from "date-fns"

export function UpcomingEvents() {
  const { events, loading, error } = useEvents()

  // Filter to only show upcoming events (next 7 days)
  const today = new Date()
  today.setHours(0, 0, 0, 0) // Set to beginning of day for more accurate comparison
  const nextWeek = addDays(today, 7)
  nextWeek.setHours(23, 59, 59, 999) // Set to end of day for more accurate comparison

  const upcomingEvents = events
    .filter((event) => {
      // Skip events without dates
      if (!event.date) return false

      // Handle different date formats
      let eventDate

      // Handle Firestore timestamp objects
      if (typeof event.date === "object" && event.date !== null && "seconds" in event.date) {
        eventDate = new Date(event.date.seconds * 1000)
      }
      // Handle ISO string or other string formats
      else if (typeof event.date === "string") {
        eventDate = new Date(event.date)
      }
      // Handle date objects
      else if (event.date instanceof Date) {
        eventDate = event.date
      }
      // Skip invalid dates
      else {
        return false
      }

      // Check if the parsed date is valid
      if (isNaN(eventDate.getTime())) return false

      // Check if the event is within the next 7 days
      return eventDate >= today && eventDate <= nextWeek
    })
    .slice(0, 2)

  console.log("Upcoming events count:", upcomingEvents.length)

  if (loading) {
    return (
      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">Upcoming Events</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardHeader className="p-4">
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>
    )
  }

  if (error || upcomingEvents.length === 0) {
    return (
      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">Upcoming Events</h2>
        <p className="text-center text-muted-foreground py-8">No upcoming events in the next 7 days.</p>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Upcoming Events</h2>
      <div className="grid gap-6 md:grid-cols-2">
        {upcomingEvents.map((event) => (
          <Card key={event.id} className="overflow-hidden">
            {/* Image display with consistent height */}
            {(event.image || event.imageURL) && (
              <div className="relative w-full h-40">
                <img
                  src={event.image || event.imageURL}
                  alt={event.title || "Event image"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none"
                  }}
                />
              </div>
            )}
            <CardHeader className="p-4">
              <CardTitle className="line-clamp-2 text-lg">{event.title}</CardTitle>
              <div className="flex flex-wrap gap-1 mt-1">
                {event.tags?.slice(0, 2).map((tag) => (
                  <Badge key={tag} variant="outline" className="font-normal">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-muted-foreground">
                  <Calendar className="mr-2 h-4 w-4" />
                  {event.date
                    ? format(
                        // Handle Firestore timestamp objects
                        typeof event.date === "object" && event.date !== null && "seconds" in event.date
                          ? new Date(event.date.seconds * 1000)
                          : new Date(event.date),
                        "EEEE, MMMM d, yyyy",
                      )
                    : "Date TBD"}
                </div>
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="mr-2 h-4 w-4" />
                  {event.location || "Location TBD"}
                </div>
                {event.attendeeCount && (
                  <div className="flex items-center text-muted-foreground">
                    <Users className="mr-2 h-4 w-4" />
                    {event.attendeeCount} attending
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Button asChild className="w-full">
                <Link href={`/events/${event.id}`}>View Details</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  )
}

