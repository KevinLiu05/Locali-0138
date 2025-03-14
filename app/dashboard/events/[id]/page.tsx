import { EventDetails } from "@/components/event-details"
import { EventActions } from "@/components/event-actions"
import { EventParticipants } from "@/components/event-participants"
import { EventOptimizationSuggestions } from "@/components/event-optimization-suggestions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function EventPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Event Details</h1>
          <p className="text-muted-foreground">View and manage event information</p>
        </div>
        <EventActions eventId={params.id} />
      </div>
      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="participants">Participants</TabsTrigger>
          <TabsTrigger value="optimization">AI Optimization</TabsTrigger>
        </TabsList>
        <TabsContent value="details" className="space-y-4">
          <EventDetails eventId={params.id} />
        </TabsContent>
        <TabsContent value="participants" className="space-y-4">
          <EventParticipants eventId={params.id} />
        </TabsContent>
        <TabsContent value="optimization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI-Driven Optimization</CardTitle>
              <CardDescription>Suggestions to improve your event based on participant profiles</CardDescription>
            </CardHeader>
            <CardContent>
              <EventOptimizationSuggestions eventId={params.id} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

