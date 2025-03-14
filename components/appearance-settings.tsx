"use client"

import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Loader2, Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { db } from "@/lib/firebase"
import { doc, updateDoc } from "firebase/firestore"
import { useAuth } from "@/components/auth-provider"

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme()
  const [isLoading, setIsLoading] = useState(false)
  const [fontSize, setFontSize] = useState("medium")
  const [reducedMotion, setReducedMotion] = useState(false)
  const [highContrast, setHighContrast] = useState(false)
  const { user } = useAuth()

  const handleSave = async () => {
    setIsLoading(true)

    try {
      if (user) {
        const userDocRef = doc(db, "users", user.uid)
        await updateDoc(userDocRef, {
          theme: theme,
          fontSize: fontSize,
          reducedMotion: reducedMotion,
          highContrast: highContrast,
        })
        console.log("Settings saved to Firestore!")
      } else {
        console.warn("User not logged in. Settings not saved.")
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
        <h3 className="text-lg font-medium">Theme</h3>
        <div className="flex items-center gap-4">
          <Button
            variant={theme === "light" ? "default" : "outline"}
            className="flex items-center gap-2"
            onClick={() => setTheme("light")}
          >
            <Sun className="h-4 w-4" />
            Light
          </Button>
          <Button
            variant={theme === "dark" ? "default" : "outline"}
            className="flex items-center gap-2"
            onClick={() => setTheme("dark")}
          >
            <Moon className="h-4 w-4" />
            Dark
          </Button>
          <Button
            variant={theme === "system" ? "default" : "outline"}
            className="flex items-center gap-2"
            onClick={() => setTheme("system")}
          >
            <Monitor className="h-4 w-4" />
            System
          </Button>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Text Size</h3>
        <RadioGroup value={fontSize} onValueChange={setFontSize}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="small" id="small" />
            <Label htmlFor="small">Small</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="medium" id="medium" />
            <Label htmlFor="medium">Medium</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="large" id="large" />
            <Label htmlFor="large">Large</Label>
          </div>
        </RadioGroup>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Accessibility</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="reduced-motion"
              checked={reducedMotion}
              onChange={(e) => setReducedMotion(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="reduced-motion">Reduce motion</Label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="high-contrast"
              checked={highContrast}
              onChange={(e) => setHighContrast(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="high-contrast">High contrast</Label>
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Language</h3>
        <Select defaultValue="en">
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="es">Spanish</SelectItem>
            <SelectItem value="fr">French</SelectItem>
            <SelectItem value="de">German</SelectItem>
            <SelectItem value="zh">Chinese</SelectItem>
          </SelectContent>
        </Select>
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

