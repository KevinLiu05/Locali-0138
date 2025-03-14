"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  fetchSignInMethodsForEmail,
} from "firebase/auth"
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"

type User = {
  id: string
  uid?: string // For compatibility with both auth and Firestore
  name: string
  email: string
  photoURL?: string
  fieldOfStudy?: string
  bio?: string
  organization?: string
  interests?: string[]
  rsvpedEvents?: string[]
}

type AuthContextType = {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  signOut: () => Promise<void>
  updateUserData: (data: Partial<Omit<User, "id" | "uid">>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get user document from Firestore
          const userRef = doc(db, "users", firebaseUser.uid)
          const userDoc = await getDoc(userRef)

          if (userDoc.exists()) {
            // User exists in Firestore, use that data
            const userData = userDoc.data()
            setUser({
              id: firebaseUser.uid,
              uid: firebaseUser.uid, // Add uid for compatibility
              name: userData.name || firebaseUser.displayName || "",
              email: userData.email || firebaseUser.email || "",
              photoURL: userData.photoURL || firebaseUser.photoURL || "/placeholder.svg?height=40&width=40",
              fieldOfStudy: userData.fieldOfStudy || "",
              bio: userData.bio || "",
              organization: userData.organization || "University of Washington",
              interests: userData.interests || [],
              rsvpedEvents: userData.rsvpedEvents || [],
            })

            // Update lastLogin timestamp
            await updateDoc(userRef, {
              lastLogin: serverTimestamp(),
            })
          } else {
            // User exists in Auth but not in Firestore, create user doc
            const userData = {
              name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
              email: firebaseUser.email || "",
              photoURL: firebaseUser.photoURL || "/placeholder.svg?height=40&width=40",
              fieldOfStudy: "",
              bio: "",
              organization: "University of Washington",
              interests: [],
              rsvpedEvents: [],
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
              lastLogin: serverTimestamp(),
            }

            await setDoc(userRef, userData)

            setUser({
              id: firebaseUser.uid,
              uid: firebaseUser.uid,
              ...userData,
            })
          }
        } catch (error) {
          console.error("Error fetching user data:", error)
        }
      } else {
        setUser(null)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error) {
      console.error("Error signing in:", error)
      throw error
    }
  }

  const signUp = async (email: string, password: string, name: string) => {
    try {
      // Check if user with this email already exists
      const methods = await fetchSignInMethodsForEmail(auth, email)
      if (methods && methods.length > 0) {
        throw { code: "auth/email-already-in-use", message: "This email is already in use. Please sign in instead." }
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Update Firebase Auth display name
      await updateProfile(user, { displayName: name })

      // Create user document in Firestore with proper defaults
      const userData = {
        name: name,
        email: email,
        photoURL: `/placeholder.svg?height=40&width=40`,
        fieldOfStudy: "",
        bio: "",
        organization: "University of Washington",
        interests: [],
        rsvpedEvents: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
      }

      await setDoc(doc(db, "users", user.uid), userData)
    } catch (error: any) {
      console.error("Error signing up:", error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
      setUser(null)
    } catch (error) {
      console.error("Error signing out:", error)
      throw error
    }
  }

  const updateUserData = async (data: Partial<Omit<User, "id" | "uid">>) => {
    if (!user || !auth.currentUser) throw new Error("No authenticated user")

    try {
      const userRef = doc(db, "users", auth.currentUser.uid)

      // Add updatedAt timestamp
      const updateData = {
        ...data,
        updatedAt: serverTimestamp(),
      }

      await updateDoc(userRef, updateData)

      // Update local state
      setUser((prev) => (prev ? { ...prev, ...data } : null))
    } catch (error) {
      console.error("Error updating user data:", error)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        updateUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

