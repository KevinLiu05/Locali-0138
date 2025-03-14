"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useEvents } from "@/lib/firebase-hooks"
import Link from "next/link"

export function EventBanner() {
  const { events, loading } = useEvents(5)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [bannerEvents, setBannerEvents] = useState<any[]>([])

  useEffect(() => {
    if (!loading && events.length > 0) {
      // Filter for featured events or just use the first few
      const featuredEvents = events.filter((event) => event.featured || event.image).slice(0, 3)

      if (featuredEvents.length > 0) {
        setBannerEvents(featuredEvents)
      } else {
        setBannerEvents(events.slice(0, 3))
      }
    }
  }, [events, loading])

  useEffect(() => {
    if (bannerEvents.length <= 1) return

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerEvents.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [bannerEvents.length])

  const nextSlide = () => {
    if (bannerEvents.length <= 1) return
    setCurrentSlide((prev) => (prev + 1) % bannerEvents.length)
  }

  const prevSlide = () => {
    if (bannerEvents.length <= 1) return
    setCurrentSlide((prev) => (prev - 1 + bannerEvents.length) % bannerEvents.length)
  }

  if (loading || bannerEvents.length === 0) {
    return (
      <div className="relative h-[400px] bg-black/10 animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent">
          <div className="container mx-auto px-4 h-full flex items-center">
            <div className="max-w-lg space-y-4">
              <div className="h-10 w-3/4 bg-gray-300 rounded"></div>
              <div className="h-6 w-full bg-gray-300 rounded"></div>
              <div className="h-6 w-2/3 bg-gray-300 rounded"></div>
              <div className="h-10 w-32 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-[400px] bg-black">
      {bannerEvents.map((event, index) => (
        <div
          key={event.id}
          className={`absolute inset-0 transition-opacity duration-500 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={event.image || "/placeholder.svg?height=400&width=1200"}
            alt={event.title}
            fill
            className="object-cover"
            priority={index === 0}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent">
            <div className="container mx-auto px-4 h-full flex items-center">
              <div className="max-w-lg text-white space-y-4">
                <h2 className="text-4xl font-bold">{event.title}</h2>
                <p className="text-lg">{event.description?.substring(0, 120)}...</p>
                <Button size="lg" asChild>
                  <Link href={`/events/${event.id}`}>View Details</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {bannerEvents.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
            onClick={prevSlide}
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
            onClick={nextSlide}
          >
            <ChevronRight className="h-8 w-8" />
          </Button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
            {bannerEvents.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${index === currentSlide ? "bg-white" : "bg-white/50"}`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

