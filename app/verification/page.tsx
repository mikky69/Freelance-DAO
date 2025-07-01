"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Shield,
  CheckCircle,
  Upload,
  FileText,
  Phone,
  Mail,
  Camera,
  AlertCircle,
  Star,
  Clock,
  User,
  Building,
} from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

interface VerificationStep {
  id: string
  title: string
  description: string
  status: "pending" | "in-progress" | "completed" | "failed"
  required: boolean
  icon: React.ReactNode
}

export default function VerificationPage() {
  const [verificationSteps, setVerificationSteps] = useState<VerificationStep[]>([
    {
      id: "email",
      title: "Email Verification",
      description: "Verify your email address to secure your account",
      status: "completed",
      required: true,
      icon: <Mail className="w-5 h-5" />,
    },
    {
      id: "phone",
      title: "Phone Verification",
      description: "Add and verify your phone number for enhanced security",
      status: "pending",
      required: false,
      icon: <Phone className="w-5 h-5" />,
    },
    {
      id: "identity",
      title: "Identity Verification",
      description: "Upload government-issued ID for identity verification",
      status: "pending",
      required: false,
      icon: <FileText className="w-5 h-5" />,
    },
    {
      id: "address",
      title: "Address Verification",
      description: "Verify your address with a utility bill or bank statement",
      status: "pending",
      required: false,
      icon: <Building className="w-5 h-5" />,
    },
    {
      id: "selfie",
      title: "Selfie Verification",
      description: "Take a selfie to match with your ID document",
      status: "pending",
      required: false,
      icon: <Camera className="w-5 h-5" />,
    },
  ])

  const [phoneNumber, setPhoneNumber] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [selectedIdType, setSelectedIdType] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const completedSteps = verificationSteps.filter((step) => step.status === "completed").length
  const totalSteps = verificationSteps.length
  const verificationLevel = Math.round((completedSteps / totalSteps) * 100)

  const updateStepStatus = (stepId: string, status: VerificationStep["status"]) => {
    setVerificationSteps((prev) => prev.map((step) => (step.id === stepId ? { ...step, status } : step)))
  }

  const handlePhoneVerification = async () => {
    if (!phoneNumber) {
      toast.error("Please enter your phone number")
      return
    }

    setIsSubmitting(true)
    updateStepStatus("phone", "in-progress")

    // Simulate API call
    setTimeout(() => {
      updateStepStatus("phone", "completed")
      toast.success("Phone verification completed!")
      setIsSubmitting(false)
    }, 2000)
  }

  const handleFileUpload = (stepId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsSubmitting(true)
    updateStepStatus(stepId, "in-progress")

    // Simulate file upload
    setTimeout(() => {
      updateStepStatus(stepId, "completed")
      toast.success(`${stepId} verification submitted successfully!`)
      setIsSubmitting(false)
    }, 3000)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700"
      case "in-progress":
        return "bg-blue-100 text-blue-700"
      case "failed":
        return "bg-red-100 text-red-700"
      default:
        return "bg-slate-100 text-slate-700"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "in-progress":
        return <Clock className="w-4 h-4 text-blue-500" />
      case "failed":
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-slate-400" />
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Account Verification</h1>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Verify your account to build trust, unlock premium features, and increase your earning potential
            </p>
          </div>

          {/* Verification Level */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">Verification Level</h3>
                  <p className="text-slate-600">Complete more steps to increase your verification level</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">{verificationLevel}%</div>
                  <div className="text-sm text-slate-600">Complete</div>
                </div>
              </div>
              <Progress value={verificationLevel} className="h-3 mb-4" />
              <div className="flex justify-between text-sm text-slate-600">
                <span>
                  {completedSteps} of {totalSteps} steps completed
                </span>
                <span>
                  {verificationLevel < 50 ? "Basic" : verificationLevel < 80 ? "Intermediate" : "Advanced"} Level
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6 text-center">
                <Star className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
                <h3 className="font-semibold text-slate-800 mb-2">Higher Visibility</h3>
                <p className="text-sm text-slate-600">Verified profiles appear higher in search results</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Shield className="w-8 h-8 text-green-500 mx-auto mb-3" />
                <h3 className="font-semibold text-slate-800 mb-2">Build Trust</h3>
                <p className="text-sm text-slate-600">Clients prefer working with verified freelancers</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <User className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                <h3 className="font-semibold text-slate-800 mb-2">Premium Features</h3>
                <p className="text-sm text-slate-600">Access exclusive features and higher limits</p>
              </CardContent>
            </Card>
          </div>

          {/* Verification Steps */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="verify">Verify Now</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {verificationSteps.map((step) => (
                <Card key={step.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            step.status === "completed"
                              ? "bg-green-100"
                              : step.status === "in-progress"
                                ? "bg-blue-100"
                                : "bg-slate-100"
                          }`}
                        >
                          {step.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold text-slate-800">{step.title}</h3>
                            {step.required && (
                              <Badge variant="outline" className="text-xs">
                                Required
                              </Badge>
                            )}
                          </div>
                          <p className="text-slate-600 text-sm">{step.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(step.status)}
                        <Badge className={getStatusColor(step.status)}>
                          {step.status.charAt(0).toUpperCase() + step.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="verify" className="space-y-6">
              {/* Phone Verification */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Phone className="w-5 h-5 mr-2" />
                    Phone Verification
                  </CardTitle>
                  <CardDescription>Add and verify your phone number for enhanced account security</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="code">Verification Code</Label>
                      <Input
                        id="code"
                        placeholder="Enter 6-digit code"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button onClick={handlePhoneVerification} disabled={isSubmitting || !phoneNumber}>
                    {isSubmitting ? "Verifying..." : "Verify Phone Number"}
                  </Button>
                </CardContent>
              </Card>

              {/* Identity Verification */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Identity Verification
                  </CardTitle>
                  <CardDescription>Upload a government-issued ID to verify your identity</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Document Type</Label>
                    <Select value={selectedIdType} onValueChange={setSelectedIdType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select document type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="passport">Passport</SelectItem>
                        <SelectItem value="drivers-license">Driver's License</SelectItem>
                        <SelectItem value="national-id">National ID Card</SelectItem>
                        <SelectItem value="state-id">State ID Card</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="id-upload">Upload Document</Label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        <Upload className="mx-auto h-12 w-12 text-slate-400" />
                        <div className="flex text-sm text-slate-600">
                          <label
                            htmlFor="id-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500"
                          >
                            <span>Upload a file</span>
                            <input
                              id="id-upload"
                              type="file"
                              className="sr-only"
                              accept="image/*,.pdf"
                              onChange={(e) => handleFileUpload("identity", e)}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-slate-500">PNG, JPG, PDF up to 10MB</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Address Verification */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building className="w-5 h-5 mr-2" />
                    Address Verification
                  </CardTitle>
                  <CardDescription>Upload a utility bill or bank statement to verify your address</CardDescription>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label htmlFor="address-upload">Upload Document</Label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        <Upload className="mx-auto h-12 w-12 text-slate-400" />
                        <div className="flex text-sm text-slate-600">
                          <label
                            htmlFor="address-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500"
                          >
                            <span>Upload a file</span>
                            <input
                              id="address-upload"
                              type="file"
                              className="sr-only"
                              accept="image/*,.pdf"
                              onChange={(e) => handleFileUpload("address", e)}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-slate-500">Utility bill, bank statement, or lease agreement</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Selfie Verification */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Camera className="w-5 h-5 mr-2" />
                    Selfie Verification
                  </CardTitle>
                  <CardDescription>Take a selfie to match with your ID document</CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Please ensure good lighting and hold your ID document next to your face
                    </AlertDescription>
                  </Alert>
                  <div>
                    <Label htmlFor="selfie-upload">Upload Selfie</Label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        <Camera className="mx-auto h-12 w-12 text-slate-400" />
                        <div className="flex text-sm text-slate-600">
                          <label
                            htmlFor="selfie-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500"
                          >
                            <span>Take or upload selfie</span>
                            <input
                              id="selfie-upload"
                              type="file"
                              className="sr-only"
                              accept="image/*"
                              capture="user"
                              onChange={(e) => handleFileUpload("selfie", e)}
                            />
                          </label>
                        </div>
                        <p className="text-xs text-slate-500">Hold your ID next to your face</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
