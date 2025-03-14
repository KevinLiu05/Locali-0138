import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function TestimonialsSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32" id="testimonials">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground">
              Testimonials
            </div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">What Our Users Say</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Hear from students, faculty, and tech professionals who use Locali
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Avatar" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">Jane Doe</CardTitle>
                  <CardDescription>CS Student</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                "The personalized recommendations helped me find AI events I would have never discovered otherwise. I've
                made valuable connections through Locali."
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Avatar" />
                  <AvatarFallback>JS</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">John Smith</CardTitle>
                  <CardDescription>Professor</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                "As a faculty member, I've used Locali to organize AI workshops. The AI-assisted event creation made
                planning much more efficient and effective."
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Avatar" />
                  <AvatarFallback>AP</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">Alex Patel</CardTitle>
                  <CardDescription>ML Engineer</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                "The dynamic event optimization feature is a game-changer. Our meetups are now more engaging because the
                topics evolve based on who's attending."
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

