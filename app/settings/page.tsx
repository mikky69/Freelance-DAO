"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import {
  User,
  Shield,
  Bell,
  Wallet,
  Eye,
  Lock,
  Smartphone,
  Mail,
  Camera,
  Save,
  AlertTriangle,
  CheckCircle,
  Loader2,
} from "lucide-react"
import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

interface ProfileData {
  fullname: string
  email: string
  title: string
  bio: string
  location: string
  hourlyRate: number
  availability: string
  skills: string[]
  languages: string[]
  avatar: string
  company: string
}

interface PrivacySettings {
  profileVisibility: string
  showEmail: boolean
  showPhone: boolean
  showLocation: boolean
  showEarnings: boolean
  showSpent: boolean
  allowDirectContact: boolean
}

interface NotificationSettings {
  email: {
    jobAlerts: boolean
    messageAlerts: boolean
    paymentAlerts: boolean
    marketingEmails: boolean
  }
  push: {
    jobAlerts: boolean
    messageAlerts: boolean
    paymentAlerts: boolean
  }
  sms: {
    jobAlerts: boolean
    paymentAlerts: boolean
  }
}

interface SecuritySettings {
  twoFactorEnabled: boolean
  loginAlerts: boolean
  sessionTimeout: number
}

export default function SettingsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userRole, setUserRole] = useState<string>('')
  const [error, setError] = useState<string>('')

  const [profileData, setProfileData] = useState<ProfileData>({
    fullname: "",
    email: "",
    title: "",
    bio: "",
    location: "",
    hourlyRate: 0,
    availability: "Available now",
    skills: [],
    languages: ["English"],
    avatar: "",
    company: "",
  })

  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    profileVisibility: "public",
    showEmail: false,
    showPhone: false,
    showLocation: true,
    showEarnings: false,
    showSpent: false,
    allowDirectContact: true,
  })

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    email: {
      jobAlerts: true,
      messageAlerts: true,
      paymentAlerts: true,
      marketingEmails: false,
    },
    push: {
      jobAlerts: true,
      messageAlerts: true,
      paymentAlerts: true,
    },
    sms: {
      jobAlerts: false,
      paymentAlerts: false,
    },
  })

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    loginAlerts: true,
    sessionTimeout: 30,
  })

  // Fetch settings data on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      setError('')
      try {
        const token = localStorage.getItem('freelancedao_token')
        if (!token) {
          setError('Authentication required. Please log in again.')
          toast.error('Authentication required')
          return
        }

        const response = await fetch('/api/settings', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          const errorMessage = errorData.error || `Failed to fetch settings (${response.status})`
          setError(errorMessage)
          throw new Error(errorMessage)
        }

        const data = await response.json()
        
        setProfileData(data.profileData)
        setPrivacySettings(data.privacySettings)
        setNotificationSettings(data.notificationSettings)
        setSecuritySettings(data.securitySettings)
        setUserRole(data.userRole)
      } catch (error) {
        console.error('Error fetching settings:', error)
        const errorMessage = error instanceof Error ? error.message : 'Failed to load settings'
        setError(errorMessage)
        toast.error(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchSettings()
    } else {
      setLoading(false)
    }
  }, [user])

  const handleSaveSettings = async () => {
    setSaving(true)
    setError('')
    try {
      const token = localStorage.getItem('freelancedao_token')
      if (!token) {
        setError('Authentication required. Please log in again.')
        toast.error('Authentication required')
        return
      }

      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profileData,
          privacySettings,
          notificationSettings,
          securitySettings,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || `Failed to save settings (${response.status})`
        setError(errorMessage)
        throw new Error(errorMessage)
      }

      const result = await response.json()
      toast.success('Settings saved successfully!')
      setError('')
    } catch (error) {
      console.error('Error saving settings:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to save settings'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <ProtectedRoute requireAuth={true} requireCompleteProfile={true}>
        <div className="min-h-screen bg-slate-50">
          <div className="bg-white border-b border-slate-200">
            <div className="container mx-auto px-4 py-6">
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-96" />
            </div>
          </div>
          <div className="container mx-auto px-4 py-8">
            <div className="space-y-6">
              <Skeleton className="h-12 w-full" />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full lg:col-span-2" />
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute requireAuth={true} requireCompleteProfile={true}>
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <div className="bg-white border-b border-slate-200">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Settings</h1>
                <p className="text-slate-600">Manage your account preferences and security</p>
              </div>
              <Button 
                onClick={handleSaveSettings} 
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="privacy">Privacy</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Picture */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Camera className="w-5 h-5 mr-2 text-blue-500" />
                      Profile Picture
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center space-y-4">
                    <Avatar className="w-32 h-32 mx-auto">
                      <AvatarImage src={profileData.avatar || "/placeholder.svg?height=128&width=128"} alt="Profile" />
                      <AvatarFallback className="text-2xl bg-blue-100 text-blue-600">
                        {profileData.fullname ? profileData.fullname.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full">
                        <Camera className="w-4 h-4 mr-2" />
                        Change Photo
                      </Button>
                      <Button variant="ghost" className="w-full text-red-600 hover:text-red-700">
                        Remove Photo
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Basic Information */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="w-5 h-5 mr-2 text-blue-500" />
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullname">Full Name</Label>
                      <Input
                        id="fullname"
                        value={profileData.fullname}
                        onChange={(e) => setProfileData({ ...profileData, fullname: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      />
                    </div>

                    {userRole === 'freelancer' && (
                      <div className="space-y-2">
                        <Label htmlFor="title">Professional Title</Label>
                        <Input
                          id="title"
                          value={profileData.title}
                          onChange={(e) => setProfileData({ ...profileData, title: e.target.value })}
                          placeholder="e.g., Full-Stack Developer"
                        />
                      </div>
                    )}

                    {userRole === 'client' && (
                      <div className="space-y-2">
                        <Label htmlFor="company">Company</Label>
                        <Input
                          id="company"
                          value={profileData.company}
                          onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                          placeholder="Your company name"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={profileData.bio}
                        onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                        className="min-h-24"
                        placeholder="Tell us about yourself..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={profileData.location}
                        onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                        placeholder="City, Country"
                      />
                    </div>

                    {userRole === 'freelancer' && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="hourlyRate">Hourly Rate (HBAR)</Label>
                          <Input
                            id="hourlyRate"
                            type="number"
                            value={profileData.hourlyRate}
                            onChange={(e) => setProfileData({ ...profileData, hourlyRate: parseFloat(e.target.value) || 0 })}
                            placeholder="0"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="availability">Availability</Label>
                          <Select
                            value={profileData.availability}
                            onValueChange={(value) => setProfileData({ ...profileData, availability: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Available now">Available now</SelectItem>
                              <SelectItem value="Available in 1 week">Available in 1 week</SelectItem>
                              <SelectItem value="Available in 2 weeks">Available in 2 weeks</SelectItem>
                              <SelectItem value="Available in 1 month">Available in 1 month</SelectItem>
                              <SelectItem value="Not available">Not available</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="skills">Skills (comma-separated)</Label>
                          <Input
                            id="skills"
                            value={profileData.skills.join(', ')}
                            onChange={(e) => setProfileData({ 
                              ...profileData, 
                              skills: e.target.value.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0)
                            })}
                            placeholder="React, Node.js, TypeScript"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="languages">Languages (comma-separated)</Label>
                          <Input
                            id="languages"
                            value={profileData.languages.join(', ')}
                            onChange={(e) => setProfileData({ 
                              ...profileData, 
                              languages: e.target.value.split(',').map(lang => lang.trim()).filter(lang => lang.length > 0)
                            })}
                            placeholder="English, Spanish, French"
                          />
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="privacy" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Eye className="w-5 h-5 mr-2 text-blue-500" />
                    Privacy Settings
                  </CardTitle>
                  <CardDescription>
                    Control who can see your information and how you appear to others
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="profileVisibility">Profile Visibility</Label>
                    <Select
                      value={privacySettings.profileVisibility}
                      onValueChange={(value) => setPrivacySettings({ ...privacySettings, profileVisibility: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public - Anyone can see your profile</SelectItem>
                        <SelectItem value="private">Private - Only you can see your profile</SelectItem>
                        <SelectItem value="freelancedao">FreelanceDAO Only - Only registered users</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Show on Profile</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="showEmail" className="flex-1">Email Address</Label>
                        <Switch
                          id="showEmail"
                          checked={privacySettings.showEmail}
                          onCheckedChange={(checked) => setPrivacySettings({ ...privacySettings, showEmail: checked })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="showPhone" className="flex-1">Phone Number</Label>
                        <Switch
                          id="showPhone"
                          checked={privacySettings.showPhone}
                          onCheckedChange={(checked) => setPrivacySettings({ ...privacySettings, showPhone: checked })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="showLocation" className="flex-1">Location</Label>
                        <Switch
                          id="showLocation"
                          checked={privacySettings.showLocation}
                          onCheckedChange={(checked) => setPrivacySettings({ ...privacySettings, showLocation: checked })}
                        />
                      </div>
                      {userRole === 'freelancer' && (
                        <div className="flex items-center justify-between">
                          <Label htmlFor="showEarnings" className="flex-1">Earnings</Label>
                          <Switch
                            id="showEarnings"
                            checked={privacySettings.showEarnings}
                            onCheckedChange={(checked) => setPrivacySettings({ ...privacySettings, showEarnings: checked })}
                          />
                        </div>
                      )}
                      {userRole === 'client' && (
                        <div className="flex items-center justify-between">
                          <Label htmlFor="showSpent" className="flex-1">Amount Spent</Label>
                          <Switch
                            id="showSpent"
                            checked={privacySettings.showSpent}
                            onCheckedChange={(checked) => setPrivacySettings({ ...privacySettings, showSpent: checked })}
                          />
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <Label htmlFor="allowDirectContact" className="flex-1">Allow Direct Contact</Label>
                        <Switch
                          id="allowDirectContact"
                          checked={privacySettings.allowDirectContact}
                          onCheckedChange={(checked) => setPrivacySettings({ ...privacySettings, allowDirectContact: checked })}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Email Notifications */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Mail className="w-5 h-5 mr-2 text-blue-500" />
                      Email
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="emailJobAlerts" className="flex-1">Job Alerts</Label>
                      <Switch
                        id="emailJobAlerts"
                        checked={notificationSettings.email.jobAlerts}
                        onCheckedChange={(checked) => setNotificationSettings({
                          ...notificationSettings,
                          email: { ...notificationSettings.email, jobAlerts: checked }
                        })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="emailMessageAlerts" className="flex-1">Message Alerts</Label>
                      <Switch
                        id="emailMessageAlerts"
                        checked={notificationSettings.email.messageAlerts}
                        onCheckedChange={(checked) => setNotificationSettings({
                          ...notificationSettings,
                          email: { ...notificationSettings.email, messageAlerts: checked }
                        })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="emailPaymentAlerts" className="flex-1">Payment Alerts</Label>
                      <Switch
                        id="emailPaymentAlerts"
                        checked={notificationSettings.email.paymentAlerts}
                        onCheckedChange={(checked) => setNotificationSettings({
                          ...notificationSettings,
                          email: { ...notificationSettings.email, paymentAlerts: checked }
                        })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="emailMarketingEmails" className="flex-1">Marketing Emails</Label>
                      <Switch
                        id="emailMarketingEmails"
                        checked={notificationSettings.email.marketingEmails}
                        onCheckedChange={(checked) => setNotificationSettings({
                          ...notificationSettings,
                          email: { ...notificationSettings.email, marketingEmails: checked }
                        })}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Push Notifications */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Bell className="w-5 h-5 mr-2 text-blue-500" />
                      Push
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="pushJobAlerts" className="flex-1">Job Alerts</Label>
                      <Switch
                        id="pushJobAlerts"
                        checked={notificationSettings.push.jobAlerts}
                        onCheckedChange={(checked) => setNotificationSettings({
                          ...notificationSettings,
                          push: { ...notificationSettings.push, jobAlerts: checked }
                        })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="pushMessageAlerts" className="flex-1">Message Alerts</Label>
                      <Switch
                        id="pushMessageAlerts"
                        checked={notificationSettings.push.messageAlerts}
                        onCheckedChange={(checked) => setNotificationSettings({
                          ...notificationSettings,
                          push: { ...notificationSettings.push, messageAlerts: checked }
                        })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="pushPaymentAlerts" className="flex-1">Payment Alerts</Label>
                      <Switch
                        id="pushPaymentAlerts"
                        checked={notificationSettings.push.paymentAlerts}
                        onCheckedChange={(checked) => setNotificationSettings({
                          ...notificationSettings,
                          push: { ...notificationSettings.push, paymentAlerts: checked }
                        })}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* SMS Notifications */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Smartphone className="w-5 h-5 mr-2 text-blue-500" />
                      SMS
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="smsJobAlerts" className="flex-1">Job Alerts</Label>
                      <Switch
                        id="smsJobAlerts"
                        checked={notificationSettings.sms.jobAlerts}
                        onCheckedChange={(checked) => setNotificationSettings({
                          ...notificationSettings,
                          sms: { ...notificationSettings.sms, jobAlerts: checked }
                        })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="smsPaymentAlerts" className="flex-1">Payment Alerts</Label>
                      <Switch
                        id="smsPaymentAlerts"
                        checked={notificationSettings.sms.paymentAlerts}
                        onCheckedChange={(checked) => setNotificationSettings({
                          ...notificationSettings,
                          sms: { ...notificationSettings.sms, paymentAlerts: checked }
                        })}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Two-Factor Authentication */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Shield className="w-5 h-5 mr-2 text-blue-500" />
                      Two-Factor Authentication
                    </CardTitle>
                    <CardDescription>
                      Add an extra layer of security to your account
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-medium">Enable 2FA</Label>
                        <p className="text-sm text-slate-600">
                          {securitySettings.twoFactorEnabled ? "2FA is currently enabled" : "2FA is currently disabled"}
                        </p>
                      </div>
                      <Switch
                        checked={securitySettings.twoFactorEnabled}
                        onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, twoFactorEnabled: checked })}
                      />
                    </div>
                    {securitySettings.twoFactorEnabled && (
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          Two-factor authentication is active. You'll need your authenticator app to sign in.
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>

                {/* Login & Session Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Lock className="w-5 h-5 mr-2 text-blue-500" />
                      Login & Sessions
                    </CardTitle>
                    <CardDescription>
                      Manage your login preferences and active sessions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-medium">Login Alerts</Label>
                        <p className="text-sm text-slate-600">Get notified of new logins</p>
                      </div>
                      <Switch
                        checked={securitySettings.loginAlerts}
                        onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, loginAlerts: checked })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                      <Select
                        value={securitySettings.sessionTimeout.toString()}
                        onValueChange={(value) => setSecuritySettings({ ...securitySettings, sessionTimeout: parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="60">1 hour</SelectItem>
                          <SelectItem value="120">2 hours</SelectItem>
                          <SelectItem value="480">8 hours</SelectItem>
                          <SelectItem value="1440">24 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="billing" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Wallet className="w-5 h-5 mr-2 text-blue-500" />
                    Billing & Payments
                  </CardTitle>
                  <CardDescription>
                    Manage your payment methods and billing preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Billing settings are managed through the blockchain. Connect your wallet to manage payments.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  )
}
