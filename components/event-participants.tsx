"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Mail, Download, UserPlus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

type Participant = {
  id: string
  name: string
  email: string
  avatar: string
  status: "registered" | "attended" | "cancelled"
  registrationDate: string
}

export function EventParticipants({ eventId }: { eventId: string }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [inviteEmail, setInviteEmail] = useState("")

  // Mock participants data
  const participants: Participant[] = [
    {
      id: "1",
      name: "Alex Johnson",
      email: "alex@example.com",
      avatar: "/placeholder.svg?height=40&width=40",
      status: "registered",
      registrationDate: "2024-02-28",
    },
    {
      id: "2",
      name: "Sam Wilson",
      email: "sam@example.com",
      avatar: "/placeholder.svg?height=40&width=40",
      status: "attended",
      registrationDate: "2024-02-25",
    },
    {
      id: "3",
      name: "Taylor Smith",
      email: "taylor@example.com",
      avatar: "/placeholder.svg?height=40&width=40",
      status: "registered",
      registrationDate: "2024-03-01",
    },
    {
      id: "4",
      name: "Jordan Lee",
      email: "jordan@example.com",
      avatar: "/placeholder.svg?height=40&width=40",
      status: "cancelled",
      registrationDate: "2024-02-20",
    },
    {
      id: "5",
      name: "Casey Brown",
      email: "casey@example.com",
      avatar: "/placeholder.svg?height=40&width=40",
      status: "registered",
      registrationDate: "2024-03-02",
    },
  ]

  const filteredParticipants = participants.filter(
    (participant) =>
      participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      participant.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleInvite = () => {
    // Implement invitation logic
    alert(`Invitation sent to ${inviteEmail}`)
    setInviteEmail("")
  }

  const handleExport = () => {
    // Implement export logic
    alert("Participant list exported")
  }

  const handleEmailAll = () => {
    // Implement email all logic
    alert("Email sent to all participants")
  }

  const getStatusBadge = (status: Participant["status"]) => {
    switch (status) {
      case "registered":
        return <Badge variant="outline">Registered</Badge>
      case "attended":
        return <Badge>Attended</Badge>
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>
      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search participants..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" onClick={handleEmailAll}>
            <Mail className="mr-2 h-4 w-4" />
            Email All
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Invite
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Participant</DialogTitle>
                <DialogDescription>Send an invitation to join this event</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    placeholder="Enter email address"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleInvite}>Send Invitation</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Participant</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Registration Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredParticipants.length > 0 ? (
              filteredParticipants.map((participant) => (
                <TableRow key={participant.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={participant.avatar} alt={participant.name} />
                        <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{participant.name}</p>
                        <p className="text-sm text-muted-foreground">{participant.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(participant.status)}</TableCell>
                  <TableCell>{new Date(participant.registrationDate).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <Mail className="h-4 w-4" />
                      <span className="sr-only">Email</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                  No participants found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredParticipants.length} of {participants.length} participants
        </p>
      </div>
    </div>
  )
}

