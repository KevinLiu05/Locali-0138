"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Edit, Share, MoreVertical, Trash, Copy, Calendar } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"
import { db } from "@/lib/firebase"
import { doc, deleteDoc } from "firebase/firestore"

export function EventActions({ eventId, isHost }: { eventId: string; isHost: boolean }) {
  const router = useRouter()
  const { toast } = useToast()
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleEdit = () => {
    if (!isHost) {
      toast({
        title: "Permission Denied",
        description: "Only the event host can edit this event.",
        variant: "destructive",
      })
      return
    }

    router.push(`/dashboard/events/${eventId}/edit`)
  }

  const handleShare = () => {
    // Copy event link to clipboard
    const eventUrl = `${window.location.origin}/events/${eventId}`
    navigator.clipboard.writeText(eventUrl)

    toast({
      title: "Link Copied",
      description: "Event link copied to clipboard!",
    })
  }

  const handleAddToCalendar = () => {
    // Implement calendar integration
    toast({
      title: "Coming Soon",
      description: "Calendar integration will be available soon!",
    })
  }

  const handleDuplicate = () => {
    if (!isHost) {
      toast({
        title: "Permission Denied",
        description: "Only the event host can duplicate this event.",
        variant: "destructive",
      })
      return
    }

    // Implement event duplication
    router.push(`/dashboard/events/create?duplicate=${eventId}`)
  }

  const handleDelete = () => {
    if (!isHost) {
      toast({
        title: "Permission Denied",
        description: "Only the event host can delete this event.",
        variant: "destructive",
      })
      return
    }

    // Show delete confirmation
    setShowDeleteAlert(true)
  }

  const confirmDelete = async () => {
    if (!isHost) {
      toast({
        title: "Permission Denied",
        description: "Only the event host can delete this event.",
        variant: "destructive",
      })
      return
    }

    setIsDeleting(true)

    try {
      // Delete the event document
      await deleteDoc(doc(db, "events", eventId))

      toast({
        title: "Event Deleted",
        description: "Your event has been successfully deleted.",
      })

      // Redirect to events page
      router.push("/dashboard/events")
    } catch (error) {
      console.error("Error deleting event:", error)
      toast({
        title: "Error",
        description: "Failed to delete the event. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setShowDeleteAlert(false)
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        {isHost && (
          <Button variant="outline" onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        )}
        <Button variant="outline" onClick={handleShare}>
          <Share className="mr-2 h-4 w-4" />
          Share
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleAddToCalendar}>
              <Calendar className="mr-2 h-4 w-4" />
              Add to Calendar
            </DropdownMenuItem>
            {isHost && (
              <>
                <DropdownMenuItem onClick={handleDuplicate}>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the event and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

