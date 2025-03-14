"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { doc, getDoc } from "firebase/firestore"
import { db, storage } from "@/lib/firebase"
import { getDownloadURL, ref, uploadBytesResumable, deleteObject } from "firebase/storage"
import { InterestsSelection } from "@/components/interests-selection"
import { useToast } from "@/components/ui/use-toast"
import { useSearchParams } from "next/navigation"

export default function ProfilePage() {
  const { user, updateUserData } = useAuth()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const defaultTab = searchParams.get("tab") || "profile"

  const [isLoading, setIsLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    fieldOfStudy: "",
    bio: "",
    organization: "University of Washington",
    interests: [] as string[],
    photoURL: "",
    role: "User",
    attendedEvents: [] as string[],
    rsvpedEvents: [] as string[],
    createdAt: null as string | null, // ✅ Use null instead of an empty string
    updatedAt: new Date().toISOString(),
  })

  const isMounted = useRef(true) // ✅ Place this outside of useEffect

  useEffect(() => {
    isMounted.current = true // ✅ Reset on mount

    const loadUserData = async () => {
      if (!user || !isMounted.current) return // ✅ Prevents execution if unmounted

      try {
        const userRef = doc(db, "users", user.id)
        const userDoc = await getDoc(userRef)

        if (!isMounted.current) return // ✅ Prevents state update if unmounted

        if (userDoc.exists()) {
          const userData = userDoc.data()

          console.log("Fetched userData:", userData) // 🔍 Debugging

          setFormData((prev) => ({
            ...prev, // ✅ Preserve existing state
            fullName: userData?.name ?? user?.name ?? "", // ✅ Ensure always a string
            email: user?.email ?? "", // ✅ Ensure always a string
            fieldOfStudy: userData?.fieldOfStudy ?? userData?.fieldOfstudy ?? "", // ✅ Fix casing issues
            bio: userData?.bio ?? "", // ✅ Ensure always a string
            organization: userData?.organization ?? "University of Washington", // ✅ Default value
            interests: Array.isArray(userData?.interests) ? userData.interests : (prev.interests ?? []), // ✅ Always an array
            photoURL: userData?.photoURL ?? user?.photoURL ?? "", // ✅ Ensure always a string
            role: userData?.role ?? "User", // ✅ Ensure role consistency
            attendedEvents: Array.isArray(userData?.attendedEvents)
              ? userData.attendedEvents
              : (prev.attendedEvents ?? []), // ✅ Always an array
            rsvpedEvents: Array.isArray(userData?.rsvpedEvents) ? userData.rsvpedEvents : (prev.rsvpedEvents ?? []), // ✅ Always an array
            createdAt: userData?.createdAt?.seconds
              ? new Date(userData.createdAt.seconds * 1000).toISOString()
              : (prev.createdAt ?? new Date().toISOString()), // ✅ Always ensure a valid timestamp
            updatedAt: new Date().toISOString(),
          }))
        } else {
          setFormData((prev) => ({
            ...prev, // ✅ Preserve existing state
            fullName: user?.name ?? "",
            email: user?.email ?? "",
            fieldOfStudy: "",
            bio: "",
            organization: "University of Washington",
            interests: [],
            photoURL: user?.photoURL ?? "",
            role: "User",
            attendedEvents: [],
            rsvpedEvents: [],
            createdAt: prev.createdAt ?? new Date().toISOString(), // ✅ Ensure createdAt has a valid value
            updatedAt: new Date().toISOString(),
          }))
        }
      } catch (error) {
        console.error("Error loading user data:", error)
        toast({
          title: "Error",
          description: "Failed to load your profile data. Please try again.",
          variant: "destructive",
        })
      }
    }

    loadUserData()

    return () => {
      isMounted.current = false // ✅ Prevents memory leaks
    }
  }, [user, toast])

  useEffect(() => {
    console.log("Updated formData state:", formData)
  }, [formData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value ?? "", // Ensure it's never undefined
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const userRef = doc(db, "users", user.id)
      const userSnap = await getDoc(userRef)

      // ✅ Ensure the Firestore Schema Matches the Test User Format
      const updatedProfile = {
        uid: user.id,
        name: formData.fullName,
        email: user.email,
        bio: formData.bio || userSnap.data()?.bio || "",
        fieldOfStudy: formData.fieldOfStudy || userSnap.data()?.fieldOfStudy || "",
        organization: formData.organization || userSnap.data()?.organization || "University of Washington",
        interests: formData.interests || userSnap.data()?.interests || [],
        photoURL: formData.photoURL || userSnap.data()?.photoURL || "",
        role: userSnap.data()?.role || "User",
        attendedEvents: Array.isArray(userSnap.data()?.attendedEvents) ? userSnap.data()?.attendedEvents : [],
        rsvpedEvents: Array.isArray(userSnap.data()?.rsvpedEvents) ? userSnap.data()?.rsvpedEvents : [],
        createdAt:
          userSnap.exists() && userSnap.data()?.createdAt?.seconds
            ? new Date(userSnap.data().createdAt.seconds * 1000).toISOString()
            : (formData.createdAt ?? new Date().toISOString()), // Ensure consistent formatting
        updatedAt: new Date().toISOString(),
      }

      // ✅ Save to Firestore
      await updateUserData(updatedProfile)

      // ✅ Ensure UI Updates
      setFormData(updatedProfile)

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

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
      // Create a proper storage path for profile pictures
      const storageRef = ref(storage, `profile_pictures/${user.id}`)

      // Check if a previous image exists and delete it
      try {
        await getDownloadURL(storageRef)
        // If we get here, the file exists, so delete it
        await deleteObject(storageRef)
      } catch (error) {
        // File doesn't exist, which is fine
      }

      // Upload the file with metadata
      const metadata = {
        contentType: file.type,
        customMetadata: {
          userId: user.id,
          updatedAt: new Date().toISOString(),
        },
      }

      // Upload the file
      const uploadTask = uploadBytesResumable(storageRef, file, metadata)

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Handle progress updates if needed
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          console.log(`Upload is ${progress}% done`)
        },
        (error) => {
          console.error("Error uploading image:", error)
          toast({
            title: "Upload Failed",
            description: "Failed to upload your profile picture. Please try again.",
            variant: "destructive",
          })
          setUploadingImage(false)
        },
        async () => {
          // Upload completed successfully, get the download URL
          // Add cache busting parameter to prevent browser caching
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
          const cachedURL = `${downloadURL}?t=${new Date().getTime()}`

          // Update form data with the new image URL
          setFormData((prev) => ({ ...prev, photoURL: cachedURL }))

          // Save image URL to Firestore
          await updateUserData({
            photoURL: downloadURL,
          })

          toast({
            title: "Upload Complete",
            description: "Your profile picture has been updated.",
          })

          setUploadingImage(false)
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">Manage your profile and preferences</p>
      </div>
      <Tabs defaultValue={defaultTab}>
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="interests">AI Interests</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={formData.photoURL} alt={formData.fullName} />
                    <AvatarFallback>{formData.fullName?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="avatarUpload"
                  />
                  <label htmlFor="avatarUpload">
                    <Button variant="outline" type="button" disabled={uploadingImage} asChild>
                      <span>
                        {uploadingImage ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          "Change Avatar"
                        )}
                      </span>
                    </Button>
                  </label>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" value={formData.email} readOnly disabled />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fieldOfStudy">Field of Study</Label>
                  <Input
                    id="fieldOfStudy"
                    name="fieldOfStudy"
                    value={formData.fieldOfStudy}
                    onChange={handleChange}
                    placeholder="e.g., Computer Science, Data Science, etc."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell us about yourself and your interests in AI"
                    className="min-h-[120px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="organization">Organization</Label>
                  <Input id="organization" name="organization" value={formData.organization} onChange={handleChange} />
                </div>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="interests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your AI Interests</CardTitle>
              <CardDescription>Select topics you're interested in to get personalized recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <InterestsSelection
                user={user}
                value={formData.interests}
                onChange={(newInterests: string[]) => {
                  setFormData((prev) => ({ ...prev, interests: newInterests }))

                  // Save interests to Firestore immediately
                  updateUserData({ interests: newInterests }).catch((error) => {
                    console.error("Error updating interests:", error)
                    toast({
                      title: "Error",
                      description: "Failed to update your interests. Please try again.",
                      variant: "destructive",
                    })
                  })
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

