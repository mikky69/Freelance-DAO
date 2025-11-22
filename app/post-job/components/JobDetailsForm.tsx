'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Plus, X } from "lucide-react"

export const JobDetailsForm = ({ formData, skills, newSkill, setNewSkill, handleInputChange, addSkill, removeSkill }: any) => {
  return (
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
              {skills.map((skill: any, index: number) => (
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
  )
}