// lib/auth-context.tsx
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

const API_URL = process.env.NEXT_PUBLIC_API_URL || ""

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const isAuthenticated = !!user
  const isWalletConnected = !!user?.walletAddress

  useEffect(() => {
    checkExistingSession()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // token helpers
  const setToken = (token: string | null) => {
    if (token) localStorage.setItem("freelancedao_token", token)
    else localStorage.removeItem("freelancedao_token")
  }
  const getToken = () => localStorage.getItem("freelancedao_token")

  // fetch wrapper - will attach Authorization header automatically
  const authFetch = (url: string, options: RequestInit = {}) => {
    const token = getToken()
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }
    return fetch(url, { ...options, headers })
  }

  // restore session on load
  const checkExistingSession = async () => {
    setIsLoading(true)
    try {
      const token = getToken()
      if (!token) {
        // fallback to old local storage user if present
        const savedUser = localStorage.getItem("freelancedao_user")
        if (savedUser) setUser(JSON.parse(savedUser))
        setIsLoading(false)
        return
      }

      const res = await authFetch(`${API_URL}/api/auth/me`, { method: "GET" })
      if (!res.ok) {
        setToken(null)
        setUser(null)
        setIsLoading(false)
        return
      }
      const userData = await res.json()
      setUser(userData)
      localStorage.setItem("freelancedao_user", JSON.stringify(userData))
    } catch (error) {
      console.error("checkExistingSession error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // sign in
  const signIn = async (email: string, password: string, role: "freelancer" | "client"): Promise<boolean> => {
    setIsLoading(true)
    try {
      const endpoint = role === "client" ? "/api/auth/login-client" : "/api/auth/login-freelancer"
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Login failed" }))
        toast.error(err.message || "Login failed")
        return false
      }

      const data = await res.json()
      if (!data.token) {
        toast.error("No token received from server")
        return false
      }

      setToken(data.token)

      // fetch profile
      const meRes = await authFetch(`${API_URL}/api/auth/me`, { method: "GET" })
      let userData: User | null = null
      if (meRes.ok) {
        userData = await meRes.json()
      } else {
        // minimal fallback
        userData = {
          id: data.clientId || data.freelancerId || `user_${Date.now()}`,
          email,
          name: role === "freelancer" ? "Freelancer" : "Client",
          isVerified: false,
          accountType: role,
          role,
        } as User
      }

      setUser(userData)
      localStorage.setItem("freelancedao_user", JSON.stringify(userData))
      toast.success(`Welcome back, ${userData.name}!`)
      return true
    } catch (error) {
      console.error("signIn error", error)
      toast.error("Failed to sign in.")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // sign up
  const signUp = async (email: string, password: string, name: string, role: "freelancer" | "client"): Promise<boolean> => {
    setIsLoading(true)
    try {
      const endpoint = role === "client" ? "/api/auth/register-client" : "/api/auth/register-freelancer"
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Signup failed" }))
        toast.error(err.message || "Signup failed")
        return false
      }

      const data = await res.json()
      if (data.token) {
        setToken(data.token)
        const meRes = await authFetch(`${API_URL}/api/auth/me`, { method: "GET" })
        if (meRes.ok) {
          const userData = await meRes.json()
          setUser(userData)
          localStorage.setItem("freelancedao_user", JSON.stringify(userData))
        }
      } else {
        // fallback: create a minimal local user
        const userData = { id: `user_${Date.now()}`, email, name, isVerified: false, accountType: role, role } as User
        setUser(userData)
        localStorage.setItem("freelancedao_user", JSON.stringify(userData))
      }

      toast.success("Account created successfully!")
      return true
    } catch (error) {
      console.error("signUp error", error)
      toast.error("Failed to create account.")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = () => {
    setUser(null)
    setToken(null)
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
