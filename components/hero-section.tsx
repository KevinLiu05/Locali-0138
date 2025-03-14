import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

export function HeroSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                AI-Powered Events for Tech Communities
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Discover, create, and optimize AI events with personalized recommendations and intelligent assistance.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button asChild size="lg">
                <Link href="/auth/signup">Get Started</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/#features">Learn More</Link>
              </Button>
            </div>
          </div>
          <Image
            src="/placeholder.svg?height=550&width=550"
            width={550}
            height={550}
            alt="AI Events Platform"
            className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square"
          />
        </div>
      </div>
    </section>
  )
}

