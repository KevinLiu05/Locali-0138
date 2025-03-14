import { EventsGrid } from "@/components/events-grid"
import { RecommendedEvents } from "@/components/recommended-events"
import { UpcomingEvents } from "@/components/upcoming-events"
import { DashboardWelcome } from "@/components/dashboard-welcome"

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <DashboardWelcome />
      <RecommendedEvents />
      <UpcomingEvents />

      {/* Add a heading for all events */}
      <h2 className="text-2xl font-bold">All Events</h2>

      <EventsGrid />
    </div>
  )
}

