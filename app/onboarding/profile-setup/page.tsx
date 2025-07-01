"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowRight, ArrowLeft, Upload, User, Building, MapPin, Globe, Plus, X } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function ProfileSetupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const accountType = searchParams.get("type") as "freelancer" | "client"

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    title: "",
    bio: "",
    location: "",
    website: "",
    skills: [] as string[],
    hourlyRate: "",
  })

  const [newSkill, setNewSkill] = useState("")
  const [profileImage, setProfileImage] = useState<string | null>(null)

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
  ]

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addSkill = (skill: string) => {
    if (skill && !formData.skills.includes(skill)) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, skill],
      }))
      setNewSkill("")
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }))
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleContinue = () => {
    // Save profile data to localStorage or state management
    localStorage.setItem(
      "onboardingProfile",
      JSON.stringify({
        ...formData,
        accountType,
        profileImage,
      }),
    )
    router.push("/onboarding/verification")
  }

  const isFormValid = () => {
    const requiredFields = ["firstName", "lastName", "email"]
    if (accountType === "client") {
      requiredFields.push("company")
    } else {
      requiredFields.push("title", "bio")
    }

    return requiredFields.every((field) => formData[field as keyof typeof formData])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">Getting Started</span>
              <span className="text-sm text-slate-500">Step 3 of 5</span>
            </div>
            <Progress value={60} className="h-2" />
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {accountType === "freelancer" ? (
                <User className="w-6 h-6 text-blue-600" />
              ) : (
                <Building className="w-6 h-6 text-blue-600" />
              )}
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              Set up your {accountType === "freelancer" ? "freelancer" : "company"} profile
            </h1>
            <p className="text-slate-600">
              {accountType === "freelancer"
                ? "Tell clients about your skills and experience"
                : "Create a compelling company profile to attract top talent"}
            </p>
          </div>

          <Card>
            <CardContent className="p-8 space-y-8">
              {/* Profile Image */}
              <div className="text-center">
                <div className="relative inline-block">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={profileImage || undefined} />
                    <AvatarFallback className="text-2xl bg-blue-100 text-blue-600">
                      {formData.firstName[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <label className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full cursor-pointer hover:bg-blue-600 transition-colors">
                    <Upload className="w-4 h-4" />
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                </div>
                <p className="text-sm text-slate-500 mt-2">Upload a profile photo</p>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    placeholder="Enter your first name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter your email address"
                />
              </div>

              {accountType === "client" ? (
                <div className="space-y-2">
                  <Label htmlFor="company">Company Name *</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => handleInputChange("company", e.target.value)}
                    placeholder="Enter your company name"
                  />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="title">Professional Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      placeholder="e.g., Full-Stack Developer, UI/UX Designer"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hourlyRate">Hourly Rate (HBAR)</Label>
                    <Input
                      id="hourlyRate"
                      type="number"
                      value={formData.hourlyRate}
                      onChange={(e) => handleInputChange("hourlyRate", e.target.value)}
                      placeholder="e.g., 50"
                    />
                  </div>
                </>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange("location", e.target.value)}
                      placeholder="City, Country"
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => handleInputChange("website", e.target.value)}
                      placeholder="https://yourwebsite.com"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">
                  {accountType === "freelancer" ? "Professional Bio *" : "Company Description"}
                </Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  placeholder={
                    accountType === "freelancer"
                      ? "Tell clients about your experience, skills, and what makes you unique..."
                      : "Describe your company, mission, and what kind of projects you work on..."
                  }
                  rows={4}
                />
              </div>

              {accountType === "freelancer" && (
                <div className="space-y-4">
                  <Label>Skills & Expertise</Label>

                  {/* Add Custom Skill */}
                  <div className="flex gap-2">
                    <Input
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Add a skill..."
                      onKeyPress={(e) => e.key === "Enter" && addSkill(newSkill)}
                    />
                    <Button type="button" onClick={() => addSkill(newSkill)} disabled={!newSkill}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Popular Skills */}
                  <div>
                    <p className="text-sm text-slate-600 mb-2">Popular skills:</p>
                    <div className="flex flex-wrap gap-2">
                      {popularSkills.map((skill) => (
                        <Badge
                          key={skill}
                          variant={formData.skills.includes(skill) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => addSkill(skill)}
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Selected Skills */}
                  {formData.skills.length > 0 && (
                    <div>
                      <p className="text-sm text-slate-600 mb-2">Your skills:</p>
                      <div className="flex flex-wrap gap-2">
                        {formData.skills.map((skill) => (
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
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Link href="/onboarding/account-type">
              <Button variant="outline" size="lg">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <Button
              size="lg"
              onClick={handleContinue}
              disabled={!isFormValid()}
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
