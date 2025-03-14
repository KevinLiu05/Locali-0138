"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { InterestsSelection } from "@/components/interests-selection"
import { auth, db } from "@/lib/firebase"
import { doc, updateDoc } from "firebase/firestore"

export function OnboardingForm({ userData, onSave, setCurrentStep }) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState(userData)
  const router = useRouter()

  const handleNext = async () => {
    if (step === 1) {
      setStep(2)
    } else if (step === 2) {
      try {
        const user = auth.currentUser
        if (!user) return

        const userRef = doc(db, "users", user.uid)
        await updateDoc(userRef, {
          ...formData, // ✅ Save all form data
          updatedAt: new Date().toISOString(),
        })

        onSave(formData) // ✅ Ensure UI updates before moving on
        router.push("/dashboard")
      } catch (error) {
        console.error("Error saving user data:", error)
      }
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div className="space-y-6">
      {step === 1 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input id="role" name="role" value={formData.role} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="organization">Organization</Label>
              <Input id="organization" name="organization" value={formData.organization} onChange={handleChange} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" name="bio" value={formData.bio} onChange={handleChange} />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <Label>Select your interests</Label>
          <InterestsSelection
            value={formData.interests}
            onChange={(newInterests) => setFormData((prev) => ({ ...prev, interests: newInterests }))}
          />
        </div>
      )}

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={handleBack} disabled={step === 1}>
          Back
        </Button>
        <Button type="button" onClick={handleNext}>
          {step === 2 ? "Complete" : "Next"}
        </Button>
      </div>
    </div>
  )
}

