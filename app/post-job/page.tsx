"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { DollarSign, Users, FileText, Shield, Plus, X } from "lucide-react"
import { useState } from "react"
import { ProtectedRoute } from "@/components/protected-route"

export default function PostJobPage() {
  const [skills, setSkills] = useState<string[]>([])
  const [newSkill, setNewSkill] = useState("")

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()])
      setNewSkill("")
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove))
  }

  return (
    <ProtectedRoute requireAuth={true} requiredRole="client" requireCompleteProfile={true}>
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <div className="bg-white border-b border-slate-200">
          <div className="container mx-auto px-4 py-6">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">Post a Job</h1>
              <p className="text-slate-600">Find the perfect freelancer for your project</p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <form className="space-y-8">
              {/* Job Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-blue-500" />
                    Job Details
                  </CardTitle>
                  <CardDescription>Provide clear information about your project</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Job Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g. Build a responsive website for my startup"
                      className="text-base"
                    />
                    <p className="text-sm text-slate-500">
                      Write a clear, descriptive title that explains what you need done
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="web-development">Web Development</SelectItem>
                        <SelectItem value="mobile-development">Mobile Development</SelectItem>
                        <SelectItem value="design">Design & Creative</SelectItem>
                        <SelectItem value="writing">Writing & Content</SelectItem>
                        <SelectItem value="marketing">Marketing & Sales</SelectItem>
                        <SelectItem value="blockchain">Blockchain & Web3</SelectItem>
                        <SelectItem value="data">Data & Analytics</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Project Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your project in detail. Include what you want to achieve, any specific requirements, and what success looks like..."
                      className="min-h-32 text-base"
                    />
                    <p className="text-sm text-slate-500">Minimum 100 characters. Be specific about your requirements.</p>
                  </div>

                  <div className="space-y-4">
                    <Label>Required Skills</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a skill (e.g. React, Design, Writing)"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                        className="flex-1"
                      />
                      <Button type="button" onClick={addSkill} variant="outline">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    {skills.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {skill}
                            <button type="button" onClick={() => removeSkill(skill)} className="ml-1 hover:text-red-500">
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Budget & Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="w-5 h-5 mr-2 text-green-500" />
                    Budget & Timeline
                  </CardTitle>
                  <CardDescription>Set your budget and project timeline</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <Label>Budget Type *</Label>
                    <RadioGroup defaultValue="fixed" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2 p-4 border border-slate-200 rounded-lg">
                        <RadioGroupItem value="fixed" id="fixed" />
                        <Label htmlFor="fixed" className="flex-1 cursor-pointer">
                          <div className="font-medium">Fixed Price</div>
                          <div className="text-sm text-slate-500">Pay a set amount for the entire project</div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-4 border border-slate-200 rounded-lg">
                        <RadioGroupItem value="hourly" id="hourly" />
                        <Label htmlFor="hourly" className="flex-1 cursor-pointer">
                          <div className="font-medium">Hourly Rate</div>
                          <div className="text-sm text-slate-500">Pay based on time worked</div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="budget-min">Minimum Budget (HBAR) *</Label>
                      <Input id="budget-min" type="number" placeholder="1000" className="text-base" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="budget-max">Maximum Budget (HBAR) *</Label>
                      <Input id="budget-max" type="number" placeholder="5000" className="text-base" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timeline">Project Duration *</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select project duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="less-than-1-week">Less than 1 week</SelectItem>
                        <SelectItem value="1-2-weeks">1-2 weeks</SelectItem>
                        <SelectItem value="2-4-weeks">2-4 weeks</SelectItem>
                        <SelectItem value="1-3-months">1-3 months</SelectItem>
                        <SelectItem value="3-6-months">3-6 months</SelectItem>
                        <SelectItem value="more-than-6-months">More than 6 months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Experience Level */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="w-5 h-5 mr-2 text-purple-500" />
                    Experience Level
                  </CardTitle>
                  <CardDescription>What level of experience do you need?</CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup defaultValue="intermediate" className="space-y-4">
                    <div className="flex items-center space-x-2 p-4 border border-slate-200 rounded-lg">
                      <RadioGroupItem value="entry" id="entry" />
                      <Label htmlFor="entry" className="flex-1 cursor-pointer">
                        <div className="font-medium">Entry Level</div>
                        <div className="text-sm text-slate-500">New freelancers with basic skills</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-4 border border-slate-200 rounded-lg">
                      <RadioGroupItem value="intermediate" id="intermediate" />
                      <Label htmlFor="intermediate" className="flex-1 cursor-pointer">
                        <div className="font-medium">Intermediate</div>
                        <div className="text-sm text-slate-500">Experienced freelancers with proven track record</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-4 border border-slate-200 rounded-lg">
                      <RadioGroupItem value="expert" id="expert" />
                      <Label htmlFor="expert" className="flex-1 cursor-pointer">
                        <div className="font-medium">Expert</div>
                        <div className="text-sm text-slate-500">Top-tier freelancers with specialized expertise</div>
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Additional Options */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-blue-500" />
                    Additional Options
                  </CardTitle>
                  <CardDescription>Optional settings for your job post</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="featured" />
                    <Label htmlFor="featured" className="flex-1">
                      <div className="font-medium">Make this job featured</div>
                      <div className="text-sm text-slate-500">Get more visibility for +100 HBAR</div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox id="urgent" />
                    <Label htmlFor="urgent" className="flex-1">
                      <div className="font-medium">Mark as urgent</div>
                      <div className="text-sm text-slate-500">Show urgency to attract faster responses</div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox id="escrow" defaultChecked />
                    <Label htmlFor="escrow" className="flex-1">
                      <div className="font-medium">Use smart contract escrow</div>
                      <div className="text-sm text-slate-500">Secure payments with blockchain technology</div>
                    </Label>
                  </div>
                </CardContent>
              </Card>

              {/* Submit */}
              <div className="flex flex-col md:flex-row gap-4 pt-6">
                <Button variant="outline" className="flex-1">
                  Save as Draft
                </Button>
                <Button className="flex-1 bg-blue-500 hover:bg-blue-600">Post Job</Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
