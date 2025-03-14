"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, query, orderBy, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Calendar, Clock, MapPin, Users } from "lucide-react"
import { format } from "date-fns"
import { useAuth } from "@/components/auth-provider"
import { calculateEventMatch } from "@/lib/firebase-hooks"
import { doc, getDoc } from "firebase/firestore"
import { Skeleton } from "@/components/ui/skeleton"
import Image from "next/image"

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

  // Fetch all events with live updates
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsRef = collection(db, "events")
        const q = query(eventsRef, orderBy("date", "asc"))
        
        // Set up real-time listener for events collection
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const fetchedEvents = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          
          setEvents(fetchedEvents)
          setFilteredEvents(fetchedEvents)
          setLoading(false)
        }, (error) => {
          console.error("Error in events snapshot:", error)
          setLoading(false)
        })
        
        return () => unsubscribe()
      } catch (error) {
        console.error("Error setting up events listener:", error)
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
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-2/4 mt-2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  if (filteredEvents.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">No events found</h2>
        <p className="text-muted-foreground mt-2">Try adjusting your filters or check back later.</p>
      </div>
    )
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

          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
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
              {(typeof event.attendeeCount !== "undefined" || typeof event.capacity !== "undefined") && (
                <div className="flex items-center text-muted-foreground">
                  <Users className="mr-2 h-4 w-4" />
                  {typeof event.attendeeCount !== "undefined" 
                    ? `${event.attendeeCount} attending` 
                    : `Capacity: ${event.capacity}`}
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="pb-6 pt-0">
            <Button asChild className="w-full">
              <Link href={`/events/${event.id}`}>View Details</Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}


