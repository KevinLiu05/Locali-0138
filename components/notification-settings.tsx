"use client"

import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { db } from "@/lib/firebase"
import { doc, updateDoc } from "firebase/firestore"
import { useAuth } from "@/components/auth-provider"

export function NotificationSettings() {
  const [isLoading, setIsLoading] = useState(false)
  const [emailFrequency, setEmailFrequency] = useState("daily")
  const [settings, setSettings] = useState({
    eventReminders: true,
    eventUpdates: true,
    newEvents: true,
    eventRecommendations: true,
    marketingEmails: false,
    appNotifications: true,
    browserNotifications: false,
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
          notificationSettings: settings,
          emailFrequency: emailFrequency,
        })
        console.log("Settings saved successfully!")
      } else {
        console.warn("User not authenticated. Settings not saved.")
      }
    } catch (error) {
      console.error("Error saving settings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Email Notifications</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="event-reminders" className="flex-1">
              Event reminders
              <p className="text-sm font-normal text-muted-foreground">
                Receive reminders about upcoming events you've registered for
              </p>
            </Label>
            <Switch
              id="event-reminders"
              checked={settings.eventReminders}
              onCheckedChange={() => handleToggle("eventReminders")}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="event-updates" className="flex-1">
              Event updates
              <p className="text-sm font-normal text-muted-foreground">
                Receive updates about events you're registered for
              </p>
            </Label>
            <Switch
              id="event-updates"
              checked={settings.eventUpdates}
              onCheckedChange={() => handleToggle("eventUpdates")}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="new-events" className="flex-1">
              New events
              <p className="text-sm font-normal text-muted-foreground">
                Receive notifications about new events that match your interests
              </p>
            </Label>
            <Switch id="new-events" checked={settings.newEvents} onCheckedChange={() => handleToggle("newEvents")} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="event-recommendations" className="flex-1">
              Event recommendations
              <p className="text-sm font-normal text-muted-foreground">
                Receive AI-powered event recommendations based on your interests
              </p>
            </Label>
            <Switch
              id="event-recommendations"
              checked={settings.eventRecommendations}
              onCheckedChange={() => handleToggle("eventRecommendations")}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="marketing-emails" className="flex-1">
              Marketing emails
              <p className="text-sm font-normal text-muted-foreground">Receive marketing and promotional emails</p>
            </Label>
            <Switch
              id="marketing-emails"
              checked={settings.marketingEmails}
              onCheckedChange={() => handleToggle("marketingEmails")}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Email Digest Frequency</h3>
        <RadioGroup value={emailFrequency} onValueChange={setEmailFrequency}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="realtime" id="realtime" />
            <Label htmlFor="realtime">Real-time</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="daily" id="daily" />
            <Label htmlFor="daily">Daily digest</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="weekly" id="weekly" />
            <Label htmlFor="weekly">Weekly digest</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Push Notifications</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="app-notifications" className="flex-1">
              In-app notifications
              <p className="text-sm font-normal text-muted-foreground">Receive notifications within the application</p>
            </Label>
            <Switch
              id="app-notifications"
              checked={settings.appNotifications}
              onCheckedChange={() => handleToggle("appNotifications")}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="browser-notifications" className="flex-1">
              Browser notifications
              <p className="text-sm font-normal text-muted-foreground">
                Receive browser notifications when the app is open
              </p>
            </Label>
            <Switch
              id="browser-notifications"
              checked={settings.browserNotifications}
              onCheckedChange={() => handleToggle("browserNotifications")}
            />
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

