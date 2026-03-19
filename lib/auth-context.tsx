// lib/auth-context.tsx
"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { usePrivy, useWallets } from "@privy-io/react-auth"

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
  privyAuthenticated: boolean
  privyReady: boolean
  signIn: (email: string, password: string, role: "freelancer" | "client" | "admin") => Promise<boolean>
  signUp: (email: string, password: string, name: string, role: "freelancer" | "client" | "admin", adminToken?: string) => Promise<boolean>
  signOut: () => void
  connectWallet: (address: string) => void
  disconnectWallet: () => void
  updateUser: (updates: Partial<User>) => Promise<boolean>
  openPrivyLogin: () => void
  setUserRole: (role: "freelancer" | "client" | "admin") => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const API_URL = process.env.NEXT_PUBLIC_API_URL || ""

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [pendingRole, setPendingRole] = useState<"freelancer" | "client" | "admin" | null>(null)
  const router = useRouter()

  // Privy hooks
  const { 
    ready: privyReady, 
    authenticated: privyAuthenticated, 
    user: privyUser, 
    login: privyLogin, 
    logout: privyLogout,
    connectWallet: privyConnectWallet,
    getAccessToken
  } = usePrivy()
  const { wallets } = useWallets()

  const isAuthenticated = !!user || privyAuthenticated
  const isWalletConnected = !!user?.walletAddress || wallets.length > 0

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

  // Sync Privy user with local user state and backend
  useEffect(() => {
    const syncUser = async () => {
      if (privyReady && privyAuthenticated && privyUser) {
        try {
          // 1. Get Access Token from Privy
          const accessToken = await getAccessToken();
          console.log("Syncing with Privy token:", accessToken?.substring(0, 10) + "...");
          if (!accessToken) return;

          // 2. Determine Role and Email
          const storedRole = localStorage.getItem("freelancedao_role") as "freelancer" | "client" | "admin" | null;
          const role = pendingRole || storedRole || "freelancer";
          const email = privyUser.email?.address || privyUser.google?.email || privyUser.apple?.email;

          // 3. Sync with backend
          const res = await fetch(`${API_URL}/api/auth/privy/sync`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accessToken, role, email }),
          });

          if (res.ok) {
            const data = await res.json();
            if (data.token) {
              setToken(data.token);
              setUser(data.user);
              localStorage.setItem("freelancedao_user", JSON.stringify(data.user));
              localStorage.setItem("freelancedao_role", data.user.role);
            }
          } else {
            // Fallback for failed sync - minimal user object
            const privyEmail = privyUser.email?.address || privyUser.google?.email || privyUser.apple?.email;
            const privyWalletAddress = wallets.length > 0 ? wallets[0].address : undefined;
            
            const fallbackUser: User = {
              id: privyUser.id,
              email: privyEmail,
              walletAddress: privyWalletAddress,
              name: privyEmail?.split("@")[0] || privyWalletAddress?.slice(0, 8) || "User",
              isVerified: !!privyUser.email?.address,
              accountType: role,
              role: role,
            };
            setUser(fallbackUser);
          }
        } catch (error) {
          console.error("Privy sync error:", error);
        } finally {
          setIsLoading(false);
        }
      } else if (privyReady && !privyAuthenticated) {
        // Not authenticated with Privy, check for legacy session
        checkExistingSession();
      }
    };

    syncUser();
  }, [privyReady, privyAuthenticated, privyUser, wallets, pendingRole, getAccessToken])

  // Update wallet address when wallets change
  useEffect(() => {
    if (wallets.length > 0 && user) {
      const walletAddress = wallets[0].address
      if (walletAddress !== user.walletAddress) {
        const updatedUser = { ...user, walletAddress }
        setUser(updatedUser)
        localStorage.setItem("freelancedao_user", JSON.stringify(updatedUser))
        localStorage.setItem("walletConnected", "true")
        localStorage.setItem("walletAddress", walletAddress)
      }
    }
  }, [wallets, user])

  // restore session on load (legacy support)
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

  // Open Privy login modal
  const openPrivyLogin = useCallback(() => {
    privyLogin()
  }, [privyLogin])

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
    try {
      let endpoint = "/api/auth/login/freelancer"
      if (role === "client") endpoint = "/api/auth/login/client"
      if (role === "admin") endpoint = "/api/auth/login/admin"
      
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
      return true
    } catch (error) {
      console.error("signIn error", error)
      toast.error("Failed to sign in.")
      return false
    } finally {
      setIsLoading(false)
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
      })

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

  const signOut = useCallback(async () => {
    // Sign out from Privy if authenticated
    if (privyAuthenticated) {
      await privyLogout()
    }
    
    setUser(null)
    setToken(null)
    setPendingRole(null)
    localStorage.removeItem("freelancedao_user")
    localStorage.removeItem("freelancedao_role")
    localStorage.removeItem("walletConnected")
    localStorage.removeItem("walletAddress")
    toast.success("Successfully signed out")
    router.push("/")
  }, [privyAuthenticated, privyLogout, router])

  const connectWallet = useCallback((address: string) => {
    if (user) {
      const updatedUser = { ...user, walletAddress: address }
      setUser(updatedUser)
      localStorage.setItem("freelancedao_user", JSON.stringify(updatedUser))
      localStorage.setItem("walletConnected", "true")
      localStorage.setItem("walletAddress", address)
    } else {
      // If no user yet, try to connect via Privy
      privyConnectWallet()
    }
  }, [user, privyConnectWallet])

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
  
    try {
      setIsLoading(true)
  
      // Make API call to update profile in database
      const response = await authFetch(`${API_URL}/api/profile`, {
        method: "PUT",
        body: JSON.stringify(updates),
      })
  
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
      console.error("updateUser error:", error)
      toast.error("Failed to update profile. Please try again.")
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
        privyAuthenticated,
        privyReady,
        signIn,
        signUp,
        signOut,
        connectWallet,
        disconnectWallet,
        updateUser,
        openPrivyLogin,
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
