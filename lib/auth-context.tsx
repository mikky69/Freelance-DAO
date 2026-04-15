// lib/auth-context.tsx
"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface User {
  id: string
  email?: string
  walletAddress?: string
  name: string
  avatar?: string
  isVerified: boolean
  accountType: "freelancer" | "client" | "admin"
  role: "freelancer" | "client" | "admin"
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
  signIn: (email: string, password: string, role: "freelancer" | "client" | "admin") => Promise<boolean>
  signUp: (email: string, password: string, name: string, role: "freelancer" | "client" | "admin", adminToken?: string) => Promise<boolean>
  signOut: () => void
  connectWallet: (address: string) => void
  disconnectWallet: () => void
  updateUser: (updates: Partial<User>) => Promise<boolean>
  setUserRole: (role: "freelancer" | "client" | "admin") => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const API_URL = process.env.NEXT_PUBLIC_API_URL || ""
const REQUEST_TIMEOUT = 10000 // 10 seconds

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [pendingRole, setPendingRole] = useState<"freelancer" | "client" | "admin" | null>(null)
  const router = useRouter()

  const isAuthenticated = !!user
  const isWalletConnected = !!user?.walletAddress

  // token helpers
  const setToken = (token: string | null) => {
    if (token && token !== "undefined" && token !== "null") {
      localStorage.setItem("freelancedao_token", token)
    } else {
      localStorage.removeItem("freelancedao_token")
    }
  }
  const getToken = () => {
    const token = localStorage.getItem("freelancedao_token")
    if (!token || token === "undefined" || token === "null") return null
    return token
  }

  // fetch wrapper - will attach Authorization header automatically
  const authFetch = useCallback((url: string, options: RequestInit = {}) => {
    const token = getToken()
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }
    return fetch(url, { ...options, headers })
  }, [])

  const checkExistingSession = useCallback(async () => {
    setIsLoading(true)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)
    
    try {
      const token = getToken()
      if (!token) {
        // fallback to old local storage user if present
        const savedUser = localStorage.getItem("freelancedao_user")
        if (savedUser) setUser(JSON.parse(savedUser))
        setIsLoading(false)
        return
      }

      const res = await authFetch(`${API_URL}/api/auth/me`, { 
        method: "GET",
        signal: controller.signal 
      })
      
      clearTimeout(timeoutId)
      
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
      clearTimeout(timeoutId)
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn("Session check timed out")
      } else {
        console.error("checkExistingSession error:", error)
      }
    } finally {
      setIsLoading(false)
    }
  }, [authFetch])

  useEffect(() => {
    checkExistingSession();
  }, [checkExistingSession])

  // Set user role before or after login
  const setUserRole = useCallback((role: "freelancer" | "client" | "admin") => {
    setPendingRole(role)
    localStorage.setItem("freelancedao_role", role)
    
    // Update existing user if present
    if (user) {
      const updatedUser = { ...user, role, accountType: role }
      setUser(updatedUser)
      localStorage.setItem("freelancedao_user", JSON.stringify(updatedUser))
    }
  }, [user])

  // sign in (legacy support for existing email/password auth)
  const signIn = async (email: string, password: string, role: "freelancer" | "client" | "admin"): Promise<boolean> => {
    setIsLoading(true)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

    try {
      let endpoint = "/api/auth/login/freelancer"
      if (role === "client") endpoint = "/api/auth/login/client"
      if (role === "admin") endpoint = "/api/auth/login/admin"
      
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Login failed" }))
        toast.error(err.message || "Login failed")
        setIsLoading(false)
        return false
      }

      const data = await res.json()
      if (!data.token) {
        toast.error("No token received from server")
        setIsLoading(false)
        return false
      }

      setToken(data.token)
      localStorage.setItem("freelancedao_role", role)

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
      setIsLoading(false)
      return true
    } catch (error) {
      clearTimeout(timeoutId)
      if (error instanceof Error && error.name === 'AbortError') {
        toast.error("Request timeout. Check your connection and try again.")
      } else {
        console.error("signIn error", error)
        toast.error("Failed to sign in. Please try again.")
      }
      setIsLoading(false)
      return false
    }
  }

  // sign up (legacy support for existing email/password auth)
  const signUp = async (
    email: string,
    password: string,
    name: string,
    role: "freelancer" | "client" | "admin",
    adminToken?: string
  ): Promise<boolean> => {
    setIsLoading(true)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

    try {
      let endpoint = "/api/auth/register/freelancer"
      if (role === "client") endpoint = "/api/auth/register/client"
      if (role === "admin") endpoint = "/api/auth/register/admin"
      
      const body: Record<string, string> = { email, password, fullname: name }
      
      // Add adminToken for admin registration if provided
      if (role === "admin" && adminToken) {
        body.adminToken = adminToken
      }
      
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Signup failed" }))
        toast.error(err.message || "Signup failed")
        setIsLoading(false)
        return false
      }

      const data = await res.json()
      localStorage.setItem("freelancedao_role", role)
      
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
      setIsLoading(false)
      return true
    } catch (error) {
      clearTimeout(timeoutId)
      if (error instanceof Error && error.name === 'AbortError') {
        toast.error("Request timeout. Check your connection and try again.")
      } else {
        console.error("signUp error", error)
        toast.error("Failed to create account. Please try again.")
      }
      setIsLoading(false)
      return false
    }
  }

  const signOut = useCallback(async () => {
    setUser(null)
    setToken(null)
    setPendingRole(null)
    localStorage.removeItem("freelancedao_user")
    localStorage.removeItem("freelancedao_role")
    localStorage.removeItem("walletConnected")
    localStorage.removeItem("walletAddress")
    toast.success("Successfully signed out")
    router.push("/")
  }, [router])

  const connectWallet = useCallback((address: string) => {
    if (user) {
      const updatedUser = { ...user, walletAddress: address }
      setUser(updatedUser)
      localStorage.setItem("freelancedao_user", JSON.stringify(updatedUser))
      localStorage.setItem("walletConnected", "true")
      localStorage.setItem("walletAddress", address)
    }
  }, [user])

  const disconnectWallet = useCallback(() => {
    if (user) {
      const updatedUser = { ...user, walletAddress: undefined }
      setUser(updatedUser)
      localStorage.setItem("freelancedao_user", JSON.stringify(updatedUser))
      localStorage.removeItem("walletConnected")
      localStorage.removeItem("walletAddress")
    }
  }, [user])

  const updateUser = async (updates: Partial<User>): Promise<boolean> => {
    if (!user) return false
  
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

    try {
      setIsLoading(true)
  
      // Make API call to update profile in database
      const response = await authFetch(`${API_URL}/api/profile`, {
        method: "PUT",
        body: JSON.stringify(updates),
        signal: controller.signal,
      })
  
      clearTimeout(timeoutId)

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Failed to update profile" }))
        toast.error(error.message || "Failed to update profile")
        return false
      }
  
      const result = await response.json()
  
      // Update local state with the response from server
      const updatedUser = { ...user, ...result.user }
      setUser(updatedUser)
      localStorage.setItem("freelancedao_user", JSON.stringify(updatedUser))
  
      return true
    } catch (error) {
      clearTimeout(timeoutId)
      if (error instanceof Error && error.name === 'AbortError') {
        toast.error("Request timeout. Please try again.")
      } else {
        console.error("updateUser error:", error)
        toast.error("Failed to update profile. Please try again.")
      }
      return false
    } finally {
      setIsLoading(false)
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
        setUserRole,
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