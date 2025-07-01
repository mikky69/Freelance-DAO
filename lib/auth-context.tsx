"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface User {
  id: string
  email?: string
  walletAddress?: string
  name: string
  avatar?: string
  isVerified: boolean
  accountType: "freelancer" | "client"
  role: "freelancer" | "client"
  profile?: {
    title?: string
    skills?: string[]
    hourlyRate?: number
    completedJobs?: number
    rating?: number
    company?: string
    projectsPosted?: number
  }
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  isWalletConnected: boolean
  signIn: (email: string, password: string, role: "freelancer" | "client") => Promise<boolean>
  signUp: (email: string, password: string, name: string, role: "freelancer" | "client") => Promise<boolean>
  signOut: () => void
  connectWallet: (address: string) => void
  disconnectWallet: () => void
  updateUser: (updates: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const isAuthenticated = !!user
  const isWalletConnected = !!user?.walletAddress

  useEffect(() => {
    checkExistingSession()
  }, [])

  const checkExistingSession = async () => {
    try {
      const savedUser = localStorage.getItem("freelancedao_user")
      const walletConnected = localStorage.getItem("walletConnected")
      const walletAddress = localStorage.getItem("walletAddress")

      if (savedUser) {
        const userData = JSON.parse(savedUser)
        if (walletConnected === "true" && walletAddress) {
          userData.walletAddress = walletAddress
        }
        setUser(userData)
      }
    } catch (error) {
      console.error("Error checking session:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const signIn = async (email: string, password: string, role: "freelancer" | "client"): Promise<boolean> => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const userData: User = {
        id: "user_123",
        email,
        name: role === "freelancer" ? "Sarah Johnson" : "Michael Chen",
        avatar: "/placeholder.svg?height=40&width=40",
        isVerified: true,
        accountType: role,
        role,
        profile:
          role === "freelancer"
            ? {
                title: "Full-Stack Developer",
                skills: ["React", "Node.js", "TypeScript"],
                hourlyRate: 75,
                completedJobs: 47,
                rating: 4.9,
              }
            : {
                company: "TechCorp Inc.",
                projectsPosted: 12,
                rating: 4.8,
              },
      }

      const walletConnected = localStorage.getItem("walletConnected")
      const walletAddress = localStorage.getItem("walletAddress")
      if (walletConnected === "true" && walletAddress) {
        userData.walletAddress = walletAddress
      }

      setUser(userData)
      localStorage.setItem("freelancedao_user", JSON.stringify(userData))
      toast.success(`Welcome back, ${userData.name}!`)
      return true
    } catch (error) {
      toast.error("Failed to sign in. Please try again.")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const signUp = async (
    email: string,
    password: string,
    name: string,
    role: "freelancer" | "client",
  ): Promise<boolean> => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const userData: User = {
        id: "user_" + Date.now(),
        email,
        name,
        isVerified: false,
        accountType: role,
        role,
        profile:
          role === "freelancer"
            ? {
                completedJobs: 0,
                rating: 0,
              }
            : {
                projectsPosted: 0,
                rating: 0,
              },
      }

      setUser(userData)
      localStorage.setItem("freelancedao_user", JSON.stringify(userData))
      toast.success("Account created successfully!")
      return true
    } catch (error) {
      toast.error("Failed to create account. Please try again.")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = () => {
    setUser(null)
    localStorage.removeItem("freelancedao_user")
    localStorage.removeItem("walletConnected")
    localStorage.removeItem("walletAddress")
    toast.success("Successfully signed out")
    router.push("/")
  }

  const connectWallet = (address: string) => {
    if (user) {
      const updatedUser = { ...user, walletAddress: address }
      setUser(updatedUser)
      localStorage.setItem("freelancedao_user", JSON.stringify(updatedUser))
      localStorage.setItem("walletConnected", "true")
      localStorage.setItem("walletAddress", address)
    }
  }

  const disconnectWallet = () => {
    if (user) {
      const updatedUser = { ...user, walletAddress: undefined }
      setUser(updatedUser)
      localStorage.setItem("freelancedao_user", JSON.stringify(updatedUser))
      localStorage.removeItem("walletConnected")
      localStorage.removeItem("walletAddress")
    }
  }

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates }
      setUser(updatedUser)
      localStorage.setItem("freelancedao_user", JSON.stringify(updatedUser))
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        isWalletConnected,
        signIn,
        signUp,
        signOut,
        connectWallet,
        disconnectWallet,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
