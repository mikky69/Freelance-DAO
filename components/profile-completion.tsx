"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, Plus, X, ArrowLeft, ArrowRight, User, Briefcase, MapPin, Star, DollarSign } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

interface ProfileCompletionStepsProps {
  onComplete?: () => void
  userType: "freelancer" | "client"
}

interface StepData {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  fields: string[]
}

const categories = [
  { value: "web-dev", label: "Web Development" },
  { value: "mobile-dev", label: "Mobile Development" },
  { value: "design", label: "Design" },
  { value: "writing", label: "Writing" },
  { value: "marketing", label: "Marketing" },
  { value: "data", label: "Data Science" },
  { value: "photography", label: "Photography" },
  { value: "blockchain", label: "Blockchain" },
  { value: "other", label: "Other" },
]

const popularSkills = [
  "JavaScript",
  "React",
  "Node.js",
  "Python",
  "UI/UX Design",
  "Graphic Design",
  "Content Writing",
  "Digital Marketing",
  "WordPress",
  "Shopify",
  "Mobile Development",
  "Blockchain",
  "TypeScript",
  "Vue.js",
  "Angular",
  "PHP",
  "Java",
  "C++",
  "Photoshop",
  "Illustrator",
  "Figma",
  "SEO",
  "Social Media",
]

const experienceLevels = [
  { value: "beginner", label: "Beginner (0-1 years)" },
  { value: "intermediate", label: "Intermediate (2-5 years)" },
  { value: "expert", label: "Expert (5+ years)" },
]

const availabilityOptions = [
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "occasional", label: "Occasional" },
]

const languages = [
  "English",
  "Spanish",
  "French",
  "German",
  "Italian",
  "Portuguese",
  "Russian",
  "Chinese",
  "Japanese",
  "Korean",
  "Arabic",
  "Hindi",
]

const budgetPreferences = [
  { value: "hourly", label: "Hourly Rate" },
  { value: "fixed", label: "Fixed Price" },
  { value: "both", label: "Both" },
]

export default function ProfileCompletionSteps({ onComplete, userType }: ProfileCompletionStepsProps) {
  const { user, updateUser } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [skills, setSkills] = useState<string[]>([])
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(["English"])
  const [newSkill, setNewSkill] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const freelancerSteps: StepData[] = [
    {
      id: "basic",
      title: "Basic Information",
      description: "Let's start with your basic details",
      icon: <User className="w-5 h-5" />,
      fields: ["fullname", "email"],
    },
    {
      id: "professional",
      title: "Professional Title & Bio",
      description: "Tell us about your professional background",
      icon: <Briefcase className="w-5 h-5" />,
      fields: ["title", "bio"],
    },
    {
      id: "location",
      title: "Location & Languages",
      description: "Where are you based and what languages do you speak?",
      icon: <MapPin className="w-5 h-5" />,
      fields: ["location", "languages"],
    },
    {
      id: "skills",
      title: "Skills & Category",
      description: "What are your main skills and area of expertise?",
      icon: <Star className="w-5 h-5" />,
      fields: ["skills", "category"],
    },
    {
      id: "experience",
      title: "Experience & Availability",
      description: "Tell us about your experience level and availability",
      icon: <Briefcase className="w-5 h-5" />,
      fields: ["experienceLevel", "availability"],
    },
    {
      id: "pricing",
      title: "Pricing",
      description: "Set your hourly rate",
      icon: <DollarSign className="w-5 h-5" />,
      fields: ["hourlyRate"],
    },
  ]

  const clientSteps: StepData[] = [
    {
      id: "basic",
      title: "Basic Information",
      description: "Let's start with your basic details",
      icon: <User className="w-5 h-5" />,
      fields: ["fullname", "email"],
    },
    {
      id: "company",
      title: "Company Information",
      description: "Tell us about your company",
      icon: <Briefcase className="w-5 h-5" />,
      fields: ["company", "bio"],
    },
    {
      id: "location",
      title: "Location & Languages",
      description: "Where is your company based?",
      icon: <MapPin className="w-5 h-5" />,
      fields: ["location", "languages"],
    },
    {
      id: "hiring",
      title: "Hiring Preferences",
      description: "What type of freelancers do you usually hire?",
      icon: <Star className="w-5 h-5" />,
      fields: ["hiringNeeds", "budgetPreference"],
    },
  ]

  const steps = userType === "freelancer" ? freelancerSteps : clientSteps

  useEffect(() => {
    if (user) {
      setFormData({
        fullname: user.name || "",
        email: user.email || "",
        title: user.profile?.title || "",
        bio: user.profile?.bio || "",
        location: user.profile?.location || "",
        category: user.profile?.category || "",
        hourlyRate: user.profile?.hourlyRate || "",
        company: user.profile?.company || "",
        experienceLevel: user.profile?.experienceLevel || "",
        availability: user.profile?.availability || "",
        hiringNeeds: user.profile?.hiringNeeds || "",
        budgetPreference: user.profile?.budgetPreference || "",
      })
      setSkills(user.profile?.skills || [])
      setSelectedLanguages(user.profile?.languages || ["English"])
    }
  }, [user])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addSkill = (skill: string) => {
    if (skill && !skills.includes(skill)) {
      setSkills((prev) => [...prev, skill])
      setNewSkill("")
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setSkills((prev) => prev.filter((skill) => skill !== skillToRemove))
  }

  const toggleLanguage = (language: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(language) ? prev.filter((lang) => lang !== language) : [...prev, language],
    )
  }

  const isStepValid = (stepIndex: number) => {
    const step = steps[stepIndex]
    return step.fields.every((field) => {
      if (field === "skills") {
        return skills.length >= 3
      }
      if (field === "languages") {
        return selectedLanguages.length > 0
      }
      const value = formData[field]
      return value && value.toString().trim() !== ""
    })
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const updatedProfile = {
        ...user?.profile,
        title: formData.title,
        bio: formData.bio,
        location: formData.location,
        category: formData.category,
        hourlyRate: userType === "freelancer" ? Number(formData.hourlyRate) : undefined,
        company: userType === "client" ? formData.company : undefined,
        experienceLevel: userType === "freelancer" ? formData.experienceLevel : undefined,
        availability: userType === "freelancer" ? formData.availability : undefined,
        hiringNeeds: userType === "client" ? formData.hiringNeeds : undefined,
        budgetPreference: userType === "client" ? formData.budgetPreference : undefined,
        skills: userType === "freelancer" ? skills : undefined,
        languages: selectedLanguages,
      }

      updateUser({
        name: formData.fullname,
        email: formData.email,
        profile: updatedProfile,
      })

      toast.success("Profile completed successfully!")
      onComplete?.()
    } catch (error) {
      toast.error("Failed to complete profile. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStepContent = () => {
    const step = steps[currentStep]

    switch (step.id) {
      case "basic":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullname">Full Name *</Label>
              <Input
                id="fullname"
                value={formData.fullname || ""}
                onChange={(e) => handleInputChange("fullname", e.target.value)}
                placeholder="Enter your full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ""}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Enter your email address"
              />
            </div>
          </div>
        )

      case "professional":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Professional Title *</Label>
              <Input
                id="title"
                value={formData.title || ""}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="e.g., Full-Stack Developer, Graphic Designer"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Professional Bio *</Label>
              <Textarea
                id="bio"
                value={formData.bio || ""}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                placeholder="Tell clients about your experience, expertise, and what makes you stand out..."
                rows={4}
              />
            </div>
          </div>
        )

      case "company":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company">Company Name *</Label>
              <Input
                id="company"
                value={formData.company || ""}
                onChange={(e) => handleInputChange("company", e.target.value)}
                placeholder="Enter your company name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Company Description *</Label>
              <Textarea
                id="bio"
                value={formData.bio || ""}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                placeholder="Describe what your company does and what type of projects you post..."
                rows={4}
              />
            </div>
          </div>
        )

      case "location":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={formData.location || ""}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="City, Country"
              />
            </div>
            <div className="space-y-3">
              <Label>Languages Spoken *</Label>
              <div className="flex flex-wrap gap-2">
                {languages.map((language) => (
                  <Badge
                    key={language}
                    variant={selectedLanguages.includes(language) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleLanguage(language)}
                  >
                    {language}
                  </Badge>
                ))}
              </div>
              {selectedLanguages.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-slate-600">Selected:</span>
                  {selectedLanguages.map((language) => (
                    <Badge key={language} className="bg-blue-100 text-blue-800">
                      {language}
                      <button onClick={() => toggleLanguage(language)} className="ml-2 hover:text-red-600">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        )

      case "skills":
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              <Label>Skills (minimum 3) *</Label>

              <div className="flex gap-2">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a custom skill..."
                  onKeyPress={(e) => e.key === "Enter" && addSkill(newSkill)}
                />
                <Button type="button" onClick={() => addSkill(newSkill)} disabled={!newSkill} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <span className="text-sm text-slate-600">Popular skills:</span>
                <div className="flex flex-wrap gap-2">
                  {popularSkills.map((skill) => (
                    <Badge
                      key={skill}
                      variant={skills.includes(skill) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => addSkill(skill)}
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              {skills.length > 0 && (
                <div className="space-y-2">
                  <span className="text-sm text-slate-600">Your skills:</span>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <Badge key={skill} className="bg-blue-100 text-blue-800">
                        {skill}
                        <button onClick={() => removeSkill(skill)} className="ml-2 hover:text-red-600">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {skills.length < 3 && (
                <p className="text-sm text-amber-600">Please add at least 3 skills ({3 - skills.length} more needed)</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Main Category *</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your main category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case "experience":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="experienceLevel">Experience Level *</Label>
              <Select
                value={formData.experienceLevel}
                onValueChange={(value) => handleInputChange("experienceLevel", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your experience level" />
                </SelectTrigger>
                <SelectContent>
                  {experienceLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="availability">Availability *</Label>
              <Select value={formData.availability} onValueChange={(value) => handleInputChange("availability", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your availability" />
                </SelectTrigger>
                <SelectContent>
                  {availabilityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case "pricing":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="hourlyRate">Hourly Rate (HBAR) *</Label>
              <Input
                id="hourlyRate"
                type="number"
                value={formData.hourlyRate || ""}
                onChange={(e) => handleInputChange("hourlyRate", e.target.value)}
                placeholder="Enter your hourly rate"
                min="0"
              />
              <p className="text-sm text-slate-600">Set a competitive rate based on your experience and skills</p>
            </div>
          </div>
        )

      case "hiring":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="hiringNeeds">What type of freelancers do you usually hire? *</Label>
              <Textarea
                id="hiringNeeds"
                value={formData.hiringNeeds || ""}
                onChange={(e) => handleInputChange("hiringNeeds", e.target.value)}
                placeholder="e.g., Web developers, designers, content writers..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budgetPreference">Budget Preference *</Label>
              <Select
                value={formData.budgetPreference}
                onValueChange={(value) => handleInputChange("budgetPreference", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your budget preference" />
                </SelectTrigger>
                <SelectContent>
                  {budgetPreferences.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const currentStepData = steps[currentStep]
  const progress = ((currentStep + 1) / steps.length) * 100

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              {currentStepData.icon}
            </div>
            <div>
              <CardTitle>{currentStepData.title}</CardTitle>
              <p className="text-sm text-slate-600 mt-1">{currentStepData.description}</p>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                Step {currentStep + 1} of {steps.length}
              </span>
              <span className="text-sm text-slate-600">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Complete your profile to start {userType === "freelancer" ? "finding work" : "hiring talent"} on the
              platform.
            </AlertDescription>
          </Alert>

          {renderStepContent()}

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center gap-2 bg-transparent"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </Button>

            <div className="flex-1" />

            {currentStep === steps.length - 1 ? (
              <Button
                onClick={handleSubmit}
                disabled={!isStepValid(currentStep) || isSubmitting}
                className="flex items-center gap-2"
              >
                {isSubmitting ? "Completing..." : "Complete Profile"}
                <CheckCircle className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={handleNext} disabled={!isStepValid(currentStep)} className="flex items-center gap-2">
                Next
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
