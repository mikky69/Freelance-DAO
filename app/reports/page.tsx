"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { BarChart3, TrendingUp, DollarSign, Users, Calendar, Download } from "lucide-react"
import { useState } from "react"

const earningsData = [
  { month: "Jan", earnings: 2400, projects: 3 },
  { month: "Feb", earnings: 3200, projects: 4 },
  { month: "Mar", earnings: 2800, projects: 3 },
  { month: "Apr", earnings: 4100, projects: 5 },
  { month: "May", earnings: 3600, projects: 4 },
  { month: "Jun", earnings: 4800, projects: 6 },
]

const skillsData = [
  { skill: "React", projects: 12, earnings: 15600 },
  { skill: "Node.js", projects: 8, earnings: 11200 },
  { skill: "TypeScript", projects: 10, earnings: 13400 },
  { skill: "Python", projects: 6, earnings: 8900 },
  { skill: "Design", projects: 4, earnings: 5200 },
]

const clientsData = [
  { name: "TechCorp", value: 35, color: "#3B82F6" },
  { name: "StartupXYZ", value: 25, color: "#10B981" },
  { name: "DesignCo", value: 20, color: "#F59E0B" },
  { name: "Others", value: 20, color: "#6B7280" },
]

export default function ReportsPage() {
  const [timeRange, setTimeRange] = useState("6months")
  const [reportType, setReportType] = useState("overview")

  const totalEarnings = earningsData.reduce((sum, item) => sum + item.earnings, 0)
  const totalProjects = earningsData.reduce((sum, item) => sum + item.projects, 0)
  const avgProjectValue = totalEarnings / totalProjects

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">Analytics & Reports</h1>
              <p className="text-slate-600">Track your performance and earnings insights</p>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1month">Last Month</SelectItem>
                  <SelectItem value="3months">Last 3 Months</SelectItem>
                  <SelectItem value="6months">Last 6 Months</SelectItem>
                  <SelectItem value="1year">Last Year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Total Earnings</p>
                    <p className="text-2xl font-bold text-slate-800">${totalEarnings.toLocaleString()}</p>
                    <p className="text-sm text-green-600 flex items-center mt-1">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +12.5% from last period
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Projects Completed</p>
                    <p className="text-2xl font-bold text-slate-800">{totalProjects}</p>
                    <p className="text-sm text-blue-600 flex items-center mt-1">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +8.3% from last period
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Avg Project Value</p>
                    <p className="text-2xl font-bold text-slate-800">${Math.round(avgProjectValue).toLocaleString()}</p>
                    <p className="text-sm text-purple-600 flex items-center mt-1">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +5.2% from last period
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Success Rate</p>
                    <p className="text-2xl font-bold text-slate-800">94.2%</p>
                    <p className="text-sm text-green-600 flex items-center mt-1">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +2.1% from last period
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="earnings" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="earnings">Earnings</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
              <TabsTrigger value="clients">Clients</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>

            <TabsContent value="earnings" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Earnings</CardTitle>
                    <CardDescription>Your earnings trend over the selected period</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={earningsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`$${value}`, "Earnings"]} />
                        <Bar dataKey="earnings" fill="#3B82F6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Projects Completed</CardTitle>
                    <CardDescription>Number of projects completed each month</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={earningsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => [value, "Projects"]} />
                        <Line type="monotone" dataKey="projects" stroke="#10B981" strokeWidth={3} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Earnings Breakdown</CardTitle>
                  <CardDescription>Detailed breakdown of your earnings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-800">Fixed Price Projects</p>
                        <p className="text-sm text-slate-600">18 projects completed</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-800">$16,800</p>
                        <p className="text-sm text-slate-600">68% of total</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-800">Hourly Projects</p>
                        <p className="text-sm text-slate-600">7 projects completed</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-800">$7,900</p>
                        <p className="text-sm text-slate-600">32% of total</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="skills" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Skills Performance</CardTitle>
                  <CardDescription>How your different skills are performing</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {skillsData.map((skill, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-slate-800">{skill.skill}</span>
                          <div className="flex items-center space-x-4 text-sm text-slate-600">
                            <span>{skill.projects} projects</span>
                            <span className="font-semibold">${skill.earnings.toLocaleString()}</span>
                          </div>
                        </div>
                        <Progress value={(skill.earnings / 15600) * 100} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Performing Skills</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {skillsData.slice(0, 3).map((skill, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                index === 0
                                  ? "bg-yellow-100 text-yellow-600"
                                  : index === 1
                                    ? "bg-slate-100 text-slate-600"
                                    : "bg-orange-100 text-orange-600"
                              }`}
                            >
                              {index + 1}
                            </div>
                            <span className="font-medium">{skill.skill}</span>
                          </div>
                          <Badge variant="outline">${skill.earnings.toLocaleString()}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Skill Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="font-medium text-blue-800">Next.js</p>
                        <p className="text-sm text-blue-600">High demand, +$15/hr premium</p>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="font-medium text-green-800">GraphQL</p>
                        <p className="text-sm text-green-600">Growing market, +$12/hr premium</p>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <p className="font-medium text-purple-800">AWS</p>
                        <p className="text-sm text-purple-600">Enterprise demand, +$20/hr premium</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="clients" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Client Distribution</CardTitle>
                    <CardDescription>Breakdown of earnings by client</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={clientsData}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}%`}
                        >
                          {clientsData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Top Clients</CardTitle>
                    <CardDescription>Your most valuable client relationships</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-medium text-slate-800">TechCorp Solutions</p>
                          <p className="text-sm text-slate-600">8 projects • 4.9★</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-800">$8,640</p>
                          <Badge className="bg-green-100 text-green-700">Active</Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-medium text-slate-800">StartupXYZ</p>
                          <p className="text-sm text-slate-600">5 projects • 4.8★</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-800">$6,175</p>
                          <Badge className="bg-blue-100 text-blue-700">Ongoing</Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-medium text-slate-800">DesignCo</p>
                          <p className="text-sm text-slate-600">3 projects • 4.7★</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-800">$4,940</p>
                          <Badge variant="outline">Completed</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="performance" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Project Success Rate</span>
                        <span>94.2%</span>
                      </div>
                      <Progress value={94.2} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>On-Time Delivery</span>
                        <span>91.7%</span>
                      </div>
                      <Progress value={91.7} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Client Satisfaction</span>
                        <span>96.8%</span>
                      </div>
                      <Progress value={96.8} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Repeat Client Rate</span>
                        <span>73.5%</span>
                      </div>
                      <Progress value={73.5} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Achievements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-green-800">Top Performer</p>
                          <p className="text-sm text-green-600">Ranked in top 5% this month</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-blue-800">Client Favorite</p>
                          <p className="text-sm text-blue-600">3 clients marked you as favorite</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <Calendar className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-purple-800">Streak Master</p>
                          <p className="text-sm text-purple-600">15 projects delivered on time</p>
                        </div>
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
