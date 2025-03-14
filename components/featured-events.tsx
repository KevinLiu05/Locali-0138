"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { format } from "date-fns"

export function FeaturedEvents() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchFeaturedEvents = async () => {
      try {
        const eventsRef = collection(db, "events")
        const q = query(eventsRef, where("featured", "==", true), orderBy("date", "asc"), limit(4))
        const snapshot = await getDocs(q)

        const fetchedEvents = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        setEvents(fetchedEvents)
      } catch (err) {
        console.error("Error fetching featured events:", err)
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedEvents()
  }, [])

  if (loading) {
    return (
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-8 w-24" />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
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

  if (error) {
    return (
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Featured Events</h2>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Failed to load featured events. Please try again later.</p>
        </div>
      </section>
    )
  }

  if (events.length === 0) {
    return (
      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">Featured Events</h2>
        <p className="text-center text-muted-foreground">No featured events available.</p>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Featured Events</h2>
        <Link href="/events" className="text-sm text-muted-foreground hover:underline">
          View all
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {events.map((event) => (
          <Card key={event.id} className="overflow-hidden">
            {/* Added image display */}
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
                  {event.date ? format(new Date(event.date), "EEEE, MMMM d, yyyy") : "Date TBD"}
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

