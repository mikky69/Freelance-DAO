"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { User, Building, ArrowRight, ArrowLeft, CheckCircle, Search, Briefcase, Users, DollarSign } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function AccountTypePage() {
  const [selectedType, setSelectedType] = useState<"freelancer" | "client" | null>(null)
  const router = useRouter()

  const handleContinue = () => {
    if (selectedType) {
      router.push(`/onboarding/profile-setup?type=${selectedType}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">Getting Started</span>
              <span className="text-sm text-slate-500">Step 2 of 5</span>
            </div>
            <Progress value={40} className="h-2" />
          </div>

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">How do you plan to use FreeLanceDAO?</h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Choose your account type to get a personalized experience tailored to your needs.
            </p>
          </div>

          {/* Account Type Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Freelancer Card */}
            <Card
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                selectedType === "freelancer" ? "ring-2 ring-blue-500 shadow-lg" : "hover:shadow-md"
              }`}
              onClick={() => setSelectedType("freelancer")}
            >
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-2xl">I'm a Freelancer</CardTitle>
                <CardDescription className="text-base">
                  I want to offer my services and find work opportunities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-slate-700">Find and apply to jobs</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-slate-700">Build your reputation</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-slate-700">Secure payments via smart contracts</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-slate-700">Showcase your portfolio</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-slate-600">Popular skills:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="text-xs">
                      Web Development
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      Design
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      Writing
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      Marketing
                    </Badge>
                  </div>
                </div>

                {selectedType === "freelancer" && (
                  <div className="pt-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Search className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-blue-800">What you'll do next:</span>
                      </div>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Set up your professional profile</li>
                        <li>• Add your skills and portfolio</li>
                        <li>• Browse available jobs</li>
                        <li>• Connect your wallet (optional)</li>
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Client Card */}
            <Card
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                selectedType === "client" ? "ring-2 ring-purple-500 shadow-lg" : "hover:shadow-md"
              }`}
              onClick={() => setSelectedType("client")}
            >
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building className="w-8 h-8 text-purple-600" />
                </div>
                <CardTitle className="text-2xl">I'm a Client</CardTitle>
                <CardDescription className="text-base">
                  I want to hire talented freelancers for my projects
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-slate-700">Post jobs and projects</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-slate-700">Browse freelancer profiles</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-slate-700">Secure escrow payments</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-slate-700">Manage multiple projects</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-slate-600">Project types:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="text-xs">
                      One-time
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      Ongoing
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      Contract
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      Full-time
                    </Badge>
                  </div>
                </div>

                {selectedType === "client" && (
                  <div className="pt-4">
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Briefcase className="w-4 h-4 text-purple-600" />
                        <span className="font-medium text-purple-800">What you'll do next:</span>
                      </div>
                      <ul className="text-sm text-purple-700 space-y-1">
                        <li>• Create your company profile</li>
                        <li>• Post your first job</li>
                        <li>• Review freelancer proposals</li>
                        <li>• Set up secure payments</li>
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-slate-800">50,000+</div>
              <div className="text-sm text-slate-600">Active Users</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <Briefcase className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-slate-800">25,000+</div>
              <div className="text-sm text-slate-600">Jobs Completed</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <DollarSign className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-slate-800">$5M+</div>
              <div className="text-sm text-slate-600">Total Earnings</div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <Link href="/onboarding/welcome">
              <Button variant="outline" size="lg">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <Button
              size="lg"
              onClick={handleContinue}
              disabled={!selectedType}
              className="bg-blue-500 hover:bg-blue-600"
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
