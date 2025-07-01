"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Brain,
  Star,
  TrendingUp,
  Target,
  Zap,
  DollarSign,
  Clock,
  CheckCircle,
  ArrowRight,
  Sparkles,
  BarChart3,
} from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"

interface JobMatch {
  id: string
  title: string
  description: string
  budget: string
  client: {
    name: string
    avatar: string
    rating: number
  }
  matchScore: number
  matchReasons: string[]
  skills: string[]
  urgency: "low" | "medium" | "high"
  postedAt: string
}

interface SkillInsight {
  skill: string
  demand: number
  averageRate: number
  growth: number
  jobs: number
}

const mockMatches: JobMatch[] = [
  {
    id: "1",
    title: "React Developer for E-commerce Platform",
    description: "Looking for an experienced React developer to build modern e-commerce features...",
    budget: "$3,000-5,000",
    client: {
      name: "TechCorp",
      avatar: "/placeholder.svg?height=40&width=40",
      rating: 4.8,
    },
    matchScore: 95,
    matchReasons: ["Perfect skill match", "Budget aligns with your rate", "Similar past projects"],
    skills: ["React", "TypeScript", "E-commerce"],
    urgency: "high",
    postedAt: "2 hours ago",
  },
  {
    id: "2",
    title: "Full-Stack Web Application",
    description: "Need a full-stack developer for a modern web application with real-time features...",
    budget: "$4,000-7,000",
    client: {
      name: "StartupXYZ",
      avatar: "/placeholder.svg?height=40&width=40",
      rating: 4.6,
    },
    matchScore: 88,
    matchReasons: ["Strong technical match", "Client prefers your location", "High-value project"],
    skills: ["React", "Node.js", "PostgreSQL"],
    urgency: "medium",
    postedAt: "5 hours ago",
  },
  {
    id: "3",
    title: "Mobile App Development",
    description: "React Native app development for iOS and Android platforms...",
    budget: "$2,500-4,000",
    client: {
      name: "MobileFirst",
      avatar: "/placeholder.svg?height=40&width=40",
      rating: 4.9,
    },
    matchScore: 82,
    matchReasons: ["Related skills match", "Good client rating", "Reasonable timeline"],
    skills: ["React Native", "Mobile Development"],
    urgency: "low",
    postedAt: "1 day ago",
  },
]

const mockSkillInsights: SkillInsight[] = [
  {
    skill: "React",
    demand: 95,
    averageRate: 75,
    growth: 12,
    jobs: 1234,
  },
  {
    skill: "TypeScript",
    demand: 88,
    averageRate: 80,
    growth: 18,
    jobs: 892,
  },
  {
    skill: "Node.js",
    demand: 85,
    averageRate: 70,
    growth: 15,
    jobs: 756,
  },
  {
    skill: "Python",
    demand: 82,
    averageRate: 65,
    growth: 8,
    jobs: 1456,
  },
]

export default function AIMatchingPage() {
  const [matches, setMatches] = useState<JobMatch[]>([])
  const [skillInsights, setSkillInsights] = useState<SkillInsight[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(true)
  const [selectedMatch, setSelectedMatch] = useState<JobMatch | null>(null)

  useEffect(() => {
    // Simulate AI analysis
    setTimeout(() => {
      setMatches(mockMatches)
      setSkillInsights(mockSkillInsights)
      setIsAnalyzing(false)
    }, 2000)
  }, [])

  const getMatchColor = (score: number) => {
    if (score >= 90) return "bg-green-100 text-green-700"
    if (score >= 80) return "bg-blue-100 text-blue-700"
    if (score >= 70) return "bg-yellow-100 text-yellow-700"
    return "bg-slate-100 text-slate-700"
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "bg-red-100 text-red-700"
      case "medium":
        return "bg-yellow-100 text-yellow-700"
      case "low":
        return "bg-green-100 text-green-700"
      default:
        return "bg-slate-100 text-slate-700"
    }
  }

  const applyToJob = (jobId: string) => {
    toast.success("Redirecting to job application...")
    // In a real app, this would navigate to the job page
  }

  if (isAnalyzing) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-blue-600 animate-pulse" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">AI is Analyzing...</h3>
            <p className="text-slate-600 mb-4">
              Our AI is finding the perfect job matches for your skills and preferences
            </p>
            <Progress value={75} className="h-2" />
            <p className="text-sm text-slate-500 mt-2">This usually takes a few seconds</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-purple-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">AI Job Matching</h1>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Our AI analyzes your skills, experience, and preferences to find the perfect job matches
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <Target className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-slate-800">{matches.length}</div>
                <div className="text-sm text-slate-600">Perfect Matches</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Sparkles className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-slate-800">92%</div>
                <div className="text-sm text-slate-600">Avg Match Score</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-slate-800">$4,200</div>
                <div className="text-sm text-slate-600">Avg Project Value</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-slate-800">2.5hrs</div>
                <div className="text-sm text-slate-600">Time Saved</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="matches" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="matches">Job Matches</TabsTrigger>
              <TabsTrigger value="insights">Skill Insights</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            </TabsList>

            <TabsContent value="matches" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {matches.map((match) => (
                  <Card key={match.id} className="hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold text-slate-800">{match.title}</h3>
                            <Badge className={getMatchColor(match.matchScore)}>{match.matchScore}% match</Badge>
                          </div>
                          <p className="text-slate-600 text-sm mb-3 line-clamp-2">{match.description}</p>

                          {/* Skills */}
                          <div className="flex flex-wrap gap-1 mb-3">
                            {match.skills.map((skill, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>

                          {/* Match Reasons */}
                          <div className="space-y-1 mb-4">
                            <p className="text-xs font-medium text-slate-700">Why this matches:</p>
                            {match.matchReasons.map((reason, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <CheckCircle className="w-3 h-3 text-green-500" />
                                <span className="text-xs text-slate-600">{reason}</span>
                              </div>
                            ))}
                          </div>

                          {/* Job Details */}
                          <div className="flex items-center justify-between text-sm text-slate-600">
                            <div className="flex items-center space-x-4">
                              <span>{match.budget}</span>
                              <Badge className={getUrgencyColor(match.urgency)} variant="outline">
                                {match.urgency}
                              </Badge>
                            </div>
                            <span>{match.postedAt}</span>
                          </div>
                        </div>
                      </div>

                      {/* Client Info */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={match.client.avatar || "/placeholder.svg"} />
                            <AvatarFallback>{match.client.name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-slate-800">{match.client.name}</div>
                            <div className="flex items-center text-sm text-slate-600">
                              <Star className="w-3 h-3 text-yellow-500 mr-1" />
                              {match.client.rating}
                            </div>
                          </div>
                        </div>
                        <Button onClick={() => applyToJob(match.id)} className="bg-blue-500 hover:bg-blue-600">
                          Apply Now
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="insights" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {skillInsights.map((insight, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{insight.skill}</span>
                        <Badge className="bg-blue-100 text-blue-700">{insight.jobs} jobs</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Market Demand</span>
                          <span>{insight.demand}%</span>
                        </div>
                        <Progress value={insight.demand} className="h-2" />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <DollarSign className="w-5 h-5 text-green-500 mx-auto mb-1" />
                          <div className="font-semibold text-slate-800">${insight.averageRate}/hr</div>
                          <div className="text-xs text-slate-600">Avg Rate</div>
                        </div>
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <TrendingUp className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                          <div className="font-semibold text-slate-800">+{insight.growth}%</div>
                          <div className="text-xs text-slate-600">Growth</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                      Skill Recommendations
                    </CardTitle>
                    <CardDescription>Skills to learn for better job matches</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Next.js</span>
                        <Badge className="bg-green-100 text-green-700">High Demand</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">GraphQL</span>
                        <Badge className="bg-blue-100 text-blue-700">Growing</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">AWS</span>
                        <Badge className="bg-purple-100 text-purple-700">High Pay</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
                      Profile Optimization
                    </CardTitle>
                    <CardDescription>Improve your profile for better matches</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Add portfolio items</span>
                        <Badge variant="outline">+15% matches</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Complete verification</span>
                        <Badge variant="outline">+25% visibility</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Update hourly rate</span>
                        <Badge variant="outline">+10% applications</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
