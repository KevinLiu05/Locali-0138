"use client"

import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlusCircle } from "lucide-react"

export function DashboardWelcome() {
  const { user } = useAuth()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Welcome back, {user?.name || "User"}!</CardTitle>
        <CardDescription>Here's what's happening with your AI events</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <p>You have 3 upcoming events this week</p>
          <p className="text-sm text-muted-foreground">
            Your next event: <span className="font-medium">AI Ethics Workshop</span> on Friday
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/events/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Event
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

