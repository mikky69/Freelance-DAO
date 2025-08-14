"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  ArrowRight,
  ArrowLeft,
  Shield,
  CheckCircle,
  Upload,
  FileText,
  CreditCard,
  AlertCircle,
  Clock,
  Star,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function VerificationPage() {
  const router = useRouter()
  const [verificationSteps, setVerificationSteps] = useState({
    email: false,
    phone: false,
    identity: false,
    payment: false,
  })

  const handleEmailVerification = () => {
    setVerificationSteps((prev) => ({ ...prev, email: true }))
  }

  const handlePhoneVerification = () => {
    setVerificationSteps((prev) => ({ ...prev, phone: true }))
  }

  const handleContinue = () => {
    router.push("/onboarding/hedera-setup")
  }

  const completedSteps = Object.values(verificationSteps).filter(Boolean).length
  const totalSteps = Object.keys(verificationSteps).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">Getting Started</span>
              <span className="text-sm text-slate-500">Step 4 of 5</span>
            </div>
            <Progress value={80} className="h-2" />
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Verify Your Account</h1>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Account verification helps build trust in our community and unlocks additional features. Complete the
              steps below to get verified.
            </p>
          </div>

          {/* Verification Progress */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Verification Progress</span>
                <Badge className="bg-blue-100 text-blue-700">
                  {completedSteps}/{totalSteps} Complete
                </Badge>
              </CardTitle>
              <CardDescription>
                Complete these steps to verify your account and build trust with clients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Progress value={(completedSteps / totalSteps) * 100} className="h-3" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        verificationSteps.email ? "bg-green-100" : "bg-slate-100"
                      }`}
                    >
                      {verificationSteps.email ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <span className="text-sm font-medium text-slate-600">1</span>
                      )}
                    </div>
                    <span className={verificationSteps.email ? "text-green-700" : "text-slate-700"}>
                      Email Verification
                    </span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        verificationSteps.phone ? "bg-green-100" : "bg-slate-100"
                      }`}
                    >
                      {verificationSteps.phone ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <span className="text-sm font-medium text-slate-600">2</span>
                      )}
                    </div>
                    <span className={verificationSteps.phone ? "text-green-700" : "text-slate-700"}>
                      Phone Verification
                    </span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        verificationSteps.identity ? "bg-green-100" : "bg-slate-100"
                      }`}
                    >
                      {verificationSteps.identity ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <span className="text-sm font-medium text-slate-600">3</span>
                      )}
                    </div>
                    <span className={verificationSteps.identity ? "text-green-700" : "text-slate-700"}>
                      Identity Verification
                    </span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        verificationSteps.payment ? "bg-green-100" : "bg-slate-100"
                      }`}
                    >
                      {verificationSteps.payment ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <span className="text-sm font-medium text-slate-600">4</span>
                      )}
                    </div>
                    <span className={verificationSteps.payment ? "text-green-700" : "text-slate-700"}>
                      Payment Method
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Verification Steps */}
          <div className="space-y-6">
            {/* Email Verification */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        verificationSteps.email ? "bg-green-100" : "bg-blue-100"
                      }`}
                    >
                      {verificationSteps.email ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <Shield className="w-6 h-6 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-800 mb-1">Email Verification</h3>
                      <p className="text-slate-600 text-sm mb-3">
                        Verify your email address to secure your account and receive important notifications.
                      </p>
                      {verificationSteps.email ? (
                        <Badge className="bg-green-100 text-green-700">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                          <Clock className="w-3 h-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                    </div>
                  </div>
                  {!verificationSteps.email && (
                    <Button onClick={handleEmailVerification} size="sm">
                      Verify Email
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Phone Verification */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        verificationSteps.phone ? "bg-green-100" : "bg-blue-100"
                      }`}
                    >
                      {verificationSteps.phone ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <Shield className="w-6 h-6 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-800 mb-1">Phone Verification</h3>
                      <p className="text-slate-600 text-sm mb-3">
                        Add and verify your phone number for enhanced security and faster support.
                      </p>
                      {verificationSteps.phone ? (
                        <Badge className="bg-green-100 text-green-700">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="outline">Optional</Badge>
                      )}
                    </div>
                  </div>
                  {!verificationSteps.phone && (
                    <Button onClick={handlePhoneVerification} variant="outline" size="sm">
                      Add Phone
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Identity Verification */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-purple-100">
                      <FileText className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-800 mb-1">Identity Verification</h3>
                      <p className="text-slate-600 text-sm mb-3">
                        Upload a government-issued ID to unlock higher earning limits and premium features.
                      </p>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">Optional</Badge>
                        <Badge className="bg-purple-100 text-purple-700">
                          <Star className="w-3 h-3 mr-1" />
                          Premium Feature
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload ID
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-green-100">
                      <CreditCard className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-800 mb-1">Payment Method</h3>
                      <p className="text-slate-600 text-sm mb-3">
                        Connect your Hedera wallet or add a payment method for seamless transactions.
                      </p>
                      <Badge variant="outline">Set up in next step</Badge>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" disabled>
                    Next Step
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Benefits */}
          <Alert className="mt-8">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Why verify your account?</strong> Verified users get higher visibility in search results, access
              to premium jobs, higher earning limits, and faster dispute resolution.
            </AlertDescription>
          </Alert>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Link href="/onboarding/profile-setup">
              <Button variant="outline" size="lg">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <Button size="lg" onClick={handleContinue} className="bg-blue-500 hover:bg-blue-600">
              Continue to Wallet Setup
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
