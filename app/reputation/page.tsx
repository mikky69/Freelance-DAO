"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Star,
  Shield,
  TrendingUp,
  Award,
  CheckCircle,
  Clock,
  Users,
  Briefcase,
  DollarSign,
  ExternalLink,
  Info,
  Zap,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"

function ReputationContent() {
  const { user } = useAuth()
  const reputationScore = 4.8
  const totalReviews = 47
  const verificationLevel = "Gold"

  const skillRatings = [
    { skill: "React Development", rating: 4.9, reviews: 23 },
    { skill: "UI/UX Design", rating: 4.7, reviews: 15 },
    { skill: "Smart Contracts", rating: 4.8, reviews: 9 },
    { skill: "Project Management", rating: 4.6, reviews: 12 },
  ]

  const achievements = [
    {
      title: "Top Performer",
      description: "Completed 50+ projects with 95%+ satisfaction",
      icon: <Award className="w-6 h-6 text-yellow-500" />,
      earned: true,
      date: "Nov 2024",
    },
    {
      title: "Fast Responder",
      description: "Average response time under 2 hours",
      icon: <Zap className="w-6 h-6 text-blue-500" />,
      earned: true,
      date: "Oct 2024",
    },
    {
      title: "Blockchain Expert",
      description: "Completed 10+ Web3 projects successfully",
      icon: <Shield className="w-6 h-6 text-purple-500" />,
      earned: true,
      date: "Sep 2024",
    },
    {
      title: "Community Leader",
      description: "Help 100+ freelancers in the community",
      icon: <Users className="w-6 h-6 text-green-500" />,
      earned: false,
      progress: 67,
    },
  ]

  const recentReviews = [
    {
      client: "TechStartup Inc.",
      project: "E-commerce Website Development",
      rating: 5,
      comment:
        "Exceptional work! Sarah delivered beyond our expectations. The website is fast, beautiful, and exactly what we needed.",
      date: "Dec 10, 2024",
      verified: true,
    },
    {
      client: "CryptoLabs",
      project: "Smart Contract Audit",
      rating: 5,
      comment:
        "Outstanding security audit. Found critical vulnerabilities and provided clear recommendations. Highly professional.",
      date: "Dec 5, 2024",
      verified: true,
    },
    {
      client: "DesignCorp",
      project: "Mobile App UI Design",
      rating: 4,
      comment: "Great design work with quick iterations. Communication could be improved but overall very satisfied.",
      date: "Nov 28, 2024",
      verified: true,
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar className="w-24 h-24 border-4 border-white">
              <AvatarFallback className="text-2xl bg-blue-400 text-white">
                {user?.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("") || "U"}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl md:text-3xl font-bold">{user?.name || "User"}</h1>
                    <Badge className="bg-yellow-500 text-white">
                      <Shield className="w-3 h-3 mr-1" />
                      {verificationLevel} Verified
                    </Badge>
                  </div>
                  <p className="text-xl text-blue-100 mb-3">Senior Full-Stack Developer</p>

                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${
                              i < Math.floor(reputationScore) ? "text-yellow-400 fill-current" : "text-blue-200"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-2xl font-bold">{reputationScore}</span>
                      <span className="text-blue-100">({totalReviews} reviews)</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Share Profile
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar */}
          <div className="space-y-6">
            {/* Reputation Score */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="w-5 h-5 mr-2 text-yellow-500" />
                  Reputation Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-slate-800 mb-2">{reputationScore}</div>
                  <div className="flex justify-center mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-6 h-6 ${
                          i < Math.floor(reputationScore) ? "text-yellow-500 fill-current" : "text-slate-300"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-slate-600">{totalReviews} verified reviews</p>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Your reputation is stored on-chain and cannot be manipulated. It's calculated from verified client
                    reviews and project completions.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Verification Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-green-500" />
                  Verification Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Identity Verified</span>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Email Verified</span>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Phone Verified</span>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Portfolio Verified</span>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Background Check</span>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Briefcase className="w-4 h-4 text-blue-500 mr-2" />
                    <span className="text-sm">Jobs Completed</span>
                  </div>
                  <span className="font-semibold">47</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 text-green-500 mr-2" />
                    <span className="text-sm">Total Earned</span>
                  </div>
                  <span className="font-semibold">12,450 HBAR</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 text-purple-500 mr-2" />
                    <span className="text-sm">Avg Response Time</span>
                  </div>
                  <span className="font-semibold">2.3 hours</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <TrendingUp className="w-4 h-4 text-orange-500 mr-2" />
                    <span className="text-sm">Success Rate</span>
                  </div>
                  <span className="font-semibold">98%</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="skills" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="skills">Skills</TabsTrigger>
                <TabsTrigger value="achievements">Achievements</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="blockchain">Blockchain</TabsTrigger>
              </TabsList>

              <TabsContent value="skills" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Skill Ratings</CardTitle>
                    <CardDescription>Ratings based on client feedback for specific skills</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {skillRatings.map((skill, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-slate-800">{skill.skill}</h4>
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < Math.floor(skill.rating) ? "text-yellow-500 fill-current" : "text-slate-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="font-semibold">{skill.rating}</span>
                              <span className="text-sm text-slate-500">({skill.reviews} reviews)</span>
                            </div>
                          </div>
                          <Progress value={skill.rating * 20} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="achievements" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Achievements & Badges</CardTitle>
                    <CardDescription>
                      Unlock achievements by completing milestones and maintaining quality
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {achievements.map((achievement, index) => (
                        <div
                          key={index}
                          className={`p-4 border-2 rounded-lg ${
                            achievement.earned ? "border-green-200 bg-green-50" : "border-slate-200 bg-slate-50"
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`p-2 rounded-lg ${achievement.earned ? "bg-white" : "bg-slate-200"}`}>
                              {achievement.icon}
                            </div>
                            <div className="flex-1">
                              <h4
                                className={`font-semibold ${achievement.earned ? "text-slate-800" : "text-slate-500"}`}
                              >
                                {achievement.title}
                              </h4>
                              <p className={`text-sm ${achievement.earned ? "text-slate-600" : "text-slate-400"}`}>
                                {achievement.description}
                              </p>
                              {achievement.earned ? (
                                <Badge className="mt-2 bg-green-100 text-green-700">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Earned {achievement.date}
                                </Badge>
                              ) : (
                                <div className="mt-2">
                                  <div className="flex items-center justify-between text-sm mb-1">
                                    <span className="text-slate-600">Progress</span>
                                    <span className="text-slate-800">{achievement.progress}%</span>
                                  </div>
                                  <Progress value={achievement.progress} className="h-2" />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Client Reviews</CardTitle>
                    <CardDescription>Verified reviews from completed projects</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {recentReviews.map((review, index) => (
                        <div key={index} className="border-b border-slate-200 pb-6 last:border-b-0">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <Avatar className="w-10 h-10">
                                <AvatarFallback className="bg-blue-100 text-blue-600">
                                  {review.client[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <h4 className="font-semibold text-slate-800">{review.client}</h4>
                                  {review.verified && (
                                    <Badge className="bg-green-100 text-green-700">
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      Verified
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-slate-600">{review.project}</p>
                              </div>
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
                              <p className="text-sm text-slate-500">{review.date}</p>
                            </div>
                          </div>
                          <p className="text-slate-700">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="blockchain" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Shield className="w-5 h-5 mr-2 text-purple-500" />
                      Blockchain Reputation
                    </CardTitle>
                    <CardDescription>Your on-chain reputation data stored on Hedera Hashgraph</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <Alert>
                      <Shield className="h-4 w-4" />
                      <AlertDescription>
                        Your reputation data is immutably stored on the blockchain, ensuring it cannot be manipulated or
                        faked.
                      </AlertDescription>
                    </Alert>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm font-medium text-slate-700">Reputation Contract</span>
                          <div className="flex items-center space-x-2 mt-1">
                            <code className="text-sm bg-slate-100 px-2 py-1 rounded font-mono">0.0.789123</code>
                            <Button variant="ghost" size="sm">
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-slate-700">Total Reviews</span>
                          <p className="text-lg font-semibold text-slate-800">{totalReviews}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-slate-700">Average Rating</span>
                          <p className="text-lg font-semibold text-slate-800">{reputationScore}/5.0</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm font-medium text-slate-700">First Review</span>
                          <p className="text-sm text-slate-600">March 15, 2024</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-slate-700">Last Updated</span>
                          <p className="text-sm text-slate-600">December 10, 2024</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-slate-700">Verification Level</span>
                          <Badge className="bg-yellow-100 text-yellow-700">{verificationLevel}</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button variant="outline">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View on Explorer
                      </Button>
                      <Button variant="outline">
                        <Shield className="w-4 h-4 mr-2" />
                        Verify Reputation
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ReputationPage() {
  return (
    <ProtectedRoute requireAuth={true} requireWallet={true}>
      <ReputationContent />
    </ProtectedRoute>
  )
}
