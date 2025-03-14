"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, Send, ArrowRight, Calendar, Clock, Users, MapPin, Check, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth-provider"
import { db } from "@/lib/firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { useToast } from "@/components/ui/use-toast"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
}

type RoomBookingState = {
  date: string | null
  timeSlot: string | null
  capacity: number | null
  selectedRoom: string | null
  eventName: string | null
  eventContent: string | null
  step: number
}

export function EventCreationChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Welcome to the Locali AI Event Creation System! What date would you like to book a room? (Please enter in M/D/YYYY format)",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [bookingState, setBookingState] = useState<RoomBookingState>({
    date: null,
    timeSlot: null,
    capacity: null,
    selectedRoom: "Katharyn Alvord Gerlich Theater",
    eventName: null,
    eventContent: null,
    step: 1
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [savingEvent, setSavingEvent] = useState(false)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const validateDate = (dateStr: string): boolean => {
    // Simple date validation
    const dateRegex = /^\d{1,2}\/\d{1,2}\/\d{4}$/
    return dateRegex.test(dateStr)
  }

  const validateTimeSlot = (timeStr: string): boolean => {
    // Accept various time formats
    return timeStr.includes("-") && timeStr.length > 3
  }

  const validateCapacity = (capacityStr: string): boolean => {
    return !isNaN(Number(capacityStr)) && Number(capacityStr) > 0
  }

  const suggestContentForEvent = (eventName: string): string => {
    // Format matches the example in the problem statement
    let content = `Suggested content for ${eventName}:\n\n`

    if (eventName.toLowerCase().includes("deep learning") || eventName.toLowerCase().includes("ai")) {
      content += `1. Introduction to Deep Learning (15 min)
What is Deep Learning?
Difference between ML, DL, and AI
Applications (Computer Vision, NLP, Generative AI)

2. Key Architectures & Models (20 min)
CNNs (Convolutional Neural Networks) – Image processing
RNNs, LSTMs, Transformers – Sequential data & NLP
GANs, Diffusion Models – Generative AI & Image Synthesis

3. Hands-on Demo (30-45 min)
Image Classification with CNNs (e.g., TensorFlow/Keras)
Text Generation with Transformers (e.g., OpenAI's GPT)
Fine-tuning a Pre-trained Model (e.g., Hugging Face)

4. Real-World Use Cases (20 min)
Deep Learning in Industry (Finance, Healthcare, Autonomous Driving)
Challenges: Data Bias, Interpretability, Compute Cost

5. Networking & Q&A (15-30 min)
Discuss career paths in Deep Learning
Open discussion on industry trends & challenges`
    } else if (eventName.toLowerCase().includes("machine learning") || eventName.toLowerCase().includes("ml")) {
      content += `1. Introduction to Machine Learning (15 min)
Overview of ML concepts and types
Supervised vs. Unsupervised Learning
Common applications

2. ML Algorithms Overview (20 min)
Classification algorithms (Decision Trees, SVM, etc.)
Regression techniques
Clustering and dimensionality reduction

3. Practical Workshop (30 min)
Building a simple ML model with scikit-learn
Data preprocessing techniques
Model evaluation and validation

4. Advanced Topics & Discussion (20 min)
Ensemble methods
Feature engineering best practices
Ethical considerations in ML

5. Q&A and Networking (15 min)
Career opportunities in ML
Resources for further learning`
    } else {
      content += `1. Introduction and Overview (15 min)
Welcome and introduction to the topic
Key concepts and terminology
Relevance to UW community

2. Main Presentation (30 min)
Core content related to "${eventName}"
Recent developments and research
Real-world applications

3. Interactive Session (20 min)
Hands-on activities
Group discussions
Q&A opportunities

4. Next Steps (15 min)
Resources for further learning
Future events and connections
Practical applications

5. Networking (20 min)
Meet fellow attendees
Connect with speakers and experts
Refreshments and informal discussions`
    }

    return content
  }

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Add a small delay to simulate processing
    await new Promise((resolve) => setTimeout(resolve, 800))

    const assistantResponse: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "",
    }

    // Handle different steps of the booking process
    switch (bookingState.step) {
      case 1: // Date entry
        if (validateDate(input)) {
          setBookingState(prev => ({ ...prev, date: input, step: 2 }))
          assistantResponse.content = `Great! I've noted the date: ${input}. Now, please enter the time slot (e.g., 10:00 AM - 12:00 PM or 11:00am-12:00pm):`;
        } else {
          assistantResponse.content = "Please enter a valid date in M/D/YYYY format.";
        }
        break;

      case 2: // Time slot entry
        if (validateTimeSlot(input)) {
          let formattedTime = input;
          // Format time if needed
          if (input.includes("am") || input.includes("pm")) {
            formattedTime = input.replace(/am/i, " AM").replace(/pm/i, " PM");
          }
          
          setBookingState(prev => ({ ...prev, timeSlot: formattedTime, step: 3 }))
          assistantResponse.content = `Got it! Time slot: ${formattedTime}. Now, what is your required room capacity (number of people)?`;
        } else {
          assistantResponse.content = "Please enter a valid time slot format (e.g., 10:00 AM - 12:00 PM).";
        }
        break;

      case 3: // Capacity entry
        if (validateCapacity(input)) {
          const capacity = Number(input);
          setBookingState(prev => ({ ...prev, capacity, step: 4 }))
          assistantResponse.content = `Room Katharyn Alvord Gerlich Theater in Meany Hall for the Performing Arts has been successfully booked!

What is the name of your event?`;
        } else {
          assistantResponse.content = "Please enter a valid capacity (a positive number).";
        }
        break;

      case 4: // Event name entry
        setBookingState(prev => ({ ...prev, eventName: input, step: 5 }))
        assistantResponse.content = `Would you like me to generate a suggested content agenda for your ${input} event?`;
        break;

      case 5: // Suggest content
        if (input.toLowerCase().includes('yes') || input.toLowerCase().includes('sure') || input.toLowerCase().includes('ok')) {
          const content = suggestContentForEvent(bookingState.eventName || "");
          setBookingState(prev => ({ ...prev, eventContent: content, step: 6 }))
          assistantResponse.content = content;
        } else {
          setBookingState(prev => ({ ...prev, step: 6 }))
          assistantResponse.content = "No problem! Your event has been created. Would you like to add any additional details or make any changes?";
        }
        break;

      default:
        assistantResponse.content = "Your booking has been finalized. Click 'Continue to Event Details' to complete the process.";
        break;
    }

    setMessages((prev) => [...prev, assistantResponse])
    setIsLoading(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleContinue = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create an event.",
        variant: "destructive",
      });
      router.push("/auth/signin");
      return;
    }

    try {
      setSavingEvent(true);
      
      // Parse the date string (MM/DD/YYYY) to a proper date format
      const dateParts = bookingState.date?.split('/') || [];
      const month = parseInt(dateParts[0]) - 1; // JS months are 0-indexed
      const day = parseInt(dateParts[1]);
      const year = parseInt(dateParts[2]);
      const eventDate = new Date(year, month, day);
      const formattedDate = eventDate.toISOString().split('T')[0]; // YYYY-MM-DD
      
      // Parse time slot (e.g. "10:00 AM - 12:00 PM")
      const timeSlot = bookingState.timeSlot || "";
      const timeParts = timeSlot.split('-').map(t => t.trim());
      let startTime = timeParts[0];
      let endTime = timeParts[1] || "";
      
      // Create event document in Firestore
      const eventData = {
        title: bookingState.eventName || "Untitled Event",
        description: bookingState.eventContent || "No description provided",
        date: formattedDate,
        time: timeSlot,
        startTime: startTime,
        endTime: endTime,
        location: `Katharyn Alvord Gerlich Theater, Room ${bookingState.capacity}`,
        capacity: bookingState.capacity,
        attendeeCount: 0,
        tags: ["AI", "Deep Learning", "Workshop"],
        hostId: user.uid,
        hostName: user.name || user.displayName || "Event Host",
        hostPhotoURL: user.photoURL || "",
        isPublic: true,
        requiresRegistration: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // Add the document to Firestore
      const docRef = await addDoc(collection(db, "events"), eventData);
      
      toast({
        title: "Event Created",
        description: "Your event has been created successfully!",
      });

      // Navigate to the event page
      router.push(`/events/${docRef.id}`);
    } catch (error) {
      console.error("Error creating event:", error);
      toast({
        title: "Error",
        description: "Failed to create your event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSavingEvent(false);
    }



