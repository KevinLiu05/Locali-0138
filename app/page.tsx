import { EventBanner } from "@/components/event-banner"
import { EventCategories } from "@/components/event-categories"
import { FeaturedEvents } from "@/components/featured-events"
import { UpcomingEvents } from "@/components/upcoming-events"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <EventBanner />
        <div className="container mx-auto px-4 py-8 space-y-12">
          <EventCategories />
          <FeaturedEvents />
          <UpcomingEvents />
        </div>
      </main>
      <Footer />
    </div>
  )
}

