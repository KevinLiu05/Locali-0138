"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/components/auth-provider"
import { Loader2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { db } from "@/lib/firebase"
import { doc, deleteDoc } from "firebase/firestore"

export function AccountSettings() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsLoading(false)
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
  }

  const handleDeleteAccount = async () => {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      // Implement account deletion logic
      if (user?.uid) {
        try {
          setIsLoading(true)
          const userDoc = doc(db, "users", user.uid)
          await deleteDoc(userDoc)
          // Optionally, sign the user out or redirect them
          console.log("Account deleted successfully")
        } catch (error) {
          console.error("Error deleting account:", error)
        } finally {
          setIsLoading(false)
        }
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user?.email || ""} readOnly />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" defaultValue={user?.name || ""} />
          </div>
        </div>
        <div className="flex justify-end">
          <Button>Save Changes</Button>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Change Password</h3>
        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          </div>
        </form>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="2fa">Enable Two-Factor Authentication</Label>
            <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
          </div>
          <Switch id="2fa" />
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Danger Zone</h3>
        <div className="rounded-md border border-destructive/50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-destructive">Delete Account</h4>
              <p className="text-sm text-muted-foreground">Permanently delete your account and all of your data</p>
            </div>
            <Button variant="destructive" onClick={handleDeleteAccount} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Account"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

