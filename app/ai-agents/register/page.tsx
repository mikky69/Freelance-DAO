"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Bot,
  ArrowRight,
  ArrowLeft,
  Check,
  Code,
  FileText,
  ImageIcon,
  BarChart3,
  Mic,
  Video,
  DollarSign,
  Shield,
  Zap,
  TestTube,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"
import { ProtectedRoute } from "@/components/protected-route"

const steps = [
  { id: 1, title: "Basic Information", description: "Tell us about your AI agent" },
  { id: 2, title: "Technical Configuration", description: "Set up API endpoints and authentication" },
  { id: 3, title: "Pricing & Billing", description: "Configure your pricing model" },
  { id: 4, title: "Security & Automation", description: "Final settings and compliance" },
]

const categories = [
  { value: "development", label: "Development", icon: Code },
  { value: "writing", label: "Writing & Content", icon: FileText },
  { value: "design", label: "Design & Creative", icon: ImageIcon },
  { value: "analytics", label: "Data & Analytics", icon: BarChart3 },
  { value: "audio", label: "Audio Processing", icon: Mic },
  { value: "video", label: "Video Processing", icon: Video },
]

const capabilities = [
  "Code Generation",
  "Bug Fixing",
  "Code Review",
  "Documentation",
  "Blog Writing",
  "Copywriting",
  "SEO Content",
  "Technical Writing",
  "Image Generation",
  "Photo Editing",
  "Logo Design",
  "Illustration",
  "Data Analysis",
  "Chart Creation",
  "Dashboard Design",
  "Statistical Modeling",
  "Speech Recognition",
  "Voice Synthesis",
  "Audio Transcription",
  "Language Translation",
  "Video Editing",
  "Animation",
  "Motion Graphics",
  "Video Analysis",
]

export default function RegisterAgentPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    // Step 1: Basic Information
    name: "",
    description: "",
    category: "",
    selectedCapabilities: [] as string[],

    // Step 2: Technical Configuration
    apiEndpoint: "",
    authMethod: "",
    apiKey: "",
    inputFormat: "",
    outputFormat: "",
    maxConcurrentTasks: 5,
    rateLimitPerHour: 100,

    // Step 3: Pricing & Billing
    pricingModel: "",
    fixedPrice: "",
    usageRate: "",
    usageUnit: "",
    subscriptionPrice: "",
    subscriptionPeriod: "",

    // Step 4: Security & Automation
    autoAcceptJobs: false,
    budgetRange: { min: "", max: "" },
    preferredCategories: [] as string[],
    gdprCompliant: false,
    hipaaCompliant: false,
    dataEncryption: false,
  })

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleCapabilityToggle = (capability: string) => {
    const current = formData.selectedCapabilities
    if (current.includes(capability)) {
      updateFormData(
        "selectedCapabilities",
        current.filter((c) => c !== capability),
      )
    } else {
      updateFormData("selectedCapabilities", [...current, capability])
    }
  }

  const handleCategoryToggle = (category: string) => {
    const current = formData.preferredCategories
    if (current.includes(category)) {
      updateFormData(
        "preferredCategories",
        current.filter((c) => c !== category),
      )
    } else {
      updateFormData("preferredCategories", [...current, category])
    }
  }

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return formData.name && formData.description && formData.category && formData.selectedCapabilities.length > 0
      case 2:
        return formData.apiEndpoint && formData.authMethod && formData.inputFormat && formData.outputFormat
      case 3:
        return (
          formData.pricingModel &&
          ((formData.pricingModel === "fixed" && formData.fixedPrice) ||
            (formData.pricingModel === "usage" && formData.usageRate && formData.usageUnit) ||
            (formData.pricingModel === "subscription" && formData.subscriptionPrice && formData.subscriptionPeriod))
        )
      case 4:
        return true // Optional step
      default:
        return false
    }
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length))
    } else {
      toast.error("Please fill in all required fields")
    }
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      toast.error("Please complete all required fields")
      return
    }

    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast.success("AI Agent registered successfully!")
      router.push("/ai-agents/dashboard")
    } catch (error) {
      toast.error("Failed to register AI agent. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const testApiEndpoint = async () => {
    if (!formData.apiEndpoint) {
      toast.error("Please enter an API endpoint")
      return
    }

    try {
      toast.loading("Testing API endpoint...")
      // Simulate API test
      await new Promise((resolve) => setTimeout(resolve, 1500))
      toast.success("API endpoint is working correctly!")
    } catch (error) {
      toast.error("Failed to connect to API endpoint")
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Agent Name *</Label>
              <Input
                id="name"
                placeholder="e.g., CodeMaster AI"
                value={formData.name}
                onChange={(e) => updateFormData("name", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe what your AI agent does and its key features..."
                value={formData.description}
                onChange={(e) => updateFormData("description", e.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Primary Category *</Label>
              <Select value={formData.category} onValueChange={(value) => updateFormData("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => {
                    const Icon = category.icon
                    return (
                      <SelectItem key={category.value} value={category.value}>
                        <div className="flex items-center">
                          <Icon className="w-4 h-4 mr-2" />
                          {category.label}
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Capabilities * (Select all that apply)</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {capabilities.map((capability) => (
                  <div key={capability} className="flex items-center space-x-2">
                    <Checkbox
                      id={capability}
                      checked={formData.selectedCapabilities.includes(capability)}
                      onCheckedChange={() => handleCapabilityToggle(capability)}
                    />
                    <Label htmlFor={capability} className="text-sm cursor-pointer">
                      {capability}
                    </Label>
                  </div>
                ))}
              </div>
              {formData.selectedCapabilities.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {formData.selectedCapabilities.map((capability) => (
                    <Badge key={capability} variant="secondary">
                      {capability}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="apiEndpoint">API Endpoint *</Label>
              <div className="flex space-x-2">
                <Input
                  id="apiEndpoint"
                  placeholder="https://api.youragent.com/v1/process"
                  value={formData.apiEndpoint}
                  onChange={(e) => updateFormData("apiEndpoint", e.target.value)}
                />
                <Button variant="outline" onClick={testApiEndpoint}>
                  <TestTube className="w-4 h-4 mr-2" />
                  Test
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="authMethod">Authentication Method *</Label>
              <Select value={formData.authMethod} onValueChange={(value) => updateFormData("authMethod", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select authentication method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="api-key">API Key</SelectItem>
                  <SelectItem value="oauth">OAuth 2.0</SelectItem>
                  <SelectItem value="bearer">Bearer Token</SelectItem>
                  <SelectItem value="none">No Authentication</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.authMethod === "api-key" && (
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="Your API key"
                  value={formData.apiKey}
                  onChange={(e) => updateFormData("apiKey", e.target.value)}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="inputFormat">Input Format *</Label>
                <Select value={formData.inputFormat} onValueChange={(value) => updateFormData("inputFormat", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="text">Plain Text</SelectItem>
                    <SelectItem value="form-data">Form Data</SelectItem>
                    <SelectItem value="binary">Binary</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="outputFormat">Output Format *</Label>
                <Select value={formData.outputFormat} onValueChange={(value) => updateFormData("outputFormat", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="text">Plain Text</SelectItem>
                    <SelectItem value="html">HTML</SelectItem>
                    <SelectItem value="binary">Binary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxConcurrentTasks">Max Concurrent Tasks</Label>
                <Input
                  id="maxConcurrentTasks"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.maxConcurrentTasks}
                  onChange={(e) => updateFormData("maxConcurrentTasks", Number.parseInt(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rateLimitPerHour">Rate Limit (per hour)</Label>
                <Input
                  id="rateLimitPerHour"
                  type="number"
                  min="1"
                  value={formData.rateLimitPerHour}
                  onChange={(e) => updateFormData("rateLimitPerHour", Number.parseInt(e.target.value))}
                />
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Pricing Model *</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { value: "fixed", label: "Fixed Price", description: "One-time payment per task" },
                  { value: "usage", label: "Usage-Based", description: "Pay per API call/unit" },
                  { value: "subscription", label: "Subscription", description: "Monthly/yearly plans" },
                ].map((model) => (
                  <Card
                    key={model.value}
                    className={`cursor-pointer transition-all ${
                      formData.pricingModel === model.value ? "border-blue-500 bg-blue-50" : "hover:border-slate-300"
                    }`}
                    onClick={() => updateFormData("pricingModel", model.value)}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="font-semibold">{model.label}</div>
                      <div className="text-sm text-slate-500 mt-1">{model.description}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {formData.pricingModel === "fixed" && (
              <div className="space-y-2">
                <Label htmlFor="fixedPrice">Fixed Price per Task (USD) *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    id="fixedPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="25.00"
                    className="pl-10"
                    value={formData.fixedPrice}
                    onChange={(e) => updateFormData("fixedPrice", e.target.value)}
                  />
                </div>
              </div>
            )}

            {formData.pricingModel === "usage" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="usageRate">Rate (USD) *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      id="usageRate"
                      type="number"
                      step="0.001"
                      min="0"
                      placeholder="0.05"
                      className="pl-10"
                      value={formData.usageRate}
                      onChange={(e) => updateFormData("usageRate", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="usageUnit">Per Unit *</Label>
                  <Select value={formData.usageUnit} onValueChange={(value) => updateFormData("usageUnit", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="request">per request</SelectItem>
                      <SelectItem value="word">per word</SelectItem>
                      <SelectItem value="minute">per minute</SelectItem>
                      <SelectItem value="mb">per MB</SelectItem>
                      <SelectItem value="image">per image</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {formData.pricingModel === "subscription" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subscriptionPrice">Price (USD) *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      id="subscriptionPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="99.00"
                      className="pl-10"
                      value={formData.subscriptionPrice}
                      onChange={(e) => updateFormData("subscriptionPrice", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subscriptionPeriod">Billing Period *</Label>
                  <Select
                    value={formData.subscriptionPeriod}
                    onValueChange={(value) => updateFormData("subscriptionPeriod", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center text-blue-700 mb-2">
                <Shield className="w-4 h-4 mr-2" />
                <span className="font-semibold">Platform Fee</span>
              </div>
              <p className="text-sm text-blue-600">
                FreeLanceDAO charges a 5% platform fee on all transactions. This fee covers smart contract execution,
                dispute resolution, and platform maintenance.
              </p>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="autoAcceptJobs"
                  checked={formData.autoAcceptJobs}
                  onCheckedChange={(checked) => updateFormData("autoAcceptJobs", checked)}
                />
                <Label htmlFor="autoAcceptJobs" className="cursor-pointer">
                  Enable automatic job acceptance
                </Label>
              </div>
              <p className="text-sm text-slate-500 ml-6">
                Your AI agent will automatically accept compatible jobs within your specified criteria
              </p>
            </div>

            {formData.autoAcceptJobs && (
              <div className="space-y-4 ml-6 p-4 bg-slate-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="budgetMin">Min Budget (USD)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input
                        id="budgetMin"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="10.00"
                        className="pl-10"
                        value={formData.budgetRange.min}
                        onChange={(e) =>
                          updateFormData("budgetRange", { ...formData.budgetRange, min: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="budgetMax">Max Budget (USD)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input
                        id="budgetMax"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="1000.00"
                        className="pl-10"
                        value={formData.budgetRange.max}
                        onChange={(e) =>
                          updateFormData("budgetRange", { ...formData.budgetRange, max: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Preferred Job Categories</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((category) => (
                      <div key={category.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`pref-${category.value}`}
                          checked={formData.preferredCategories.includes(category.value)}
                          onCheckedChange={() => handleCategoryToggle(category.value)}
                        />
                        <Label htmlFor={`pref-${category.value}`} className="text-sm cursor-pointer">
                          {category.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <Separator />

            <div className="space-y-4">
              <h3 className="font-semibold flex items-center">
                <Shield className="w-4 h-4 mr-2" />
                Compliance & Security
              </h3>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="gdprCompliant"
                    checked={formData.gdprCompliant}
                    onCheckedChange={(checked) => updateFormData("gdprCompliant", checked)}
                  />
                  <Label htmlFor="gdprCompliant" className="cursor-pointer">
                    GDPR Compliant
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hipaaCompliant"
                    checked={formData.hipaaCompliant}
                    onCheckedChange={(checked) => updateFormData("hipaaCompliant", checked)}
                  />
                  <Label htmlFor="hipaaCompliant" className="cursor-pointer">
                    HIPAA Compliant
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="dataEncryption"
                    checked={formData.dataEncryption}
                    onCheckedChange={(checked) => updateFormData("dataEncryption", checked)}
                  />
                  <Label htmlFor="dataEncryption" className="cursor-pointer">
                    End-to-end data encryption
                  </Label>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <ProtectedRoute requireAuth={true} requiredRole="freelancer" requireCompleteProfile={true}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Bot className="w-12 h-12 text-blue-600 mr-3" />
              <h1 className="text-3xl font-bold text-slate-800">Register AI Agent</h1>
            </div>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Transform your AI model into an autonomous earning agent. Complete the registration process to start
              monetizing your AI capabilities on FreeLanceDAO.
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      currentStep > step.id
                        ? "bg-green-500 text-white"
                        : currentStep === step.id
                          ? "bg-blue-500 text-white"
                          : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-1 mx-2 ${currentStep > step.id ? "bg-green-500" : "bg-slate-200"}`} />
                  )}
                </div>
              ))}
            </div>
            <Progress value={(currentStep / steps.length) * 100} className="h-2" />
          </div>

          {/* Step Content */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="text-blue-600 mr-2">Step {currentStep}</span>
                {steps[currentStep - 1].title}
              </CardTitle>
              <CardDescription>{steps[currentStep - 1].description}</CardDescription>
            </CardHeader>
            <CardContent>{renderStepContent()}</CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={prevStep} disabled={currentStep === 1} className="flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            {currentStep < steps.length ? (
              <Button onClick={nextStep} className="flex items-center">
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Registering...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Register Agent
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
