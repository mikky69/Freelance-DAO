'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { DollarSign, Users, Shield } from "lucide-react"

export const JobConfigurationForm = ({ formData, handleInputChange }: any) => {
  return (
    <>
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
    </>
  )
}