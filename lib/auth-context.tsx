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
  isLoading: boolean         // true only during sign-in / sign-up / updateUser actions
  isInitializing: boolean    // true only during the initial session check on mount
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
const REQUEST_TIMEOUT = 10000

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)         // ← starts FALSE — only set during actions
  const [isInitializing, setIsInitializing] = useState(true) // ← separate flag for mount session check
  const [pendingRole, setPendingRole] = useState<"freelancer" | "client" | "admin" | null>(null)
  const router = useRouter()

  const isAuthenticated = !!user
  const isWalletConnected = !!user?.walletAddress

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
    setIsInitializing(true) // use isInitializing — NOT isLoading
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

    try {
      const token = getToken()
      if (!token) {
        const savedUser = localStorage.getItem("freelancedao_user")
        if (savedUser) {
          try { setUser(JSON.parse(savedUser)) } catch {}
        }
        return
      }

      const res = await authFetch(`${API_URL}/api/auth/me`, {
        method: "GET",
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!res.ok) {
        setToken(null)
        setUser(null)
        localStorage.removeItem("freelancedao_user")
        return
      }

      const userData = await res.json()
      setUser(userData)
      localStorage.setItem("freelancedao_user", JSON.stringify(userData))
    } catch (error) {
      clearTimeout(timeoutId)
      if (error instanceof Error && error.name === "AbortError") {
        console.warn("Session check timed out — loading from local cache")
        // Fall back to cached user so the UI isn't stuck
        const savedUser = localStorage.getItem("freelancedao_user")
        if (savedUser) {
          try { setUser(JSON.parse(savedUser)) } catch {}
        }
      } else {
        console.error("checkExistingSession error:", error)
      }
    } finally {
      setIsInitializing(false)
    }
  }, [authFetch])

  useEffect(() => {
    checkExistingSession()
  }, [checkExistingSession])

  const setUserRole = useCallback(
    (role: "freelancer" | "client" | "admin") => {
      setPendingRole(role)
      localStorage.setItem("freelancedao_role", role)
      if (user) {
        const updatedUser = { ...user, role, accountType: role }
        setUser(updatedUser)
        localStorage.setItem("freelancedao_user", JSON.stringify(updatedUser))
      }
    },
    [user]
  )

  const signIn = async (
    email: string,
    password: string,
    role: "freelancer" | "client" | "admin"
  ): Promise<boolean> => {
    setIsLoading(true) // action-scoped loading
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
        return false
      }

      const data = await res.json()
      if (!data.token) {
        toast.error("No token received from server")
        return false
      }

      setToken(data.token)
      localStorage.setItem("freelancedao_role", role)

      // Fetch full profile
      const meRes = await authFetch(`${API_URL}/api/auth/me`, { method: "GET" })
      let userData: User
      if (meRes.ok) {
        userData = await meRes.json()
      } else {
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
      clearTimeout(timeoutId)
      if (error instanceof Error && error.name === "AbortError") {
        toast.error("Request timed out. Check your connection and try again.")
      } else {
        console.error("signIn error", error)
        toast.error("Failed to sign in. Please try again.")
      }
      return false
    } finally {
      setIsLoading(false) // always reset
    }
  }

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
      if (role === "admin" && adminToken) body.adminToken = adminToken

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
        const userData = {
          id: `user_${Date.now()}`,
          email,
          name,
          isVerified: false,
          accountType: role,
          role,
        } as User
        setUser(userData)
        localStorage.setItem("freelancedao_user", JSON.stringify(userData))
      }

      toast.success("Account created successfully!")
      return true
    } catch (error) {
      clearTimeout(timeoutId)
      if (error instanceof Error && error.name === "AbortError") {
        toast.error("Request timed out. Check your connection and try again.")
      } else {
        console.error("signUp error", error)
        toast.error("Failed to create account. Please try again.")
      }
      return false
    } finally {
      setIsLoading(false)
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

  const connectWallet = useCallback(
    (address: string) => {
      if (user) {
        const updatedUser = { ...user, walletAddress: address }
        setUser(updatedUser)
        localStorage.setItem("freelancedao_user", JSON.stringify(updatedUser))
        localStorage.setItem("walletConnected", "true")
        localStorage.setItem("walletAddress", address)
      }
    },
    [user]
  )

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
      const updatedUser = { ...user, ...result.user }
      setUser(updatedUser)
      localStorage.setItem("freelancedao_user", JSON.stringify(updatedUser))
      return true
    } catch (error) {
      clearTimeout(timeoutId)
      if (error instanceof Error && error.name === "AbortError") {
        toast.error("Request timed out. Please try again.")
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
        isInitializing,
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