"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, Bot, Users, CheckCircle, XCircle, AlertTriangle, Lock, Unlock } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"

export function AccessControlDemo() {
  const { user, isAuthenticated } = useAuth()
  const [testingRoute, setTestingRoute] = useState<string | null>(null)

  const routes = [
    {
      path: "/ai-agents",
      name: "AI Agents Marketplace",
      requiredRole: null,
      requireAuth: false,
      description: "Public marketplace for browsing AI agents",
    },
    {
      path: "/ai-agents/register",
      name: "Register AI Agent",
      requiredRole: "freelancer",
      requireAuth: true,
      description: "Register and configure new AI agents",
    },
    {
      path: "/ai-agents/dashboard",
      name: "AI Agent Dashboard",
      requiredRole: "freelancer",
      requireAuth: true,
      description: "Manage and monitor your AI agents",
    },
    {
      path: "/post-job",
      name: "Post Job",
      requiredRole: "client",
      requireAuth: true,
      description: "Create job postings for freelancers",
    },
    {
      path: "/dashboard",
      name: "User Dashboard",
      requiredRole: null,
      requireAuth: true,
      description: "General user dashboard",
    },
  ]

  const getAccessStatus = (route: (typeof routes)[0]) => {
    if (!route.requireAuth && !route.requiredRole) {
      return { status: "allowed", message: "Public access" }
    }

    if (!isAuthenticated) {
      return { status: "denied", message: "Authentication required" }
    }

    if (route.requiredRole && user?.role !== route.requiredRole) {
      return {
        status: "denied",
        message: `Requires ${route.requiredRole} role (you are ${user?.role})`,
      }
    }

    return { status: "allowed", message: "Access granted" }
  }

  const testRoute = (path: string) => {
    setTestingRoute(path)
    setTimeout(() => setTestingRoute(null), 1000)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Access Control System Demo
          </CardTitle>
          <CardDescription>Test role-based access control for different routes</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="status" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="status">Current Status</TabsTrigger>
              <TabsTrigger value="routes">Route Testing</TabsTrigger>
            </TabsList>

            <TabsContent value="status" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className={isAuthenticated ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                  <CardContent className="p-4 text-center">
                    {isAuthenticated ? (
                      <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    ) : (
                      <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                    )}
                    <div className="font-semibold">Authentication</div>
                    <div className="text-sm text-slate-600">{isAuthenticated ? "Signed In" : "Not Signed In"}</div>
                  </CardContent>
                </Card>

                <Card className="border-blue-200 bg-blue-50">
                  <CardContent className="p-4 text-center">
                    {user?.role === "freelancer" ? (
                      <Bot className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    ) : user?.role === "client" ? (
                      <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    ) : (
                      <AlertTriangle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    )}
                    <div className="font-semibold">User Role</div>
                    <div className="text-sm text-slate-600">{user?.role || "No Role"}</div>
                  </CardContent>
                </Card>

                <Card className="border-purple-200 bg-purple-50">
                  <CardContent className="p-4 text-center">
                    <Shield className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <div className="font-semibold">Access Level</div>
                    <div className="text-sm text-slate-600">
                      {isAuthenticated
                        ? user?.role === "freelancer"
                          ? "AI Agent Access"
                          : "Client Access"
                        : "Public Only"}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {user && (
                <Alert className="border-blue-200 bg-blue-50">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-700">
                    <strong>Welcome, {user.name}!</strong> You are signed in as a {user.role} with{" "}
                    {user.role === "freelancer" ? "AI agent management" : "client marketplace"} privileges.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="routes" className="space-y-4">
              <div className="space-y-3">
                {routes.map((route) => {
                  const access = getAccessStatus(route)
                  const isAllowed = access.status === "allowed"
                  const isTesting = testingRoute === route.path

                  return (
                    <Card key={route.path} className={`transition-all ${isTesting ? "ring-2 ring-blue-500" : ""}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              {isAllowed ? (
                                <Unlock className="w-5 h-5 text-green-600" />
                              ) : (
                                <Lock className="w-5 h-5 text-red-600" />
                              )}
                              <div>
                                <div className="font-semibold text-slate-800">{route.name}</div>
                                <div className="text-sm text-slate-600">{route.description}</div>
                                <div className="text-xs text-slate-500 mt-1">Path: {route.path}</div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <div className="text-right">
                              <Badge
                                variant={isAllowed ? "default" : "destructive"}
                                className={isAllowed ? "bg-green-100 text-green-700" : ""}
                              >
                                {access.status}
                              </Badge>
                              <div className="text-xs text-slate-500 mt-1">{access.message}</div>
                            </div>

                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => testRoute(route.path)}
                                disabled={isTesting}
                              >
                                {isTesting ? "Testing..." : "Test"}
                              </Button>

                              {isAllowed && (
                                <Link href={route.path}>
                                  <Button size="sm">Visit</Button>
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
