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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DollarSign, Users, FileText, Shield, Plus, X, Loader2, CreditCard, Wallet } from "lucide-react"
import { useState } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function PostJobPage() {
  const { user } = useAuth()
  const router = useRouter()
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    budgetType: "fixed",
    budgetMin: "",
    budgetMax: "",
    duration: "",
    experienceLevel: "intermediate",
    featured: false,
    urgent: false,
    useEscrow: true
  })
  
  const [skills, setSkills] = useState<string[]>([])
  const [newSkill, setNewSkill] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDraft, setIsDraft] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("")

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()])
      setNewSkill("")
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove))
  }
  
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }
  
  const validateForm = () => {
    const errors: string[] = []
    
    if (!formData.title.trim()) errors.push("Job title is required")
    if (!formData.description.trim()) errors.push("Job description is required")
    if (formData.description.trim().length < 100) errors.push("Description must be at least 100 characters")
    if (!formData.category) errors.push("Category is required")
    if (skills.length === 0) errors.push("At least one skill is required")
    if (!formData.budgetMin || parseFloat(formData.budgetMin) <= 0) errors.push("Valid minimum budget is required")
    if (formData.budgetMax && parseFloat(formData.budgetMax) <= parseFloat(formData.budgetMin)) {
      errors.push("Maximum budget must be greater than minimum budget")
    }
    if (!formData.duration) errors.push("Project duration is required")
    
    return errors
  }
  
  const submitJob = async (asDraft = false) => {
    // Check authentication first
    if (!user || !user.id) {
      toast.error('Please log in to post a job')
      router.push('/auth/signin/client')
      return
    }
    
    if (!asDraft) {
      const errors = validateForm()
      if (errors.length > 0) {
        toast.error(errors[0])
        return
      }
      
      // If job is featured and not draft, show payment modal
      if (formData.featured) {
        setShowPaymentModal(true)
        return
      }
    }
    
    // If not featured or is draft, proceed directly
    await processJobSubmission(asDraft)
  }

  const handlePaymentAndSubmit = async () => {
    if (!selectedPaymentMethod) {
      toast.error('Please select a payment method')
      return
    }
    
    setShowPaymentModal(false)
    
    // TODO: Implement actual payment processing here
    // For now, we'll just proceed with job posting
    toast.success(`Payment method selected: ${selectedPaymentMethod}. Payment processing  later.`)
    
    // Proceed with job posting
    await processJobSubmission(false)
  }

  const processJobSubmission = async (asDraft = false) => {
    setIsSubmitting(true)
    setIsDraft(asDraft)
    
    try {
      const token = localStorage.getItem('freelancedao_token')
      if (!token) {
        toast.error('Please log in to post a job')
        router.push('/auth/signin/client')
        return
      }
      
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          skills,
          budgetMin: parseFloat(formData.budgetMin),
          budgetMax: formData.budgetMax ? parseFloat(formData.budgetMax) : null
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast.success(asDraft ? 'Job saved as draft' : 'Job posted successfully!')
        router.push('/dashboard')
      } else {
        toast.error(data.message || 'Failed to post job')
      }
    } catch (error) {
      console.error('Error posting job:', error)
      toast.error('An error occurred while posting the job')
    } finally {
      setIsSubmitting(false)
      setIsDraft(false)
    }
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
            <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); submitJob(false); }}>
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
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="e.g. Build a responsive website for my startup"
                      className="text-base"
                      required
                    />
                    <p className="text-sm text-slate-500">
                      Write a clear, descriptive title that explains what you need done
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
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
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe your project in detail. Include what you want to achieve, any specific requirements, and what success looks like..."
                      className="min-h-32 text-base"
                      required
                    />
                    <p className="text-sm text-slate-500">
                      Minimum 100 characters. Be specific about your requirements. 
                      <span className="font-medium">
                        ({formData.description.length}/100)
                      </span>
                    </p>
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
                    <RadioGroup value={formData.budgetType} onValueChange={(value) => handleInputChange('budgetType', value)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <Input 
                        id="budget-min" 
                        type="number" 
                        value={formData.budgetMin}
                        onChange={(e) => handleInputChange('budgetMin', e.target.value)}
                        placeholder="1000" 
                        className="text-base" 
                        required
                        min="1"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="budget-max">
                        {formData.budgetType === 'fixed' ? 'Maximum Budget (HBAR)' : 'Maximum Rate (HBAR/hour)'}
                      </Label>
                      <Input 
                        id="budget-max" 
                        type="number" 
                        value={formData.budgetMax}
                        onChange={(e) => handleInputChange('budgetMax', e.target.value)}
                        placeholder={formData.budgetType === 'fixed' ? '5000' : '100'} 
                        className="text-base" 
                        min="1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timeline">Project Duration *</Label>
                    <Select value={formData.duration} onValueChange={(value) => handleInputChange('duration', value)}>
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
                  <RadioGroup value={formData.experienceLevel} onValueChange={(value) => handleInputChange('experienceLevel', value)} className="space-y-4">
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
                    <Checkbox 
                      id="featured" 
                      checked={formData.featured}
                      onCheckedChange={(checked) => handleInputChange('featured', checked)}
                    />
                    <Label htmlFor="featured" className="flex-1">
                      <div className="font-medium">Make this job featured</div>
                      <div className="text-sm text-slate-500">Get more visibility for +$20</div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="urgent" 
                      checked={formData.urgent}
                      onCheckedChange={(checked) => handleInputChange('urgent', checked)}
                    />
                    <Label htmlFor="urgent" className="flex-1">
                      <div className="font-medium">Mark as urgent</div>
                      <div className="text-sm text-slate-500">Show urgency to attract faster responses</div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="escrow" 
                      checked={formData.useEscrow}
                      onCheckedChange={(checked) => handleInputChange('useEscrow', checked)}
                    />
                    <Label htmlFor="escrow" className="flex-1">
                      <div className="font-medium">Use smart contract escrow</div>
                      <div className="text-sm text-slate-500">Secure payments with blockchain technology</div>
                    </Label>
                  </div>
                </CardContent>
              </Card>

              {/* Submit */}
              <div className="flex flex-col md:flex-row gap-4 pt-6">
                <Button 
                  type="button"
                  variant="outline" 
                  className="flex-1"
                  onClick={() => submitJob(true)}
                  disabled={isSubmitting}
                >
                  {isDraft && isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving Draft...
                    </>
                  ) : (
                    'Save as Draft'
                  )}
                </Button>
                <Button 
                  type="submit"
                  className="flex-1 bg-blue-500 hover:bg-blue-600"
                  disabled={isSubmitting}
                >
                  {!isDraft && isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Posting Job...
                    </>
                  ) : (
                    'Post Job'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Payment Method Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-blue-500" />
              Choose Payment Method
            </DialogTitle>
            <DialogDescription>
              Select your preferred payment method for the featured job listing (+$20)
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <RadioGroup value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-slate-50 cursor-pointer">
                <RadioGroupItem value="solana" id="solana" />
                <Label htmlFor="solana" className="flex-1 cursor-pointer">
                  <div className="flex items-center">
                    <Wallet className="w-5 h-5 mr-2 text-purple-500" />
                    <div>
                      <div className="font-medium">Solana (SOL)</div>
                      <div className="text-sm text-slate-500">Pay with Solana cryptocurrency</div>
                    </div>
                  </div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-slate-50 cursor-pointer">
                <RadioGroupItem value="hbar" id="hbar" />
                <Label htmlFor="hbar" className="flex-1 cursor-pointer">
                  <div className="flex items-center">
                    <Wallet className="w-5 h-5 mr-2 text-green-500" />
                    <div>
                      <div className="font-medium">HBAR (Hedera)</div>
                      <div className="text-sm text-slate-500">Pay with Hedera Hashgraph</div>
                    </div>
                  </div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-slate-50 cursor-pointer">
                <RadioGroupItem value="fiat" id="fiat" />
                <Label htmlFor="fiat" className="flex-1 cursor-pointer">
                  <div className="flex items-center">
                    <CreditCard className="w-5 h-5 mr-2 text-blue-500" />
                    <div>
                      <div className="font-medium">Credit/Debit Card</div>
                      <div className="text-sm text-slate-500">Pay with traditional payment methods</div>
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setShowPaymentModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handlePaymentAndSubmit}
              disabled={!selectedPaymentMethod || isSubmitting}
              className="flex-1 bg-blue-500 hover:bg-blue-600"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Continue with Payment'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  )
}
