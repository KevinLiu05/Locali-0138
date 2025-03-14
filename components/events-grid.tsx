"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, query, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Calendar, Clock, MapPin } from "lucide-react"
import { format } from "date-fns"
import { useAuth } from "@/components/auth-provider"
import { calculateEventMatch } from "@/lib/firebase-hooks"
import { doc, getDoc } from "firebase/firestore"

export function EventsGrid({ filters }) {
  const [events, setEvents] = useState([])
  const [filteredEvents, setFilteredEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const [userInterests, setUserInterests] = useState([])

  // Fetch user profile to get interests
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.uid) return

      try {
        const userDoc = doc(db, "users", user.uid)
        const userSnapshot = await getDoc(userDoc)

        if (userSnapshot.exists()) {
          const userData = userSnapshot.data()
          setUserInterests(userData.interests || [])
        }
      } catch (error) {
        console.error("Error fetching user profile:", error)
      }
    }

    fetchUserProfile()
  }, [user])

  // Fetch all events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsRef = collection(db, "events")
        const q = query(eventsRef, orderBy("date", "asc"))
        const snapshot = await getDocs(q)

        const fetchedEvents = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        setEvents(fetchedEvents)
        setFilteredEvents(fetchedEvents)
      } catch (error) {
        console.error("Error fetching events:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  // Apply filters when filter state changes
  useEffect(() => {
    if (!events.length || !filters) return

    // Start with all events
    let results = events.map((event) => {
      // Calculate match score for each event
      const eventTags = event.tags || []
      const matchScore = calculateEventMatch(userInterests, eventTags)
      return { ...event, matchScore }
    })

    // Apply threshold filter
    if (typeof filters.threshold === "number") {
      results = results.filter((event) => event.matchScore >= filters.threshold)
    }

    // Apply search filter
    if (filters.search) {
      const query = filters.search.toLowerCase()
      results = results.filter(
        (event) => event.title?.toLowerCase().includes(query) || event.description?.toLowerCase().includes(query),
      )
    }

    // Apply date filter
    if (filters.date && filters.date !== "any") {
      const today = new Date()

      switch (filters.date) {
        case "today":
          results = results.filter((event) => {
            const eventDate = new Date(event.date)
            return eventDate.toDateString() === today.toDateString()
          })
          break
        case "this-week":
          const endOfWeek = new Date(today)
          endOfWeek.setDate(today.getDate() + (6 - today.getDay()))
          results = results.filter((event) => {
            const eventDate = new Date(event.date)
            return eventDate >= today && eventDate <= endOfWeek
          })
          break
        case "this-month":
          results = results.filter((event) => {
            const eventDate = new Date(event.date)
            return eventDate.getMonth() === today.getMonth() && eventDate.getFullYear() === today.getFullYear()
          })
          break
        case "next-month":
          const nextMonth = new Date(today)
          nextMonth.setMonth(today.getMonth() + 1)
          results = results.filter((event) => {
            const eventDate = new Date(event.date)
            return eventDate.getMonth() === nextMonth.getMonth() && eventDate.getFullYear() === nextMonth.getFullYear()
          })
          break
      }
    }

    // Apply location filter
    if (filters.location && filters.location !== "any") {
      results = results.filter((event) => {
        const eventLocation = event.location?.toLowerCase() || ""
        switch (filters.location) {
          case "on-campus":
            return (
              eventLocation.includes("campus") || eventLocation.includes("university") || eventLocation.includes("uw")
            )
          case "off-campus":
            return (
              !eventLocation.includes("campus") &&
              !eventLocation.includes("university") &&
              !eventLocation.includes("uw") &&
              !eventLocation.includes("virtual")
            )
          case "virtual":
            return (
              eventLocation.includes("virtual") || eventLocation.includes("online") || eventLocation.includes("zoom")
            )
          default:
            return true
        }
      })
    }

    // Apply tag filters
    if (filters.tags && filters.tags.length > 0) {
      results = results.filter((event) => {
        const eventTags = event.tags || []
        return filters.tags.some((tag) => eventTags.includes(tag))
      })
    }

    // Update filtered events
    setFilteredEvents(results)
  }, [events, filters, userInterests])

  if (loading) {
    return <p>Loading events...</p>
  }

  if (filteredEvents.length === 0) {
    return <p>No events found matching your criteria.</p>
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {filteredEvents.map((event) => (
        <Card key={event.id} className="overflow-hidden relative">
          {/* Match percentage badge - only show if greater than 0 */}
          {event.matchScore > 0 && (
            <div className="absolute top-2 right-2 z-10">
              <Badge variant="secondary" className="bg-black/70 text-white">
                {event.matchScore}% Match
              </Badge>
            </div>
          )}

          {/* Event image - checking multiple possible image field names */}
          {(event.image || event.imageURL) && (
            <div className="relative w-full h-48">
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

          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">{event.title}</CardTitle>
            </div>
            <CardDescription className="flex flex-wrap gap-1 mt-1">
              {event.tags?.map((tag) => (
                <Badge key={tag} variant="outline" className="font-normal">
                  {tag}
                </Badge>
              ))}
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-3">
            <div className="space-y-2 text-sm">
              <div className="flex items-center text-muted-foreground">
                <Calendar className="mr-2 h-4 w-4" />
                {event.date ? format(new Date(event.date), "EEEE, MMMM d, yyyy") : "Date TBD"}
              </div>
              <div className="flex items-center text-muted-foreground">
                <Clock className="mr-2 h-4 w-4" />
                {event.time || "Time TBD"}
              </div>
              <div className="flex items-center text-muted-foreground">
                <MapPin className="mr-2 h-4 w-4" />
                {event.location || "Location TBD"}
              </div>
            </div>
          </CardContent>
          <div className="px-6 pb-6 pt-0">
            <Button asChild className="w-full">
              <Link href={`/events/${event.id}`}>View Details</Link>
            </Button>
          </div>
        </Card>
      ))}
    </div>
  )
}

