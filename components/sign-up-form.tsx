"use client"

import type React from "react"

import { useAuth } from "@/components/auth-provider"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function SignUpForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [existingAccount, setExistingAccount] = useState(false)

  const { toast } = useToast()
  const auth = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setExistingAccount(false)

    try {
      await auth.signUp(email, password, name)
      toast({
        title: "Account created",
        description: "Your account has been created successfully. Welcome to Locali!",
      })
      router.push("/auth/onboarding")
    } catch (error: any) {
      console.error("Failed to sign up:", error)

      // Check if it's an email-already-in-use error
      if (error.code === "auth/email-already-in-use") {
        setExistingAccount(true)
        setError("An account with this email already exists. Please sign in instead.")
        toast({
          variant: "destructive",
          title: "Account already exists",
          description: "An account with this email already exists. Please sign in instead.",
        })
      } else {
        setError(error.message || "Failed to create account. Please try again.")
        toast({
          variant: "destructive",
          title: "Sign Up Failed",
          description: error.message || "Failed to create your account. Please try again.",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && !existingAccount && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {existingAccount && (
        <Alert>
          <AlertTitle>Account Exists</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <p>{error}</p>
            <Button variant="outline" size="sm" onClick={() => router.push("/auth/signin")} className="mt-2">
              Go to Sign In
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="m@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading || !email || !password || !name}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating account...
          </>
        ) : (
          "Sign Up"
        )}
      </Button>
    </form>
  )
}

