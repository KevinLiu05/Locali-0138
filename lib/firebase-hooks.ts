"use client"

import { useState, useEffect } from "react"
import { collection, doc, getDoc, query, where, orderBy, onSnapshot, getDocs } from "firebase/firestore"
import { db } from "./firebase"

export function useEvents({ onlyFeatured = false, upcomingDays = null } = {}) {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsRef = collection(db, "events")
        const queryConstraints = []

        // Add featured filter if needed
        if (onlyFeatured) {
          queryConstraints.push(where("featured", "==", true))
        }

        // Add sorting by date
        queryConstraints.push(orderBy("date", "asc"))

        const q = query(eventsRef, ...queryConstraints)
        const snapshot = await getDocs(q)

        let fetchedEvents = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        // If fetching upcoming events, filter by date
        if (upcomingDays) {
          const today = new Date()
          const futureDate = new Date()
          futureDate.setDate(today.getDate() + upcomingDays)

          fetchedEvents = fetchedEvents.filter((event) => {
            // Make sure to handle string dates correctly
            const eventDate = typeof event.date === "string" ? new Date(event.date) : event.date

            return eventDate >= today && eventDate <= futureDate
          })
        }

        setEvents(fetchedEvents)
      } catch (err) {
        console.error("Error fetching events:", err)
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [onlyFeatured, upcomingDays])

  return { events, loading, error }
}

export function useEvent(eventId: string | undefined) {
  const [event, setEvent] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!eventId) {
      setLoading(false)
      return
    }

    const eventRef = doc(db, "events", eventId)

    const unsubscribe = onSnapshot(
      eventRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data()

          // Handle image URL if it exists
          if (data.image) {
            data.image = `${data.image.split("?")[0]}?t=${Date.now()}`
          }

          // For backward compatibility with imageURL field
          if (data.imageURL) {
            data.imageURL = `${data.imageURL.split("?")[0]}?t=${Date.now()}`
          }

          setEvent({
            id: docSnap.id,
            ...data,
          })
        } else {
          setEvent(null)
        }
        setLoading(false)
      },
      (err) => {
        console.error("Error in event snapshot:", err)
        setError(err as Error)
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [eventId])

  return { event, loading, error }
}

export function useUserProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const profileRef = doc(db, "users", userId)

    const unsubscribe = onSnapshot(
      profileRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data()

          setProfile({
            id: docSnap.id,
            name: data.name || "",
            email: data.email || "",
            bio: data.bio || "",
            fieldOfStudy: data.fieldOfStudy || "",
            interests: data.interests || [],
            organization: data.organization || "",
            photoURL: data.photoURL ? `${data.photoURL.split("?")[0]}?t=${Date.now()}` : "",
            role: data.role || "User",
            attendedEvents: data.attendedEvents || [],
            rsvpedEvents: data.rsvpedEvents || [],
            updatedAt: data.updatedAt || null,
          })
        } else {
          setProfile(null)
        }
        setLoading(false)
      },
      (err) => {
        setError(err as Error)
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [userId])

  return { profile, loading, error }
}

export function useEventAttendees(eventId: string | undefined) {
  const [attendees, setAttendees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!eventId) {
      setLoading(false)
      return
    }

    const attendeesRef = collection(db, "events", eventId, "attendees")

    const fetchAttendees = async () => {
      try {
        setLoading(true)
        const snapshot = await getDocs(attendeesRef)
        const attendeesList: any[] = []

        for (const attendeeDoc of snapshot.docs) {
          const attendeeData = attendeeDoc.data()

          if (attendeeData.userId) {
            const userRef = doc(db, "users", attendeeData.userId)
            const userSnap = await getDoc(userRef)

            if (userSnap.exists()) {
              const userData = userSnap.data()
              if (userData.photoURL) {
                userData.photoURL = `${userData.photoURL.split("?")[0]}?t=${Date.now()}`
              }

              attendeesList.push({
                id: attendeeDoc.id,
                ...attendeeData,
                user: {
                  id: userSnap.id,
                  ...userData,
                },
              })
            } else {
              attendeesList.push({
                id: attendeeDoc.id,
                ...attendeeData,
              })
            }
          } else {
            attendeesList.push({
              id: attendeeDoc.id,
              ...attendeeData,
            })
          }
        }

        setAttendees(attendeesList)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching attendees:", err)
        setError(err as Error)
        setLoading(false)
      }
    }

    fetchAttendees()

    const unsubscribe = onSnapshot(attendeesRef, fetchAttendees, (err) => {
      console.error("Error in attendees snapshot:", err)
    })

    return () => unsubscribe()
  }, [eventId])

  return { attendees, loading, error }
}

// New hook for featured events (specifically for home page)
export function useFeaturedEvents(limit = 4) {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchFeaturedEvents = async () => {
      try {
        const eventsRef = collection(db, "events")
        const q = query(eventsRef, where("featured", "==", true), orderBy("date", "asc"), limit ? limit : 4)

        const snapshot = await getDocs(q)
        const fetchedEvents = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        console.log("Featured events fetched:", fetchedEvents.length)
        setEvents(fetchedEvents)
      } catch (err) {
        console.error("Error fetching featured events:", err)
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedEvents()
  }, [limit])

  return { events, loading, error }
}

/**
 * Calculate simple match percentage between user interests and event tags
 * @param userInterests Array of user's selected interests
 * @param eventTags Array of event tags
 * @returns Match percentage (0-100)
 */
export function calculateEventMatch(userInterests: string[], eventTags: string[]) {
  if (!userInterests || !userInterests.length || !eventTags || !eventTags.length) {
    return 0
  }

  // Count matching tags
  const matchingTags = eventTags.filter((tag) =>
    userInterests.some((interest) => interest.toLowerCase() === tag.toLowerCase()),
  )

  // Calculate percentage based on matching tags
  const matchPercentage = Math.round((matchingTags.length / eventTags.length) * 100)

  return matchPercentage
}

/**
 * Hook to get recommended events for a user based on their interests
 */
export function useRecommendedEvents(userId: string | undefined, limit = 3) {
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchRecommendedEvents = async () => {
      if (!userId) {
        setLoading(false)
        return
      }

      try {
        // Get user profile
        const userRef = doc(db, "users", userId)
        const userSnap = await getDoc(userRef)

        let userInterests: string[] = []
        if (userSnap.exists() && userSnap.data().interests) {
          userInterests = userSnap.data().interests
        }

        if (userInterests.length === 0) {
          setLoading(false)
          setRecommendations([])
          return
        }

        // Get events
        const eventsRef = collection(db, "events")
        const q = query(eventsRef)
        const snapshot = await getDocs(q)

        const fetchedEvents = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        // Score events based on user interests
        const scoredEvents = fetchedEvents.map((event) => {
          const eventTags = event.tags || []
          const matchScore = calculateEventMatch(userInterests, eventTags)

          return { ...event, matchScore }
        })

        // Sort by match score and take top matches
        const topRecommendations = scoredEvents
          .sort((a, b) => b.matchScore - a.matchScore)
          .filter((event) => event.matchScore > 0)
          .slice(0, limit)

        setRecommendations(topRecommendations)
      } catch (err) {
        console.error("Error getting event recommendations:", err)
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendedEvents()
  }, [userId, limit])

  return { recommendations, loading, error }
}

