"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon, Clock, MapPin, Plus, X, Loader2, ImagePlus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-provider"
import { db, storage } from "@/lib/firebase"
import { collection, addDoc, serverTimestamp, updateDoc, doc } from "firebase/firestore"
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage"
import Image from "next/image"

export function EventCreationForm() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [imageURL, setImageURL] = useState("")
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    category: "",
    startTime: "",
    endTime: "",
    isPublic: true,
    requiresRegistration: true,
    aiOptimization: true,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddTag()
    }
  }

  // Additional image upload validation and processing
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type and size
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File",
        description: "Please upload an image file.",
        variant: "destructive",
      })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 5MB.",
        variant: "destructive",
      })
      return
    }

    setUploadingImage(true)

    try {
      // Create a temporary ID for the event image
      const tempId = Date.now().toString()
      const storageRef = ref(storage, `events/temp_${tempId}`)

      // Upload with metadata
      const metadata = {
        contentType: file.type,
      }

      // Upload the file
      const uploadTask = uploadBytesResumable(storageRef, file, metadata)

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Optional: Handle progress updates if needed
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          console.log(`Upload is ${progress}% done`)
        },
        (error) => {
          console.error("Error uploading image:", error)
          toast({
            title: "Upload Failed",
            description: "Failed to upload event image. Please try again.",
            variant: "destructive",
          })
          setUploadingImage(false)
        },
        async () => {
          // Upload completed successfully, get the download URL with cache busting
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
          const cachedURL = `${downloadURL}?t=${new Date().getTime()}`
          setImageURL(cachedURL)
          setUploadingImage(false)

          toast({
            title: "Upload Complete",
            description: "Event image has been uploaded successfully.",
          })
        },
      )
    } catch (error) {
      console.error("Error handling image upload:", error)
      toast({
        title: "Upload Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
      setUploadingImage(false)
    }
  }

  // Fix event submission to correctly handle images and store event data
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create an event.",
        variant: "destructive",
      })
      return
    }

    if (!date) {
      toast({
        title: "Date Required",
        description: "Please select a date for your event.",
        variant: "destructive",
      })
      return
    }

    if (!formData.startTime || !formData.endTime) {
      toast({
        title: "Time Required",
        description: "Please specify start and end times for your event.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Format the date and time
      const eventDate = date.toISOString().split("T")[0]
      const formattedStartTime = `${formData.startTime}`
      const formattedEndTime = `${formData.endTime}`
      const displayTime = `${formData.startTime} - ${formData.endTime}`

      // Create event document in Firestore
      const eventData = {
        title: formData.title,
        description: formData.description,
        date: eventDate,
        time: displayTime,
        startTime: formattedStartTime,
        endTime: formattedEndTime,
        location: formData.location,
        category: formData.category,
        tags: tags,
        imageURL: imageURL || null, // Ensure null is stored if no image
        isPublic: formData.isPublic,
        requiresRegistration: formData.requiresRegistration,
        aiOptimization: formData.aiOptimization,
        hostId: user.id,
        hostName: user.name || user.displayName,
        hostPhotoURL: user.photoURL,
        attendeeCount: 0,
        attendees: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      const docRef = await addDoc(collection(db, "events"), eventData)

      // If we have an image, move it from temp to permanent storage
      if (imageURL && imageURL.includes("temp_")) {
        const newStorageRef = ref(storage, `events/${docRef.id}/image`)

        // Get the file from the temporary location
        const tempStorageRef = ref(storage, imageURL.split("?")[0]) // Remove cache busting parameter
        const response = await fetch(imageURL)
        const blob = await response.blob()

        // Upload to the new location with metadata
        const metadata = {
          contentType: blob.type,
          customMetadata: {
            eventId: docRef.id,
            timestamp: new Date().toISOString(),
          },
        }

        // Upload to permanent location
        await uploadBytesResumable(newStorageRef, blob, metadata)

        // Get the new URL and update the event document
        const newImageURL = await getDownloadURL(newStorageRef)
        await updateDoc(doc(db, "events", docRef.id), { imageURL: newImageURL })

        // Delete the temporary file
        try {
          await deleteObject(tempStorageRef)
        } catch (error) {
          console.error("Error deleting temporary image:", error)
        }
      }

      toast({
        title: "Event Created",
        description: "Your event has been created successfully.",
      })

      // Redirect to the event page
      router.push(`/events/${docRef.id}`)
    } catch (error) {
      console.error("Error creating event:", error)
      toast({
        title: "Error",
        description: "Failed to create your event. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Event Title</Label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter event title"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe your event"
            className="min-h-[120px]"
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Event Image</Label>
          <div className="mt-2">
            {imageURL ? (
              <div className="relative w-full h-48 rounded-md overflow-hidden">
                <Image
                  src={imageURL || "/placeholder.svg?height=192&width=384"}
                  alt="Event image"
                  fill
                  className="object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => setImageURL("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md h-48">
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="eventImage" />
                <label htmlFor="eventImage" className="cursor-pointer">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    {uploadingImage ? (
                      <>
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <ImagePlus className="h-8 w-8 text-gray-400" />
                        <span className="text-sm text-gray-500">Upload event image</span>
                      </>
                    )}
                  </div>
                </label>
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Time</Label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  className="pl-10"
                  required
                />
              </div>
              <span>to</span>
              <Input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className="flex-1"
                required
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Enter location"
              className="pl-10"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gen-ai">Generative AI</SelectItem>
              <SelectItem value="machine-learning">Machine Learning</SelectItem>
              <SelectItem value="llm">Large Language Models</SelectItem>
              <SelectItem value="computer-vision">Computer Vision</SelectItem>
              <SelectItem value="ai-ethics">AI Ethics</SelectItem>
              <SelectItem value="hackathon">Hackathon</SelectItem>
              <SelectItem value="workshop">Workshop</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Tags</Label>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Add tags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <Button type="button" size="icon" onClick={handleAddTag}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Remove {tag}</span>
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Event Settings</h3>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="public-event">Public Event</Label>
            <p className="text-sm text-muted-foreground">Make this event visible to everyone</p>
          </div>
          <Switch
            id="public-event"
            checked={formData.isPublic}
            onCheckedChange={(checked) => handleSwitchChange("isPublic", checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="registration-required">Registration Required</Label>
            <p className="text-sm text-muted-foreground">Require users to register for this event</p>
          </div>
          <Switch
            id="registration-required"
            checked={formData.requiresRegistration}
            onCheckedChange={(checked) => handleSwitchChange("requiresRegistration", checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="ai-optimization">AI Optimization</Label>
            <p className="text-sm text-muted-foreground">Allow AI to suggest improvements to your event</p>
          </div>
          <Switch
            id="ai-optimization"
            checked={formData.aiOptimization}
            onCheckedChange={(checked) => handleSwitchChange("aiOptimization", checked)}
          />
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Event"
          )}
        </Button>
      </div>
    </form>
  )
}

