import { EventCreationForm } from "@/components/event-creation-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EventCreationChatbot } from "@/components/event-creation-chatbot"

export default function CreateEventPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Event</h1>
        <p className="text-muted-foreground">Create a new AI event for your community</p>
      </div>

      <Tabs defaultValue="form">
        <TabsList>
          <TabsTrigger value="form">Standard Form</TabsTrigger>
          <TabsTrigger value="ai">AI-Assisted</TabsTrigger>
        </TabsList>
        <TabsContent value="form" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
              <CardDescription>Fill out the form below to create your event</CardDescription>
            </CardHeader>
            <CardContent>
              <EventCreationForm />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI-Assisted Event Creation</CardTitle>
              <CardDescription>
                Our AI will help you structure your event based on your goals and target audience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EventCreationChatbot />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

