"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, AlertCircle, Plus, X } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

interface ProfileCompletionProps {
  onComplete?: () => void;
  missingFields?: string[];
  userType: 'freelancer' | 'client';
}

const fieldLabels: Record<string, string> = {
  fullname: 'Full Name',
  email: 'Email Address',
  title: 'Professional Title',
  bio: 'Professional Bio',
  location: 'Location',
  skills: 'Skills (minimum 3)',
  category: 'Category',
  hourlyRate: 'Hourly Rate (HBAR)',
  company: 'Company Name'
};

const categories = [
  { value: 'web-dev', label: 'Web Development' },
  { value: 'mobile-dev', label: 'Mobile Development' },
  { value: 'design', label: 'Design' },
  { value: 'writing', label: 'Writing' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'data', label: 'Data Science' },
  { value: 'photography', label: 'Photography' },
  { value: 'blockchain', label: 'Blockchain' },
  { value: 'other', label: 'Other' }
];

const popularSkills = [
  'JavaScript', 'React', 'Node.js', 'Python', 'UI/UX Design',
  'Graphic Design', 'Content Writing', 'Digital Marketing',
  'WordPress', 'Shopify', 'Mobile Development', 'Blockchain'
];

export default function ProfileCompletion({ 
  onComplete, 
  missingFields = [], 
  userType 
}: ProfileCompletionProps) {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);

  useEffect(() => {
    if (user) {
      setFormData({
        fullname: user.name || '',
        email: user.email || '',
        title: user.profile?.title || '',
        bio: '',
        location: '',
        category: '',
        hourlyRate: user.profile?.hourlyRate || '',
        company: user.profile?.company || ''
      });
      setSkills(user.profile?.skills || []);
    }
  }, [user]);

  useEffect(() => {
    const totalFields = missingFields.length;
    const completedFields = missingFields.filter(field => {
      if (field === 'skills') {
        return skills.length >= 3;
      }
      return formData[field] && formData[field].toString().trim() !== '';
    }).length;
    
    setCompletionPercentage(totalFields > 0 ? (completedFields / totalFields) * 100 : 100);
  }, [formData, skills, missingFields]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addSkill = (skill: string) => {
    if (skill && !skills.includes(skill)) {
      setSkills(prev => [...prev, skill]);
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(prev => prev.filter(skill => skill !== skillToRemove));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Here you would typically make an API call to update the user profile
      // For now, we'll update the local user context
      const updatedProfile = {
        ...user?.profile,
        ...formData,
        skills: userType === 'freelancer' ? skills : undefined
      };
      
      updateUser({ 
        name: formData.fullname,
        email: formData.email,
        profile: updatedProfile 
      });
      
      toast.success('Profile updated successfully!');
      onComplete?.();
    } catch (error) {
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    return missingFields.every(field => {
      if (field === 'skills') {
        return skills.length >= 3;
      }
      return formData[field] && formData[field].toString().trim() !== '';
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle>Complete Your Profile</CardTitle>
              <p className="text-sm text-slate-600 mt-1">
                Please fill in the missing information to complete your profile
              </p>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Profile Completion</span>
              <span className="text-sm text-slate-600">{Math.round(completionPercentage)}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Complete your profile to start {userType === 'freelancer' ? 'finding work' : 'hiring talent'} on the platform.
            </AlertDescription>
          </Alert>

          {missingFields.map(field => {
            if (field === 'skills' && userType === 'freelancer') {
              return (
                <div key={field} className="space-y-3">
                  <Label>{fieldLabels[field]}</Label>
                  
                  <div className="flex gap-2">
                    <Input
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Add a skill..."
                      onKeyPress={(e) => e.key === 'Enter' && addSkill(newSkill)}
                    />
                    <Button 
                      type="button" 
                      onClick={() => addSkill(newSkill)} 
                      disabled={!newSkill}
                      size="sm"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {popularSkills.map(skill => (
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
                  
                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {skills.map(skill => (
                        <Badge key={skill} className="bg-blue-100 text-blue-800">
                          {skill}
                          <button 
                            onClick={() => removeSkill(skill)} 
                            className="ml-2 hover:text-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  {skills.length < 3 && (
                    <p className="text-sm text-amber-600">
                      Please add at least 3 skills ({3 - skills.length} more needed)
                    </p>
                  )}
                </div>
              );
            }
            
            if (field === 'category' && userType === 'freelancer') {
              return (
                <div key={field} className="space-y-2">
                  <Label>{fieldLabels[field]}</Label>
                  <Select 
                    value={formData[field]} 
                    onValueChange={(value) => handleInputChange(field, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              );
            }
            
            if (field === 'bio') {
              return (
                <div key={field} className="space-y-2">
                  <Label>{fieldLabels[field]}</Label>
                  <Textarea
                    value={formData[field] || ''}
                    onChange={(e) => handleInputChange(field, e.target.value)}
                    placeholder={userType === 'freelancer' 
                      ? "Tell clients about your experience and expertise..."
                      : "Describe your company and what you do..."
                    }
                    rows={4}
                  />
                </div>
              );
            }
            
            return (
              <div key={field} className="space-y-2">
                <Label>{fieldLabels[field]}</Label>
                <Input
                  type={field === 'email' ? 'email' : field === 'hourlyRate' ? 'number' : 'text'}
                  value={formData[field] || ''}
                  onChange={(e) => handleInputChange(field, e.target.value)}
                  placeholder={`Enter your ${fieldLabels[field].toLowerCase()}`}
                />
              </div>
            );
          })}
          
          <div className="flex gap-3 pt-4">
            <Button 
              onClick={handleSubmit}
              disabled={!isFormValid() || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Updating...' : 'Complete Profile'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}