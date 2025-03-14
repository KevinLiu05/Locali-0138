"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Steps } from "@/components/steps"
import { OnboardingForm } from "@/components/onboarding-form"
import { auth, db } from "../../../lib/firebase"
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore"

export default function OnboardingPage() {
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState("step-1")
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    bio: "",
    fieldOfStudy: "",
    interests: [],
    organization: "",
    photoURL: "",
    role: "",
    attendedEvents: [],
    rsvpedEvents: [],
    createdAt: null,
    updatedAt: null,
  })

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser
      if (!user) return

      const userRef = doc(db, "users", user.uid)
      const userSnap = await getDoc(userRef)

      if (userSnap.exists()) {
        setUserData(userSnap.data()) // ✅ Load existing profile
      } else {
        // ✅ Automatically create user profile if missing
        const newUserProfile = {
          name: user.displayName || "",
          email: user.email || "",
          bio: "",
          fieldOfStudy: "",
          interests: [],
          organization: "",
          photoURL: user.photoURL || "",
          role: "",
          attendedEvents: [],
          rsvpedEvents: [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }
        await setDoc(userRef, newUserProfile)
        setUserData(newUserProfile)
      }
    }

    fetchUserData()
  }, [])

  const saveUserProfile = async (updatedData) => {
    try {
      setLoading(true)
      const user = auth.currentUser
      if (!user) throw new Error("No authenticated user")

      const userRef = doc(db, "users", user.uid)
      const userSnap = await getDoc(userRef)

      const userProfile = {
        name: updatedData.name || userData.name || "",
        email: user.email,
        bio: updatedData.bio ?? userData.bio ?? "",
        fieldOfStudy: updatedData.fieldOfStudy ?? userData.fieldOfStudy ?? "",
        interests: updatedData.interests ?? userData.interests ?? [],
        organization: updatedData.organization ?? userData.organization ?? "",
        photoURL: updatedData.photoURL ?? userData.photoURL ?? "",
        role: updatedData.role ?? userData.role ?? "", // ✅ Role is now selectable
        attendedEvents: userData.attendedEvents ?? [],
        rsvpedEvents: userData.rsvpedEvents ?? [],
        updatedAt: serverTimestamp(),
        createdAt: userSnap.exists() ? userSnap.data().createdAt : serverTimestamp(),
      }

      await setDoc(userRef, userProfile, { merge: true }) // ✅ Merge updates
      setUserData(userProfile) // ✅ Ensure UI updates

      console.log("✅ Profile saved", userProfile)

      // ✅ Move to next step after Firestore update
      if (currentStep === "step-1") setCurrentStep("step-2")
      else if (currentStep === "step-2") setCurrentStep("step-3")
    } catch (error) {
      console.error("❌ Error saving profile:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-3xl space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
          <h1 className="text-3xl font-bold">Complete Your Profile</h1>
          <p className="text-muted-foreground">Help us personalize your experience by providing some information</p>
        </div>
        <Steps
          steps={[
            { id: "step-1", label: "Personal Info" },
            { id: "step-2", label: "Interests" },
            { id: "step-3", label: "Preferences" },
          ]}
          currentStep={currentStep}
        />
        <Card>
          <CardHeader>
            <CardTitle>Tell us about yourself</CardTitle>
            <CardDescription>This information helps us tailor event recommendations to you</CardDescription>
          </CardHeader>
          <CardContent>
            <OnboardingForm
              userData={userData}
              onSave={saveUserProfile}
              loading={loading}
              setCurrentStep={setCurrentStep}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

