"use client"

import { Button } from "@/components/ui/button"
import { Brain, Cpu, Network, Trophy, Share2, Code, Users, BookOpen } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

const categories = [
  {
    id: "deep-learning",
    name: "Deep Learning",
    icon: Brain,
  },
  {
    id: "machine-learning",
    name: "Machine Learning",
    icon: Cpu,
  },
  {
    id: "nlp",
    name: "NLP",
    icon: Network,
  },
  {
    id: "hackathon",
    name: "Hackathon",
    icon: Trophy,
  },
  {
    id: "research",
    name: "Research",
    icon: BookOpen,
  },
  {
    id: "workshop",
    name: "Workshop",
    icon: Code,
  },
  {
    id: "meetup",
    name: "Meetup",
    icon: Users,
  },
  {
    id: "project-sharing",
    name: "Project Sharing",
    icon: Share2,
  },
]

export function EventCategories() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  return (
    <section className="py-6">
      <div className="flex space-x-4 overflow-x-auto pb-4">
        {categories.map((category) => {
          const Icon = category.icon
          return (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              className="flex-shrink-0"
              onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
              asChild
            >
              <Link href={`/events?category=${category.id}`}>
                <Icon className="mr-2 h-4 w-4" />
                {category.name}
              </Link>
            </Button>
          )
        })}
      </div>
    </section>
  )
}

