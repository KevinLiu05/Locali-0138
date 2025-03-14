"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Users, Search, Home } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { useEvents } from "@/lib/firebase-hooks"
import { format } from "date-fns"
import { useAuth } from "@/components/auth-provider"
import { db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import Image from "next/image"

export default function EventsPage() {
  const { user } = useAuth()
  const { events, loading, error } = useEvents()
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [dateFilter, setDateFilter] = useState("")
  const [userInterests, setUserInterests] = useState<string[]>([])

  // Load user interests for filtering
  useEffect(() => {
    const loadUserInterests = async () => {
      if (!user) return

      try {
        const userRef = doc(db, "users", user.uid)
        const userDoc = await getDoc(userRef)

        if (userDoc.exists() && userDoc.data().interests) {
          setUserInterests(userDoc.data().interests)
        }
      } catch (error) {
        console.error("Error loading user interests:", error)
      }
    }

    loadUserInterests()
  }, [user])

  const filteredEvents = events.filter((event) => {
    // Search filter
    const matchesSearch =
      !searchQuery ||
      event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.tags && event.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase())))

    // Category filter
    const matchesCategory =
      !categoryFilter || categoryFilter === "all" || (event.tags && event.tags.includes(categoryFilter))

    // Date filter
    let matchesDate = true
    if (dateFilter && dateFilter !== "any" && event.date) {
      const today = new Date()
      const eventDate = new Date(event.date)

      if (dateFilter === "today") {
        matchesDate =
          eventDate.getDate() === today.getDate() &&
          eventDate.getMonth() === today.getMonth() &&
          eventDate.getFullYear() === today.getFullYear()
      } else if (dateFilter === "this-week") {
        const weekFromNow = new Date(today)
        weekFromNow.setDate(today.getDate() + 7)
        matchesDate = eventDate >= today && eventDate <= weekFromNow
      } else if (dateFilter === "this-month") {
        matchesDate = eventDate.getMonth() === today.getMonth() && eventDate.getFullYear() === today.getFullYear()
      }
    }

    return matchesSearch && matchesCategory && matchesDate
  })

  // Calculate match scores for events based on user interests
  const eventsWithMatchScores = filteredEvents.map((event) => {
    if (!user || !userInterests.length || !event.tags) {
      return { ...event, matchScore: 0 }
    }

    // Calculate match score based on overlap between user interests and event tags
    const matchingTags = event.tags.filter((tag) => userInterests.includes(tag))
    const matchScore = Math.round((matchingTags.length / Math.max(1, userInterests.length)) * 100)

    return { ...event, matchScore }
  })

  // Sort events by match score (if user is logged in) or by date
  const sortedEvents = user
    ? eventsWithMatchScores.sort((a, b) => b.matchScore - a.matchScore)
    : eventsWithMatchScores.sort((a, b) => {
        if (!a.date) return 1
        if (!b.date) return -1
        return new Date(a.date).getTime() - new Date(b.date).getTime()
      })

  const categories = [
    "Deep Learning",
    "NLP",
    "Computer Vision",
    "AI Ethics",
    "Reinforcement Learning",
    "Machine Learning",
    "Research",
    "Hackathon",
    "Workshop",
    "Meetup",
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">UW AI Events</h1>
            <p className="text-muted-foreground">Discover AI events at the University of Washington</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Date</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="this-week">This Week</SelectItem>
                  <SelectItem value="this-month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {(searchQuery || categoryFilter || dateFilter) && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {sortedEvents.length} of {events.length} events
              </p>
              {(searchQuery || categoryFilter || dateFilter) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("")
                    setCategoryFilter("")
                    setDateFilter("")
                  }}
                >
                  Clear filters
                </Button>
              )}
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
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
        ) : error ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold">Error loading events</h2>
            <p className="text-muted-foreground mt-2">Please try again later.</p>
          </div>
        ) : sortedEvents.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold">No events found</h2>
            <p className="text-muted-foreground mt-2">Try adjusting your filters or check back later.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sortedEvents.map((event) => (
              <Card key={event.id} className="overflow-hidden flex flex-col">
                {(event.image || event.imageURL) && (
                  <div className="relative w-full h-40">
                    <Image
                      src={event.image || event.imageURL || "/placeholder.svg"}
                      alt={event.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <CardHeader className="p-4">
                  <div className="flex justify-between items-start">
                    <CardTitle className="line-clamp-2 text-lg">{event.title}</CardTitle>
                    {user && event.matchScore > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {event.matchScore}% Match
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {event.tags?.map((tag: string) => (
                      <Badge key={tag} variant="outline" className="font-normal">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0 flex-grow">
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
                    {(event.attendeeCount !== undefined || event.attendeeCount > 0) && (
                      <div className="flex items-center text-muted-foreground">
                        <Users className="mr-2 h-4 w-4" />
                        {event.attendeeCount} attending
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0 mt-auto">
                  <Button asChild className="w-full">
                    <Link href={`/events/${event.id}`}>View Details</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

