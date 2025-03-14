"use client"

import { useState } from "react"
import { EventsFilters } from "@/components/events-filters"
import { EventsGrid } from "@/components/events-grid"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlusCircle } from "lucide-react"

export default function EventsPage() {
  const [filters, setFilters] = useState(null)

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Events</h1>
          <p className="text-muted-foreground">Discover and join AI events tailored to your interests</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/events/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Event
          </Link>
        </Button>
      </div>
      <EventsFilters onFilterChange={handleFilterChange} />
      <EventsGrid filters={filters} />
    </div>
  )
}

