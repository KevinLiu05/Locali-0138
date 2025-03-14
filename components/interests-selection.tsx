"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"
import { db } from "@/lib/firebase"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { useToast } from "@/components/ui/use-toast"

interface InterestsSelectionProps {
  user?: any
  value?: string[]
  onChange?: (newInterests: string[]) => void
}

export function InterestsSelection({ user, value, onChange }: InterestsSelectionProps) {
  const [selectedInterests, setSelectedInterests] = useState<string[]>(value || [])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // Sync with external value if provided
  useEffect(() => {
    if (value) {
      setSelectedInterests(value)
      setLoading(false)
    }
  }, [value])

  // Load interests from Firestore only if no external value is provided
  useEffect(() => {
    if (value || !user) {
      return
    }

    const loadUserInterests = async () => {
      const defaultInterests = ["Deep Learning", "NLP", "AI Ethics"]

      if (!user || !user.id) {
        console.log("No user found or user not fully loaded")
        setSelectedInterests(defaultInterests)
        setLoading(false)
        return
      }

      try {
        const userRef = doc(db, "users", user.id)
        const userDoc = await getDoc(userRef)

        if (userDoc.exists()) {
          const userData = userDoc.data()
          if (userData && Array.isArray(userData.interests)) {
            setSelectedInterests(userData.interests)
          } else {
            // Initialize with default interests if missing
            setSelectedInterests(defaultInterests)
            await updateDoc(userRef, {
              interests: defaultInterests,
              updatedAt: new Date(),
            })
          }
        } else {
          // This should not happen as the user document should already exist
          console.error("User document not found in Firestore")
          setSelectedInterests(defaultInterests)
        }
      } catch (error) {
        console.error("Error loading interests:", error)
        setSelectedInterests(defaultInterests)
      } finally {
        setLoading(false)
      }
    }

    loadUserInterests()
  }, [user, value])

  const allInterests = [
    "Deep Learning",
    "NLP",
    "Computer Vision",
    "AI Ethics",
    "Reinforcement Learning",
    "Neural Networks",
    "Machine Learning",
    "Data Science",
    "Robotics",
    "Generative AI",
    "Large Language Models",
    "AI in Healthcare",
    "AI in Finance",
    "AI in Education",
    "Explainable AI",
    "Edge AI",
    "AI Hardware",
    "Quantum Computing",
    "Autonomous Systems",
    "Human-AI Interaction",
  ]

  const toggleInterest = async (interest: string) => {
    let newInterests: string[]
    if (selectedInterests.includes(interest)) {
      newInterests = selectedInterests.filter((i) => i !== interest)
    } else {
      newInterests = [...selectedInterests, interest]
    }

    setSelectedInterests(newInterests)
    if (onChange) onChange(newInterests)

    if (!user || !user.id) {
      // If no user, just update local state
      return
    }

    try {
      const userRef = doc(db, "users", user.id)
      await updateDoc(userRef, {
        interests: newInterests,
        updatedAt: new Date(),
      })
    } catch (error) {
      console.error("Error updating interests:", error)
      toast({
        title: "Error",
        description: "Failed to update interests. Please try again.",
        variant: "destructive",
      })
      // Revert local state if server update fails
      setSelectedInterests(value || [])
    }
  }

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {allInterests.map((interest) => {
              const isSelected = selectedInterests.includes(interest)
              return (
                <Badge
                  key={interest}
                  variant={isSelected ? "default" : "outline"}
                  className={`cursor-pointer ${isSelected ? "bg-primary" : ""}`}
                  onClick={() => toggleInterest(interest)}
                >
                  {isSelected && <Check className="mr-1 h-3 w-3" />}
                  {interest}
                </Badge>
              )
            })}
          </div>
          <p className="text-sm text-muted-foreground">
            Selected {selectedInterests.length} of {allInterests.length} interests
          </p>
        </>
      )}
    </div>
  )
}

