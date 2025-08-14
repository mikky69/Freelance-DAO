"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Bot, Briefcase, Users, Shield, ArrowRight, Zap } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

interface RoleAwareNavigationProps {
  currentPath?: string
  showFullFeatures?: boolean
}

export function RoleAwareNavigation({ currentPath, showFullFeatures = false }: RoleAwareNavigationProps) {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated || !user) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center">
            <Bot className="w-6 h-6 mr-2 text-blue-600" />
            AI Agent Features
          </CardTitle>
          <CardDescription>Sign in to access AI agent capabilities</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/auth/signup/freelancer">
              <Button className="w-full bg-green-600 hover:bg-green-700">
                <Bot className="w-4 h-4 mr-2" />
                Join as Freelancer
              </Button>
            </Link>
            <Link href="/auth/signup/client">
              <Button variant="outline" className="w-full">
                <Users className="w-4 h-4 mr-2" />
                Join as Client
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  const isFreelancer = user.role === "freelancer"
  const isClient = user.role === "client"

  return (
    <div className="space-y-6">
      {/* Role Badge */}
      <div className="flex items-center justify-center">
        <Badge
          variant="outline"
          className={`px-4 py-2 text-sm font-medium ${
            isFreelancer ? "border-green-200 bg-green-50 text-green-700" : "border-blue-200 bg-blue-50 text-blue-700"
          }`}
        >
          <Shield className="w-4 h-4 mr-2" />
          Signed in as {isFreelancer ? "Freelancer" : "Client"}
        </Badge>
      </div>

      {/* Freelancer Features */}
      {isFreelancer && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center text-green-800">
              <Bot className="w-5 h-5 mr-2" />
              AI Agent Management
            </CardTitle>
            <CardDescription className="text-green-600">Register, manage, and monetize your AI agents</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Link href="/ai-agents/dashboard">
                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                  variant={currentPath === "/ai-agents/dashboard" ? "default" : "outline"}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Agent Dashboard
                </Button>
              </Link>
              <Link href="/ai-agents/register">
                <Button variant="outline" className="w-full border-green-300 text-green-700 hover:bg-green-100">
                  <Bot className="w-4 h-4 mr-2" />
                  Register New Agent
                </Button>
              </Link>
            </div>

            {showFullFeatures && (
              <div className="bg-white p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 mb-2">Your AI Agent Benefits:</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Earn passive income 24/7</li>
                  <li>• Automated job acceptance</li>
                  <li>• Smart contract payments</li>
                  <li>• Performance analytics</li>
                  <li>• Reputation building</li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Client Features */}
      {isClient && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-800">
              <Users className="w-5 h-5 mr-2" />
              AI Agent Marketplace
            </CardTitle>
            <CardDescription className="text-blue-600">Discover and hire AI agents for your projects</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Link href="/ai-agents">
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  variant={currentPath === "/ai-agents" ? "default" : "outline"}
                >
                  <Bot className="w-4 h-4 mr-2" />
                  Browse AI Agents
                </Button>
              </Link>
              <Link href="/post-job">
                <Button variant="outline" className="w-full border-blue-300 text-blue-700 hover:bg-blue-100">
                  <Briefcase className="w-4 h-4 mr-2" />
                  Post a Job
                </Button>
              </Link>
            </div>

            {showFullFeatures && (
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">AI Agent Marketplace Features:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• 150+ specialized AI agents</li>
                  <li>• Instant task completion</li>
                  <li>• Quality guarantees</li>
                  <li>• Transparent pricing</li>
                  <li>• 24/7 availability</li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Access Restriction Notice for Wrong Role */}
      {isClient && (currentPath?.includes("/ai-agents/dashboard") || currentPath?.includes("/ai-agents/register")) && (
        <Alert className="border-amber-200 bg-amber-50">
          <Shield className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-700">
            <strong>AI Agent management is for freelancers only.</strong> As a client, you can browse and hire AI agents
            from the marketplace.
          </AlertDescription>
        </Alert>
      )}

      {/* Role Switch Suggestion */}
      {showFullFeatures && (
        <div className="text-center">
          <p className="text-sm text-slate-600 mb-2">
            Want to access {isFreelancer ? "client" : "freelancer"} features?
          </p>
          <Link href="/settings">
            <Button variant="ghost" size="sm">
              Account Settings
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
