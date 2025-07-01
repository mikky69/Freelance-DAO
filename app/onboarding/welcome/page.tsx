"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, ArrowRight, Users, Shield, DollarSign, Zap, Globe, Award } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"

export default function WelcomePage() {
  const [currentFeature, setCurrentFeature] = useState(0)

  const features = [
    {
      icon: <Shield className="w-8 h-8 text-green-500" />,
      title: "Secure Smart Contracts",
      description: "Your payments are protected by blockchain technology",
    },
    {
      icon: <Users className="w-8 h-8 text-blue-500" />,
      title: "Global Talent Network",
      description: "Connect with clients and freelancers worldwide",
    },
    {
      icon: <DollarSign className="w-8 h-8 text-purple-500" />,
      title: "Lower Fees",
      description: "Keep more of what you earn with minimal platform fees",
    },
    {
      icon: <Zap className="w-8 h-8 text-yellow-500" />,
      title: "Instant Payments",
      description: "Get paid immediately when work is approved",
    },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">Getting Started</span>
              <span className="text-sm text-slate-500">Step 1 of 5</span>
            </div>
            <Progress value={20} className="h-2" />
          </div>

          {/* Welcome Content */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-white font-bold text-2xl">FD</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">Welcome to FreeLanceDAO</h1>
            <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
              The future of freelancing is here. Experience the perfect blend of Web2 simplicity and Web3 security.
            </p>

            <div className="flex flex-wrap justify-center gap-2 mb-8">
              <Badge className="bg-green-100 text-green-700">Secure Payments</Badge>
              <Badge className="bg-blue-100 text-blue-700">Global Network</Badge>
              <Badge className="bg-purple-100 text-purple-700">Low Fees</Badge>
              <Badge className="bg-yellow-100 text-yellow-700">Instant Transactions</Badge>
            </div>
          </div>

          {/* Animated Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {features.map((feature, index) => (
              <Card
                key={index}
                className={`text-center transition-all duration-500 ${
                  index === currentFeature ? "ring-2 ring-blue-500 shadow-lg scale-105" : "hover:shadow-md"
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex justify-center mb-4">{feature.icon}</div>
                  <h3 className="font-semibold text-slate-800 mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="text-3xl font-bold text-blue-600 mb-2">10,000+</div>
              <div className="text-slate-600">Active Freelancers</div>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="text-3xl font-bold text-green-600 mb-2">$2M+</div>
              <div className="text-slate-600">Paid to Freelancers</div>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="text-3xl font-bold text-purple-600 mb-2">99.9%</div>
              <div className="text-slate-600">Payment Success Rate</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link href="/onboarding/account-type">
              <Button size="lg" className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 text-lg">
                Get Started
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/onboarding/demo">
              <Button variant="outline" size="lg" className="px-8 py-4 text-lg">
                Take a Tour
                <Globe className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 text-center">
            <p className="text-sm text-slate-500 mb-4">Trusted by freelancers worldwide</p>
            <div className="flex justify-center items-center space-x-8 opacity-60">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span className="text-sm">Blockchain Secured</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5" />
                <span className="text-sm">Industry Leading</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm">Verified Platform</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
