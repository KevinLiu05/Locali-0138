"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/components/auth-provider"
import { Loader2 } from "lucide-react"
import { storage } from "@/lib/firebase"
import { getDownloadURL, ref, uploadBytesResumable, deleteObject } from "firebase/storage"
import { useToast } from "@/components/ui/use-toast"

export function ProfileForm() {
  const { user, updateUserData } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    bio: "",
    organization: "",
    photoURL: "",
  })

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.name || "",
        email: user.email || "",
        bio: user.bio || "AI enthusiast and researcher with a focus on NLP and ethics.",
        organization: user.organization || "Tech University",
        photoURL: user.photoURL || "",
      })
    }
  }, [user])

  if (!user) {
    return <div>Loading profile...</div>
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value || "",
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await updateUserData({
        name: formData.fullName,
        bio: formData.bio,
        organization: formData.organization,
        photoURL: formData.photoURL,
      })

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
          await updateUserData({ photoURL: downloadURL })

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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={formData.photoURL} alt={formData.fullName} />
          <AvatarFallback>{formData.fullName?.charAt(0) || "U"}</AvatarFallback>
        </Avatar>
        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="avatarUpload" />
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
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" name="bio" value={formData.bio} onChange={handleChange} />
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
  )
}

