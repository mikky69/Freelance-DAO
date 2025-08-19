"use client"

import type React from "react"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Lock, Wallet, User, ArrowRight, Shield, Zap, Briefcase, Bot } from "lucide-react"
import Link from "next/link"

interface ProtectedRouteProps {
  children: React.ReactNode
  requireWallet?: boolean
  requireAuth?: boolean
  requiredRole?: "freelancer" | "client" | "admin"
  redirectTo?: string
}

export function ProtectedRoute({
  children,
  requireWallet = false,
  requireAuth = true,
  requiredRole,
  redirectTo = "/auth/signin/freelancer",
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated, isWalletConnected } = useAuth()
  const router = useRouter()
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !isAuthenticated) {
        // Redirect to sign in if authentication is required
        router.push(redirectTo)
        return
      }

      if (requiredRole && isAuthenticated && user?.role !== requiredRole) {
        // User doesn't have the required role
        setShowContent(false)
        return
      }

      if (requireWallet && isAuthenticated && !isWalletConnected) {
        // Show wallet connection prompt if wallet is required
        setShowContent(false)
        return
      }

      if (isAuthenticated && (!requiredRole || user?.role === requiredRole) && (!requireWallet || isWalletConnected)) {
        setShowContent(true)
      }
    }
  }, [
    isLoading,
    isAuthenticated,
    isWalletConnected,
    requireAuth,
    requireWallet,
    requiredRole,
    user?.role,
    router,
    redirectTo,
  ])

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Not authenticated
  if (requireAuth && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Authentication Required</CardTitle>
            <CardDescription>You need to sign in to access this page</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                This page contains sensitive information and requires authentication to protect your data.
              </AlertDescription>
            </Alert>
           
            <div className="space-y-3">
              <div className="text-center mb-4">
                <p className="text-sm text-slate-600 mb-3">Choose your account type:</p>
              </div>
              
              <Link href="/auth/signin/freelancer" className="block">
                <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                  <User className="w-4 h-4 mr-2" />
                  Sign In as Freelancer
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              
              <Link href="/auth/signin/client" className="block">
                <Button variant="outline" className="w-full border-green-200 text-green-700 hover:bg-green-50">
                  <Briefcase className="w-4 h-4 mr-2" />
                  Sign In as Client
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              
              <div className="text-center pt-2">
                <p className="text-sm text-slate-500">Don't have an account?</p>
                <div className="flex gap-2 mt-2">
                  <Link href="/auth/signup/freelancer" className="flex-1">
                    <Button variant="ghost" size="sm" className="w-full text-blue-600">
                      Sign up as Freelancer
                    </Button>
                  </Link>
                  <Link href="/auth/signup/client" className="flex-1">
                    <Button variant="ghost" size="sm" className="w-full text-green-600">
                      Sign up as Client
                    </Button>
                  </Link>
                </div>
              </div>
              
              <Link href="/" className="block">
                <Button variant="ghost" className="w-full">
                  Back to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Role-based access control
  if (requiredRole && isAuthenticated && user?.role !== requiredRole) {
    const isFreelancerRequired = requiredRole === "freelancer"
    const isClientRequired = requiredRole === "client"
    const currentRole = user?.role

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Access Restricted</CardTitle>
            <CardDescription>
              {isFreelancerRequired
                ? "This feature is exclusively available to freelancers"
                : isClientRequired
                  ? "This feature is exclusively available to clients"
                  : `This feature requires ${requiredRole} access`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-red-200 bg-red-50">
              <Shield className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                {isFreelancerRequired && currentRole === "client" ? (
                  <>
                    <strong>AI Agent features are for freelancers only.</strong> As a client, you can browse and hire AI
                    agents, but cannot register or manage your own agents.
                  </>
                ) : isClientRequired && currentRole === "freelancer" ? (
                  <>
                    <strong>This client feature is not available to freelancers.</strong> You have access to
                    freelancer-specific tools and the AI agent marketplace.
                  </>
                ) : (
                  <>
                    You are currently signed in as a <strong>{currentRole}</strong>, but this page requires{" "}
                    <strong>{requiredRole}</strong> access.
                  </>
                )}
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              {isFreelancerRequired && currentRole === "client" ? (
                <>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">What you can do as a client:</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Browse and hire AI agents from the marketplace</li>
                      <li>• Post jobs for AI agents to complete</li>
                      <li>• Manage your projects and payments</li>
                      <li>• Access client dashboard and analytics</li>
                    </ul>
                  </div>
                  <Link href="/ai-agents" className="block">
                    <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                      <Bot className="w-4 h-4 mr-2" />
                      Browse AI Agents Marketplace
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                  <Link href="/post-job" className="block">
                    <Button variant="outline" className="w-full">
                      <Briefcase className="w-4 h-4 mr-2" />
                      Post a Job
                    </Button>
                  </Link>
                </>
              ) : isClientRequired && currentRole === "freelancer" ? (
                <>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">What you can do as a freelancer:</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Register and manage AI agents</li>
                      <li>• Access AI agent dashboard and analytics</li>
                      <li>• Browse and apply for jobs</li>
                      <li>• Manage your freelance profile</li>
                    </ul>
                  </div>
                  <Link href="/ai-agents/dashboard" className="block">
                    <Button className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
                      <Bot className="w-4 h-4 mr-2" />
                      AI Agent Dashboard
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                  <Link href="/jobs" className="block">
                    <Button variant="outline" className="w-full">
                      <Briefcase className="w-4 h-4 mr-2" />
                      Browse Jobs
                    </Button>
                  </Link>
                </>
              ) : (
                <Link href="/dashboard" className="block">
                  <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                    <User className="w-4 h-4 mr-2" />
                    Go to Dashboard
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              )}

              <div className="text-center">
                <p className="text-sm text-slate-600 mb-2">Need to switch account types?</p>
                <Button variant="ghost" onClick={() => router.push("/settings")}>
                  Account Settings
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Authenticated but wallet required
  if (requireWallet && isAuthenticated && !isWalletConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Wallet Connection Required</CardTitle>
            <CardDescription>Connect your Hedera wallet to access this feature</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Zap className="h-4 w-4" />
              <AlertDescription>
                This page requires wallet functionality for payments, smart contracts, and Web3 features.
              </AlertDescription>
            </Alert>
            <div className="space-y-3">
              <Link href="/wallet" className="block">
                <Button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700">
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect Wallet
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/dashboard" className="block">
                <Button variant="outline" className="w-full">
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show protected content
  return showContent ? <>{children}</> : null
}
