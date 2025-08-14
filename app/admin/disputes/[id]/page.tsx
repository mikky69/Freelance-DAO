"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertTriangle,
  FileText,
  MessageSquare,
  Clock,
  DollarSign,
  User,
  Calendar,
  CheckCircle,
  XCircle,
  Scale,
  Download,
  Eye,
} from "lucide-react"
import { useState } from "react"

export default function DisputeDetail() {
  const [resolution, setResolution] = useState("")

  const dispute = {
    id: "DSP-001",
    title: "Payment dispute for React Development project",
    client: {
      name: "TechStartup Inc.",
      email: "contact@techstartup.com",
      rating: 4.7,
      jobsPosted: 12,
    },
    freelancer: {
      name: "John Developer",
      email: "john@dev.com",
      rating: 4.5,
      jobsCompleted: 34,
    },
    project: {
      title: "E-commerce Website Development",
      budget: "3,500 HBAR",
      deadline: "Dec 15, 2024",
      status: "90% Complete",
    },
    amount: "3,500 HBAR",
    status: "Under Review",
    priority: "High",
    created: "2 hours ago",
    description: "Client claims work was not completed according to specifications. Freelancer disputes this claim.",
    timeline: [
      {
        date: "Dec 12, 2024 - 2:30 PM",
        actor: "Client",
        action: "Raised dispute",
        description: "Client reported that the delivered work does not match the agreed specifications",
      },
      {
        date: "Dec 12, 2024 - 3:15 PM",
        actor: "Freelancer",
        action: "Responded to dispute",
        description: "Freelancer provided evidence of completed work and claims all requirements were met",
      },
      {
        date: "Dec 12, 2024 - 4:00 PM",
        actor: "System",
        action: "Escalated to admin",
        description: "Dispute automatically escalated after initial mediation period",
      },
    ],
    evidence: [
      {
        type: "file",
        name: "project_specifications.pdf",
        uploadedBy: "Client",
        size: "2.4 MB",
      },
      {
        type: "file",
        name: "completed_work_screenshots.zip",
        uploadedBy: "Freelancer",
        size: "15.7 MB",
      },
      {
        type: "message",
        content: "The navigation menu is not responsive as requested in the original brief.",
        author: "Client",
        timestamp: "2 hours ago",
      },
      {
        type: "message",
        content: "I have implemented responsive navigation. Please check the mobile breakpoints.",
        author: "Freelancer",
        timestamp: "1 hour ago",
      },
    ],
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="font-mono">
                  {dispute.id}
                </Badge>
                <Badge className="bg-red-100 text-red-700">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {dispute.priority} Priority
                </Badge>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  {dispute.status}
                </Badge>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800">{dispute.title}</h1>
              <p className="text-slate-600">Dispute amount: {dispute.amount}</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline">
                <MessageSquare className="w-4 h-4 mr-2" />
                Contact Parties
              </Button>
              <Button className="bg-blue-500 hover:bg-blue-600">
                <Scale className="w-4 h-4 mr-2" />
                Make Decision
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="evidence">Evidence</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="resolution">Resolution</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Dispute Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-blue-500" />
                      Dispute Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-slate-700">Description</Label>
                      <p className="mt-1 text-slate-600">{dispute.description}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-slate-700">Project</Label>
                        <p className="mt-1 font-medium text-slate-800">{dispute.project.title}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-slate-700">Budget</Label>
                        <p className="mt-1 font-medium text-green-600">{dispute.project.budget}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-slate-700">Deadline</Label>
                        <p className="mt-1 text-slate-600">{dispute.project.deadline}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-slate-700">Progress</Label>
                        <p className="mt-1 text-slate-600">{dispute.project.status}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Parties Involved */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <User className="w-5 h-5 mr-2 text-blue-500" />
                        Client
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-3 mb-4">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-blue-100 text-blue-600">
                            {dispute.client.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold text-slate-800">{dispute.client.name}</h4>
                          <p className="text-sm text-slate-600">{dispute.client.email}</p>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Rating:</span>
                          <span className="font-medium">{dispute.client.rating}★</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Jobs Posted:</span>
                          <span className="font-medium">{dispute.client.jobsPosted}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <User className="w-5 h-5 mr-2 text-green-500" />
                        Freelancer
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-3 mb-4">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-green-100 text-green-600">
                            {dispute.freelancer.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold text-slate-800">{dispute.freelancer.name}</h4>
                          <p className="text-sm text-slate-600">{dispute.freelancer.email}</p>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Rating:</span>
                          <span className="font-medium">{dispute.freelancer.rating}★</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Jobs Completed:</span>
                          <span className="font-medium">{dispute.freelancer.jobsCompleted}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="evidence" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Evidence & Documentation</CardTitle>
                    <CardDescription>Files and messages submitted by both parties</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {dispute.evidence.map((item, index) => (
                        <div key={index} className="p-4 border border-slate-200 rounded-lg">
                          {item.type === "file" ? (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                  <FileText className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-slate-800">{item.name}</p>
                                  <p className="text-sm text-slate-600">
                                    Uploaded by {item.uploadedBy} • {item.size}
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                  <Eye className="w-4 h-4 mr-1" />
                                  View
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Download className="w-4 h-4 mr-1" />
                                  Download
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <Avatar className="w-6 h-6">
                                    <AvatarFallback className="text-xs bg-slate-100">{item.author[0]}</AvatarFallback>
                                  </Avatar>
                                  <span className="font-medium text-slate-800">{item.author}</span>
                                </div>
                                <span className="text-sm text-slate-500">{item.timestamp}</span>
                              </div>
                              <p className="text-slate-700 bg-slate-50 p-3 rounded-lg">{item.content}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="timeline" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Clock className="w-5 h-5 mr-2 text-purple-500" />
                      Dispute Timeline
                    </CardTitle>
                    <CardDescription>Chronological order of events</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {dispute.timeline.map((event, index) => (
                        <div key={index} className="flex space-x-4">
                          <div className="flex flex-col items-center">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            {index < dispute.timeline.length - 1 && <div className="w-px h-16 bg-slate-200 mt-2"></div>}
                          </div>
                          <div className="flex-1 pb-8">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-slate-800">{event.action}</span>
                              <Badge variant="outline" className="text-xs">
                                {event.actor}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-600 mb-2">{event.description}</p>
                            <p className="text-xs text-slate-500">{event.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="resolution" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Scale className="w-5 h-5 mr-2 text-green-500" />
                      Admin Resolution
                    </CardTitle>
                    <CardDescription>Make a decision on this dispute</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="resolution">Resolution Notes</Label>
                        <Textarea
                          id="resolution"
                          placeholder="Provide detailed reasoning for your decision..."
                          value={resolution}
                          onChange={(e) => setResolution(e.target.value)}
                          className="min-h-32 mt-2"
                        />
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button className="bg-green-500 hover:bg-green-600">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Favor Freelancer
                      </Button>
                      <Button className="bg-blue-500 hover:bg-blue-600">
                        <DollarSign className="w-4 h-4 mr-2" />
                        Partial Refund
                      </Button>
                      <Button className="bg-red-500 hover:bg-red-600">
                        <XCircle className="w-4 h-4 mr-2" />
                        Favor Client
                      </Button>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start space-x-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-yellow-800">Important</h4>
                          <p className="text-sm text-yellow-700 mt-1">
                            This decision will be final and will trigger the appropriate smart contract actions. Both
                            parties will be notified immediately.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Message Client
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Message Freelancer
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Call
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Request More Info
                </Button>
              </CardContent>
            </Card>

            {/* Dispute Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Dispute Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Created:</span>
                  <span className="text-sm font-medium">{dispute.created}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Priority:</span>
                  <Badge className="bg-red-100 text-red-700">{dispute.priority}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Amount:</span>
                  <span className="text-sm font-medium text-green-600">{dispute.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Status:</span>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    {dispute.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Similar Cases */}
            <Card>
              <CardHeader>
                <CardTitle>Similar Cases</CardTitle>
                <CardDescription>Recent disputes with similar patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { id: "DSP-045", type: "Payment dispute", resolution: "Favor Freelancer" },
                    { id: "DSP-032", type: "Quality dispute", resolution: "Partial Refund" },
                    { id: "DSP-028", type: "Timeline dispute", resolution: "Favor Client" },
                  ].map((case_, index) => (
                    <div key={index} className="p-3 bg-slate-50 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm text-slate-800">{case_.id}</p>
                          <p className="text-xs text-slate-600">{case_.type}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {case_.resolution}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
