"use client"

import { useState, useEffect } from "react"
import { collection, doc, getDoc, query, where, orderBy, onSnapshot, getDocs, limit } from "firebase/firestore"
import { db } from "./firebase"

export function useEvents({ onlyFeatured = false, upcomingDays = null, limitCount = null } = {}) {
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
        
        // Add limit if specified
        if (limitCount) {
          queryConstraints.push(limit(limitCount))
        }

        const q = query(eventsRef, ...queryConstraints)
        
        // Set up real-time listener
        const unsubscribe = onSnapshot(q, (snapshot) => {
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
          setLoading(false)
        }, (err) => {
          console.error("Error in events snapshot:", err)
          setError(err as Error)
          setLoading(false)
        })

        return () => unsubscribe()
      } catch (err) {
        console.error("Error fetching events:", err)
        setError(err as Error)
        setLoading(false)
      }
    }

    fetchEvents()
  }, [onlyFeatured, upcomingDays, limitCount])

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
  const matchPercentage = Math.round((matchingTags.length / Math.max(1, eventTags.length)) * 100)

  return matchPercentage
}



