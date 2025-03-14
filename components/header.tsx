"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, MapPin, Brain } from "lucide-react"
import { CreateEventDialog } from "@/components/create-event-dialog"
import { useState } from "react"
import { useAuth } from "@/components/auth-provider"

export function Header() {
  const [showCreateEvent, setShowCreateEvent] = useState(false)
  const { user } = useAuth()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <Brain className="h-6 w-6" />
              <span className="text-xl font-bold">UW AI Events</span>
            </Link>
            <div className="hidden md:flex items-center space-x-2 max-w-sm">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search events" className="pl-8" />
              </div>
              <div className="relative">
                <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="University of Washington" className="pl-8 w-[200px]" />
              </div>
            </div>
          </div>

          <nav className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/contact">Contact</Link>
            </Button>
            <Button variant="default" onClick={() => setShowCreateEvent(true)}>
              Create Event
            </Button>
            <Button variant="ghost" asChild>
              <Link href={user ? "/dashboard" : "/auth/signin"}>My Dashboard</Link>
            </Button>
            {!user ? (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/auth/signin">Log in</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/auth/signup">Sign up</Link>
                </Button>
              </>
            ) : null}
          </nav>
        </div>
      </div>
      <CreateEventDialog open={showCreateEvent} onOpenChange={setShowCreateEvent} />
    </header>
  )
}

