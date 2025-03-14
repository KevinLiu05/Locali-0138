import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, Users, Sparkles, Calendar } from "lucide-react"

export function FeaturesSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-muted" id="features">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground">Features</div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">AI-Powered Event Platform</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Locali uses artificial intelligence to create better event experiences for tech communities
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <Brain className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Personalized Recommendations</CardTitle>
              <CardDescription>Discover events tailored to your interests and past engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Our AI analyzes your interests and past event attendance to suggest events you'll love, powered by AWS
                Personalize.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Sparkles className="h-10 w-10 text-primary mb-2" />
              <CardTitle>AI-Assisted Event Creation</CardTitle>
              <CardDescription>Create better events with AI guidance and suggestions</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Our chatbot helps you structure your event, suggests titles, agendas, and discussion topics based on
                successful events.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Users className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Dynamic Event Optimization</CardTitle>
              <CardDescription>Refine your events based on participant profiles</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                As participants join, our AI suggests additional topics and agenda adjustments to better match the
                collective interests of attendees.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Calendar className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Smart Event Management</CardTitle>
              <CardDescription>Streamlined tools for organizing and attending events</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Receive intelligent reminders, updates, and post-event feedback that improves future recommendations.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

