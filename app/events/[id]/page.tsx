"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Clock, MapPin, Users, ArrowLeft, Heart, Home } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useEvent, useEventAttendees } from "@/lib/firebase-hooks"
import { useAuth } from "@/components/auth-provider"
import { doc, setDoc, deleteDoc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import { useToast } from "@/components/ui/use-toast"
import Image from "next/image"
import Link from "next/link"

export default function EventPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const { event, loading: eventLoading, error: eventError } = useEvent(params.id as string)
  const { attendees, loading: attendeesLoading } = useEventAttendees(params.id as string)
  const [isAttending, setIsAttending] = useState(false)
  const [rsvpLoading, setRsvpLoading] = useState(false)
  const [isHost, setIsHost] = useState(false)

  useEffect(() => {
    // Check if the current user is the host of the event
    if (user && event) {
      setIsHost(user.uid === event.hostId)
    }
  }, [user, event])

  useEffect(() => {
    const checkAttendance = async () => {
      if (!user || !params.id) return

      try {
        const attendeeRef = doc(db, "events", params.id as string, "attendees", user.uid)
        const attendeeDoc = await getDoc(attendeeRef)
        setIsAttending(attendeeDoc.exists())
      } catch (error) {
        console.error("Error checking attendance:", error)
      }
    }

    checkAttendance()
  }, [user, params.id])

  const handleRSVP = async () => {
    if (!user || !params.id) {
      router.push("/auth/signin?redirect=" + encodeURIComponent(`/events/${params.id}`))
      return
    }

    setRsvpLoading(true)

    try {
      const eventId = params.id as string
      const attendeeRef = doc(db, "events", eventId, "attendees", user.uid)
      const userRef = doc(db, "users", user.uid)

      if (isAttending) {
        // Cancel RSVP
        await deleteDoc(attendeeRef)

        // Remove event from user's rsvpedEvents array
        await updateDoc(userRef, {
          rsvpedEvents: arrayRemove(eventId),
        })

        // Decrement attendee count
        await updateDoc(doc(db, "events", eventId), {
          attendeeCount: (event.attendeeCount || 0) - 1,
        })

        setIsAttending(false)
        toast({
          title: "RSVP Cancelled",
          description: "You have cancelled your RSVP for this event.",
        })
      } else {
        // RSVP to event
        await setDoc(attendeeRef, {
          userId: user.uid,
          name: user.name || user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          timestamp: new Date(),
        })

        // Add event to user's rsvpedEvents array
        await updateDoc(userRef, {
          rsvpedEvents: arrayUnion(eventId),
        })

        // Increment attendee count
        await updateDoc(doc(db, "events", eventId), {
          attendeeCount: (event.attendeeCount || 0) + 1,
        })

        setIsAttending(true)
        toast({
          title: "RSVP Confirmed",
          description: "You have successfully RSVP'd to this event.",
        })
      }
    } catch (error) {
      console.error("Error updating RSVP:", error)
      toast({
        title: "Error",
        description: "Failed to update your RSVP. Please try again.",
        variant: "destructive",
      })
    } finally {
      setRsvpLoading(false)
    }
  }

  if (eventLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => router.back()} className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Home
              </Link>
            </Button>
          </div>

          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-6 w-1/2" />

          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full" />
            </div>
            <div>
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (eventError || !event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Home
            </Link>
          </Button>
        </div>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">Event not found</h2>
          <p className="text-muted-foreground mt-2">The event you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => router.push("/events")} className="mt-6">
            Browse Events
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Home
            </Link>
          </Button>
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight">{event.title}</h1>
          <div className="flex flex-wrap gap-2 mt-2">
            {event.tags?.map((tag: string) => (
              <Badge key={tag} variant="outline" className="font-normal">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            {(event.image || event.imageURL) && (
              <div className="relative w-full h-64 rounded-lg overflow-hidden">
                <Image
                  src={event.image || event.imageURL || "/placeholder.svg"}
                  alt={event.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            <Card>
              <CardContent className="p-6">
                <div className="prose max-w-none dark:prose-invert">
                  <p>{event.description}</p>
                </div>
              </CardContent>
            </Card>

            {event.agenda && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Agenda</h3>
                  <div className="space-y-4">
                    {event.agenda.map((item: any, index: number) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <p className="font-medium">{item.title}</p>
                          <Badge variant="outline">{item.time}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                        {index < event.agenda.length - 1 && <Separator className="my-2" />}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {event.speakers && event.speakers.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Speakers</h3>
                  <div className="space-y-4">
                    {event.speakers.map((speaker: any, index: number) => (
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
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Host information */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Hosted by</h3>
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={event.hostPhotoURL} alt={event.hostName} />
                    <AvatarFallback>{event.hostName?.charAt(0) || "H"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{event.hostName}</p>
                    <p className="text-sm text-muted-foreground">Event Host</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="space-y-2">
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
                    <div className="flex items-center text-muted-foreground">
                      <Users className="mr-2 h-4 w-4" />
                      {attendeesLoading ? "Loading..." : `${event.attendeeCount || attendees.length} attending`}
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    variant={isAttending ? "outline" : "default"}
                    onClick={handleRSVP}
                    disabled={rsvpLoading}
                  >
                    {rsvpLoading ? (
                      "Processing..."
                    ) : isAttending ? (
                      <>
                        <Heart className="mr-2 h-4 w-4 fill-current" />
                        Going
                      </>
                    ) : (
                      <>
                        <Heart className="mr-2 h-4 w-4" />
                        RSVP
                      </>
                    )}
                  </Button>

                  {isHost && (
                    <Button
                      className="w-full mt-2"
                      variant="outline"
                      onClick={() => router.push(`/dashboard/events/${params.id}/edit`)}
                    >
                      Edit Event
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {(isHost || attendees.length > 0) && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Attendees</h3>
                  {attendeesLoading ? (
                    <div className="flex justify-center">
                      <Skeleton className="h-10 w-10 rounded-full" />
                    </div>
                  ) : attendees.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No attendees yet. Be the first to RSVP!</p>
                  ) : (
                    <>
                      <div className="flex flex-wrap gap-2">
                        {attendees.slice(0, 10).map((attendee) => (
                          <Avatar key={attendee.id} title={attendee.name}>
                            <AvatarImage src={attendee.photoURL} alt={attendee.name} />
                            <AvatarFallback>{attendee.name?.charAt(0) || "A"}</AvatarFallback>
                          </Avatar>
                        ))}
                        {attendees.length > 10 && (
                          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted text-xs">
                            +{attendees.length - 10}
                          </div>
                        )}
                      </div>

                      {isHost && attendees.length > 0 && (
                        <div className="mt-4">
                          <Separator className="my-4" />
                          <h4 className="text-sm font-medium mb-2">Attendee List</h4>
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {attendees.map((attendee) => (
                              <div key={attendee.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage src={attendee.photoURL} alt={attendee.name} />
                                    <AvatarFallback>{attendee.name?.charAt(0) || "A"}</AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm">{attendee.name}</span>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {attendee.timestamp ? format(new Date(attendee.timestamp.toDate()), "MMM d") : ""}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

