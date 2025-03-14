"use client"

import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Loader2, Download } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { db } from "@/lib/firebase"
import { doc, updateDoc } from "firebase/firestore"
import { useAuth } from "@/components/auth-provider"

export function PrivacySettings() {
  const [isLoading, setIsLoading] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [settings, setSettings] = useState({
    profileVisibility: true,
    showAttendance: true,
    allowTagging: true,
    allowDataCollection: true,
    allowPersonalization: true,
  })

  const { user } = useAuth()

  const handleToggle = (key: keyof typeof settings) => {
    setSettings({
      ...settings,
      [key]: !settings[key],
    })
  }

  const handleSave = async () => {
    setIsLoading(true)

    try {
      if (user) {
        const userRef = doc(db, "users", user.uid)
        await updateDoc(userRef, {
          privacySettings: settings,
        })
        console.log("Privacy settings updated successfully!")
      } else {
        console.warn("User not authenticated. Cannot save settings.")
      }
    } catch (error) {
      console.error("Error updating privacy settings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportData = async () => {
    setIsExporting(true)

    // Simulate data export
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsExporting(false)
    alert("Your data has been exported. Check your email for the download link.")
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Profile Privacy</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="profile-visibility" className="flex-1">
              Public profile
              <p className="text-sm font-normal text-muted-foreground">Make your profile visible to other users</p>
            </Label>
            <Switch
              id="profile-visibility"
              checked={settings.profileVisibility}
              onCheckedChange={() => handleToggle("profileVisibility")}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="show-attendance" className="flex-1">
              Show event attendance
              <p className="text-sm font-normal text-muted-foreground">
                Allow others to see which events you're attending
              </p>
            </Label>
            <Switch
              id="show-attendance"
              checked={settings.showAttendance}
              onCheckedChange={() => handleToggle("showAttendance")}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="allow-tagging" className="flex-1">
              Allow tagging
              <p className="text-sm font-normal text-muted-foreground">
                Allow other users to tag you in events and posts
              </p>
            </Label>
            <Switch
              id="allow-tagging"
              checked={settings.allowTagging}
              onCheckedChange={() => handleToggle("allowTagging")}
            />
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Data & Personalization</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="allow-data-collection" className="flex-1">
              Data collection
              <p className="text-sm font-normal text-muted-foreground">
                Allow us to collect usage data to improve your experience
              </p>
            </Label>
            <Switch
              id="allow-data-collection"
              checked={settings.allowDataCollection}
              onCheckedChange={() => handleToggle("allowDataCollection")}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="allow-personalization" className="flex-1">
              AI personalization
              <p className="text-sm font-normal text-muted-foreground">
                Allow our AI to personalize your event recommendations
              </p>
            </Label>
            <Switch
              id="allow-personalization"
              checked={settings.allowPersonalization}
              onCheckedChange={() => handleToggle("allowPersonalization")}
            />
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Your Data</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="font-medium">Export your data</h4>
              <p className="text-sm text-muted-foreground">Download a copy of all your data</p>
            </div>
            <Button variant="outline" onClick={handleExportData} disabled={isExporting}>
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Export Data
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </div>
  )
}

