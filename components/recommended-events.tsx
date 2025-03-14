"use client"

import { useRecommendedEvents } from "@/lib/firebase-hooks"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { useAuth } from "@/components/auth-provider"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"

export function RecommendedEvents() {
  const { user } = useAuth()
  const { recommendations, loading, error } = useRecommendedEvents(user?.uid, 3)

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">Recommended for You</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <Skeleton className="h-40 w-full" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
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
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Recommended for You</h2>
        <p className="text-muted-foreground">Unable to load recommendations.</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Recommended for You</h2>
        <p className="text-muted-foreground">Sign in to see personalized event recommendations.</p>
      </div>
    )
  }

  if (recommendations.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Recommended for You</h2>
        <p className="text-muted-foreground">
          No recommended events found. Update your AI interests in your profile to get personalized recommendations.
        </p>
        <Button variant="outline" asChild>
          <Link href="/dashboard/profile">Update Interests</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold tracking-tight">Recommended for You</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {recommendations.map((event) => (
          <Card key={event.id} className="relative overflow-hidden">
            {/* Match percentage badge */}
            <div className="absolute top-2 right-2 z-10">
              <Badge variant="secondary" className="bg-black/70 text-white">
                {event.matchScore}% Match
              </Badge>
            </div>

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

            <CardHeader>
              <CardTitle>{event.title}</CardTitle>
              <div className="flex flex-wrap gap-1 mt-2">
                {event.tags?.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-muted-foreground">
                  <Calendar className="mr-2 h-4 w-4" />
                  {event.date ? format(new Date(event.date), "EEE, MMM d, yyyy") : "Date TBD"}
                </div>

                <div className="flex items-center text-muted-foreground">
                  <MapPin className="mr-2 h-4 w-4" />
                  <span className="line-clamp-1">{event.location || "Location TBD"}</span>
                </div>

                {typeof event.attendeeCount !== "undefined" && (
                  <div className="flex items-center text-muted-foreground">
                    <Users className="mr-2 h-4 w-4" />
                    {event.attendeeCount} attending
                  </div>
                )}
              </div>
            </CardContent>

            <CardFooter>
              <Button asChild className="w-full">
                <Link href={`/events/${event.id}`}>View Details</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

