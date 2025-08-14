"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, ArrowRight, Star, Briefcase, Users, Zap, Gift, Trophy, Target } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function OnboardingCompletePage() {
  const router = useRouter()
  const [profileData, setProfileData] = useState<any>(null)
  const [isWalletConnected, setIsWalletConnected] = useState(false)

  useEffect(() => {
    // Load onboarding data
    const savedProfile = localStorage.getItem("onboardingProfile")
    const walletConnected = localStorage.getItem("walletConnected") === "true"

    if (savedProfile) {
      setProfileData(JSON.parse(savedProfile))
    }
    setIsWalletConnected(walletConnected)
  }, [])

  const handleGetStarted = () => {
    // Clear onboarding data and redirect to dashboard
    localStorage.removeItem("onboardingProfile")
    router.push("/dashboard")
  }

  const nextSteps = [
    {
      icon: <Briefcase className="w-6 h-6 text-blue-500" />,
      title: "Browse Jobs",
      description: "Explore thousands of opportunities matching your skills",
      action: "Find Work",
      href: "/jobs",
    },
    {
      icon: <Users className="w-6 h-6 text-green-500" />,
      title: "Complete Your Profile",
      description: "Add portfolio items and detailed work experience",
      action: "Edit Profile",
      href: "/profile",
    },
    {
      icon: <Star className="w-6 h-6 text-purple-500" />,
      title: "Get Verified",
      description: "Complete identity verification for premium features",
      action: "Verify Now",
      href: "/verification",
    },
  ]

  const achievements = [
    { icon: <Trophy className="w-5 h-5 text-yellow-500" />, text: "Account Created" },
    { icon: <CheckCircle className="w-5 h-5 text-green-500" />, text: "Profile Setup Complete" },
    {
      icon: <Zap className="w-5 h-5 text-blue-500" />,
      text: isWalletConnected ? "Wallet Connected" : "Ready for Web3",
    },
    { icon: <Target className="w-5 h-5 text-purple-500" />, text: "Ready to Earn" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Celebration Header */}
          <div className="text-center mb-12">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">🎉 Welcome to FreeLanceDAO!</h1>
            <p className="text-xl text-slate-600 mb-6 max-w-2xl mx-auto">
              Congratulations! Your account is set up and ready.
              {profileData?.firstName && ` Welcome aboard, ${profileData.firstName}!`}
            </p>

            {/* Achievement Badges */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {achievements.map((achievement, index) => (
                <div key={index} className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm">
                  {achievement.icon}
                  <span className="text-sm font-medium text-slate-700">{achievement.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Profile Summary */}
          {profileData && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Your Profile Summary</span>
                  <Badge className="bg-blue-100 text-blue-700">
                    {profileData.accountType === "freelancer" ? "Freelancer" : "Client"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-slate-800 mb-2">Basic Information</h4>
                    <div className="space-y-1 text-sm text-slate-600">
                      <div>
                        <strong>Name:</strong> {profileData.firstName} {profileData.lastName}
                      </div>
                      <div>
                        <strong>Email:</strong> {profileData.email}
                      </div>
                      {profileData.location && (
                        <div>
                          <strong>Location:</strong> {profileData.location}
                        </div>
                      )}
                      {profileData.company && (
                        <div>
                          <strong>Company:</strong> {profileData.company}
                        </div>
                      )}
                      {profileData.title && (
                        <div>
                          <strong>Title:</strong> {profileData.title}
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-800 mb-2">Platform Status</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-slate-600">Email verified</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {isWalletConnected ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                        )}
                        <span className="text-sm text-slate-600">
                          Wallet {isWalletConnected ? "connected" : "not connected"}
                        </span>
                      </div>
                      {profileData.skills && profileData.skills.length > 0 && (
                        <div>
                          <span className="text-sm text-slate-600 block mb-1">Skills:</span>
                          <div className="flex flex-wrap gap-1">
                            {profileData.skills.slice(0, 3).map((skill: string, index: number) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {profileData.skills.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{profileData.skills.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Next Steps */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 text-center mb-6">What's Next?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {nextSteps.map((step, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      {step.icon}
                    </div>
                    <h3 className="font-semibold text-slate-800 mb-2">{step.title}</h3>
                    <p className="text-sm text-slate-600 mb-4">{step.description}</p>
                    <Link href={step.href}>
                      <Button variant="outline" size="sm" className="w-full">
                        {step.action}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Special Offers */}
          <Card className="mb-8 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Gift className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-1">New User Bonus</h3>
                    <p className="text-sm text-slate-600">
                      Complete your first job to earn a 10 HBAR bonus and unlock premium features!
                    </p>
                  </div>
                </div>
                <Badge className="bg-purple-100 text-purple-700">Limited Time</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Main CTA */}
          <div className="text-center">
            <Button
              size="lg"
              onClick={handleGetStarted}
              className="bg-blue-500 hover:bg-blue-600 text-white px-12 py-4 text-lg"
            >
              Start Exploring FreeLanceDAO
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <p className="text-sm text-slate-500 mt-4">You can always update your profile and settings later</p>
          </div>

          {/* Help Section */}
          <div className="mt-12 text-center">
            <h3 className="font-semibold text-slate-800 mb-4">Need Help Getting Started?</h3>
            <div className="flex justify-center space-x-6">
              <Link href="/help" className="text-blue-500 hover:text-blue-600 text-sm">
                Help Center
              </Link>
              <Link href="/tutorials" className="text-blue-500 hover:text-blue-600 text-sm">
                Video Tutorials
              </Link>
              <Link href="/support" className="text-blue-500 hover:text-blue-600 text-sm">
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
