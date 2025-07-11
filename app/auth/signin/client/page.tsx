"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Mail, Lock, ArrowRight, Briefcase, Shield, Users, Zap, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function ClientSignInPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const { signIn, isLoading } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError("Please fill in all fields")
      return
    }

    const success = await signIn(email, password, "client")
    if (success) {
      router.push("/dashboard")
    } else {
      setError("Invalid email or password")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding & Benefits */}
        <div className="hidden lg:block space-y-8">
          <div className="flex items-center space-x-3">
            <Image
              src="/images/freelancedao-logo.png"
              alt="FreeLanceDAO"
              width={48}
              height={48}
              className="rounded-lg shadow-lg"
            />
            <div>
              <h1 className="text-3xl font-bold text-slate-800">FreeLanceDAO</h1>
              <p className="text-slate-600">Decentralized Freelancing Platform</p>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">Welcome Back, Client!</h2>
            <p className="text-lg text-slate-600">
              Continue building your team with the world's top verified freelancers.
            </p>

            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm border border-green-100">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Access Top Talent</h3>
                  <p className="text-sm text-slate-600">Verified freelancers with proven track records</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm border border-blue-100">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Secure Escrow</h3>
                  <p className="text-sm text-slate-600">Smart contract protection for all payments</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm border border-purple-100">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Project Management</h3>
                  <p className="text-sm text-slate-600">Advanced tools to manage your projects</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm border border-orange-100">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Fast Hiring</h3>
                  <p className="text-sm text-slate-600">AI-powered matching for quick results</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Sign In Form */}
        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-8 lg:hidden">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Image
                src="/images/freelancedao-logo.png"
                alt="FreeLanceDAO"
                width={40}
                height={40}
                className="rounded-lg shadow-md"
              />
              <span className="text-2xl font-bold text-slate-800">FreeLanceDAO</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Client Sign In</h1>
            <p className="text-slate-600">Access your client dashboard</p>
          </div>

          <Card className="glass-effect border-green-200 shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center space-x-2">
                <Briefcase className="w-5 h-5 text-green-500" />
                <span>Client Portal</span>
              </CardTitle>
              <CardDescription>Sign in to hire talent and manage your projects</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    <>
                      Sign In as Client
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center space-y-4">
                <Link href="/auth/forgot-password" className="text-sm text-green-600 hover:text-green-700">
                  Forgot your password?
                </Link>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-slate-500">Or</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-slate-600">
                    New to FreeLanceDAO?{" "}
                    <Link href="/auth/signup/client" className="text-green-600 hover:text-green-700 font-medium">
                      Create client account
                    </Link>
                  </p>
                  <p className="text-sm text-slate-600">
                    Looking for work?{" "}
                    <Link href="/auth/signin/freelancer" className="text-blue-600 hover:text-blue-700 font-medium">
                      Sign in as freelancer
                    </Link>
                  </p>
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
      </div>
    </div>
  )
}
