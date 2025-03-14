"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Calendar, UserCircle, Settings, PlusCircle, Brain } from "lucide-react"

export function Sidebar() {
  const pathname = usePathname()

  const routes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      label: "Events",
      icon: Calendar,
      href: "/dashboard/events",
      active: pathname === "/dashboard/events" || pathname.startsWith("/dashboard/events/"),
    },
    {
      label: "Profile",
      icon: UserCircle,
      href: "/dashboard/profile",
      active: pathname === "/dashboard/profile",
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/dashboard/settings",
      active: pathname === "/dashboard/settings",
    },
  ]

  return (
    <div className="hidden border-r bg-muted/40 md:block md:w-64 lg:w-72">
      <div className="flex h-full flex-col px-3 py-4">
        <Link href="/" className="flex items-center gap-2 px-2 mb-6">
          <Brain className="h-6 w-6" />
          <span className="font-bold">Locali</span>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Button
              key={route.href}
              variant={route.active ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start",
                route.active ? "bg-secondary" : "hover:bg-transparent hover:underline",
              )}
              asChild
            >
              <Link href={route.href}>
                <route.icon className="mr-2 h-5 w-5" />
                {route.label}
              </Link>
            </Button>
          ))}
        </div>
        <div className="mt-auto">
          <Button className="w-full" asChild>
            <Link href="/dashboard/events/create">
              <PlusCircle className="mr-2 h-5 w-5" />
              Create Event
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

