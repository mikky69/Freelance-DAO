"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Star,
  MapPin,
  Calendar,
  DollarSign,
  Award,
  ExternalLink,
  Edit,
  Verified,
  Clock,
  ThumbsUp,
  Loader2,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { EditProfileModal } from "@/components/edit-profile-modal"

interface ProfileData {
  user: {
    _id: string
    fullname: string
    email: string
    title?: string
    avatar?: string
    bio?: string
    description?: string
    location?: string
    skills: string[]
    hourlyRate?: number
    rating?: number // Make this optional
    reviewCount?: number // Make this optional
    completedJobs?: number // Make this optional
    successRate?: number // Make this optional
    responseTime?: string
    verified?: boolean // Make this optional
    topRated?: boolean // Make this optional
    languages?: string[] // Make this optional
    portfolio?: {
      title: string
      description?: string
      image?: string
      url?: string
    }[]
    userType: "freelancer" | "client"
    createdAt: string
  }
  stats: {
    totalEarnings?: number
    totalSpent?: number
    completedJobs: number
    totalProposals?: number
    acceptanceRate?: number
    postedJobs?: number
    activeJobs?: number
  }
  jobHistory: {
    id: string
    title: string
    client?: { fullname: string; avatar?: string }
    freelancer?: { fullname: string; avatar?: string }
    amount: number
    currency: string
    status: string
    completedAt?: string
    postedAt?: string
  }[]
  reviews: {
    id: string
    client: { fullname: string; avatar?: string }
    rating: number
    date: string
    project: string
    review: string
  }[]
}

function ProfileContent() {
  const { user: authUser } = useAuth()
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const handleProfileUpdate = (updatedUser: any) => {
    if (profileData) {
      setProfileData({
        ...profileData,
        user: {
          ...profileData.user,
          ...updatedUser,
        },
      })
    }
  }

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true)
      setError(null)

      try {
        const token = localStorage.getItem("freelancedao_token")
        if (!token) {
          throw new Error("No authentication token found")
        }

        const response = await fetch("/api/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch profile data")
        }

        const data = await response.json()
        setProfileData(data)
      } catch (err) {
        setError("Failed to load profile data. Please try again.")
        console.error("Error fetching profile:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [authUser])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-slate-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error || !profileData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Profile not found"}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }

  if (!profileData) return null

  const { user, stats, jobHistory, reviews } = profileData
  const isFreelancer = user.userType === "freelancer"

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar className="w-24 h-24 border-4 border-white">
              <AvatarImage src={user.avatar || "/placeholder.svg?height=96&width=96"} alt="Profile" />
              <AvatarFallback className="text-2xl bg-blue-400 text-white">
                {user.fullname
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-2xl md:text-3xl font-bold">{user.fullname}</h1>
                    {user.verified && (
                      <Badge className="bg-green-500 text-white">
                        <Verified className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                    {user.topRated && (
                      <Badge className="bg-yellow-500 text-white">
                        <Award className="w-3 h-3 mr-1" />
                        Top Rated
                      </Badge>
                    )}
                  </div>
                  <p className="text-xl text-blue-100 mb-2">
                    {user.title || `${isFreelancer ? "Freelancer" : "Client"}`}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-blue-100">
                    {user.location && (
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {user.location}
                      </div>
                    )}
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Member since {new Date(user.createdAt).getFullYear()}
                    </div>
                    {user.responseTime && (
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        Usually responds in {user.responseTime}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    className="bg-white text-blue-600 hover:bg-blue-50"
                    onClick={() => setIsEditModalOpen(true)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-blue-600 bg-transparent"
                  >
                    Share Profile
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Sidebar */}
            <div className="space-y-6">
              {/* Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Profile Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Star className="w-5 h-5 text-yellow-500 mr-2" />
                      <span className="font-medium">Rating</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">{(user.rating || 0).toFixed(1)}</div>
                      <div className="text-sm text-slate-500">{user.reviewCount || 0} reviews</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Award className="w-5 h-5 text-blue-500 mr-2" />
                      <span className="font-medium">{isFreelancer ? "Jobs Completed" : "Jobs Posted"}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">
                        {isFreelancer ? stats.completedJobs || 0 : stats.postedJobs || 0}
                      </div>
                      <div className="text-sm text-slate-500">
                        {isFreelancer ? `${user.successRate || 0}% success rate` : `${stats.activeJobs || 0} active`}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <DollarSign className="w-5 h-5 text-green-500 mr-2" />
                      <span className="font-medium">{isFreelancer ? "Total Earned" : "Total Spent"}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">
                        {isFreelancer ? stats.totalEarnings || 0 : stats.totalSpent || 0} HBAR
                      </div>
                      <div className="text-sm text-slate-500">All time</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Skills - Only for freelancers */}
              {isFreelancer && user.skills && user.skills.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Skills & Expertise</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {user.skills.map((skill, index) => (
                        <Badge key={index} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Languages */}
              {user.languages && user.languages.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Languages</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {user.languages.map((language, index) => (
                        <div key={index} className="flex justify-between">
                          <span>{language}</span>
                          <Badge variant="secondary">Fluent</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  {/* About */}
                  <Card>
                    <CardHeader>
                      <CardTitle>About Me</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-700 leading-relaxed">
                        {user.description || user.bio || "No description available."}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Hourly Rate - Only for freelancers */}
                  {isFreelancer && user.hourlyRate && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Hourly Rate</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">{user.hourlyRate} HBAR/hour</div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="portfolio" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {user.portfolio && user.portfolio.length > 0 ? (
                      user.portfolio.map((project, index) => (
                        <Card key={index} className="hover:shadow-lg transition-shadow">
                          <div className="aspect-video bg-slate-100 rounded-t-lg">
                            {project.image && (
                              <img
                                src={project.image || "/placeholder.svg"}
                                alt={project.title}
                                className="w-full h-full object-cover rounded-t-lg"
                              />
                            )}
                          </div>
                          <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                              {project.title}
                              {project.url && (
                                <Button variant="ghost" size="sm" asChild>
                                  <a href={project.url} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="w-4 h-4" />
                                  </a>
                                </Button>
                              )}
                            </CardTitle>
                            <CardDescription>{project.description}</CardDescription>
                          </CardHeader>
                        </Card>
                      ))
                    ) : (
                      <div className="col-span-2 text-center py-8">
                        <p className="text-slate-600">No portfolio items yet.</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="reviews" className="space-y-6">
                  {reviews.length > 0 ? (
                    reviews.map((review, index) => (
                      <Card key={index}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">{review.client.fullname}</CardTitle>
                              <CardDescription>{review.project}</CardDescription>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center mb-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < review.rating ? "text-yellow-500 fill-current" : "text-slate-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              <div className="text-sm text-slate-500">{new Date(review.date).toLocaleDateString()}</div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-slate-700">{review.review}</p>
                          <div className="flex items-center mt-4 text-sm text-slate-500">
                            <ThumbsUp className="w-4 h-4 mr-1" />
                            Helpful review
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-slate-600">No reviews yet.</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="history" className="space-y-6">
                  <div className="space-y-4">
                    {jobHistory.length > 0 ? (
                      jobHistory.map((job, index) => (
                        <Card key={index}>
                          <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                              <div className="flex-1">
                                <h4 className="font-semibold text-slate-800">{job.title}</h4>
                                <p className="text-slate-600">
                                  {isFreelancer ? job.client?.fullname : job.freelancer?.fullname}
                                </p>
                                <p className="text-sm text-slate-500">
                                  {new Date(job.completedAt || job.postedAt || "").toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex items-center gap-4">
                                <Badge
                                  className={`${
                                    job.status === "completed"
                                      ? "bg-green-100 text-green-700"
                                      : job.status === "in_progress"
                                        ? "bg-blue-100 text-blue-700"
                                        : "bg-yellow-100 text-yellow-700"
                                  }`}
                                >
                                  {job.status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                                </Badge>
                                <div className="text-right">
                                  <div className="font-semibold text-green-600">
                                    {job.amount} {job.currency}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-slate-600">No job history yet.</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profileData={profileData.user}
        onProfileUpdate={handleProfileUpdate}
      />
    </div>
  )
}

export default function ProfilePage() {
  return (
    <ProtectedRoute requireAuth={true} requireCompleteProfile={true}>
      <ProfileContent />
    </ProtectedRoute>
  )
}
