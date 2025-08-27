import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertTriangle,
  Users,
  Briefcase,
  DollarSign,
  TrendingUp,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Ban,
  UserCheck,
} from "lucide-react"

export default function AdminDashboard() {
  return (
    <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Users</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">12,847</div>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                +8.2% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Active Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">1,234</div>
              <p className="text-xs text-slate-500 mt-1">456 completed this week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Platform TVL</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">2.4M HBAR</div>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                +15.3% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Active Disputes</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">5</div>
              <p className="text-xs text-slate-500 mt-1">2 resolved today</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="disputes" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
            <TabsTrigger value="disputes">Disputes</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="disputes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-red-500" />
                  Active Disputes
                </CardTitle>
                <CardDescription>Disputes requiring immediate attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      id: "DSP-001",
                      title: "Payment dispute for React Development project",
                      client: "TechStartup Inc.",
                      freelancer: "John Developer",
                      amount: "3,500 HBAR",
                      status: "Under Review",
                      priority: "High",
                      created: "2 hours ago",
                      description: "Client claims work was not completed according to specifications",
                    },
                    {
                      id: "DSP-002",
                      title: "Quality dispute for UI/UX Design work",
                      client: "DesignCorp",
                      freelancer: "Sarah Designer",
                      amount: "2,200 HBAR",
                      status: "Awaiting Evidence",
                      priority: "Medium",
                      created: "1 day ago",
                      description: "Freelancer claims additional scope was requested without payment",
                    },
                    {
                      id: "DSP-003",
                      title: "Timeline dispute for Smart Contract Audit",
                      client: "CryptoLabs",
                      freelancer: "Mike Auditor",
                      amount: "4,800 HBAR",
                      status: "Mediation",
                      priority: "High",
                      created: "3 days ago",
                      description: "Disagreement over project timeline and milestone completion",
                    },
                  ].map((dispute, index) => (
                    <Card key={index} className="border-l-4 border-l-red-500">
                      <CardHeader>
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="font-mono text-xs">
                                {dispute.id}
                              </Badge>
                              <Badge
                                className={
                                  dispute.priority === "High"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-yellow-100 text-yellow-700"
                                }
                              >
                                {dispute.priority} Priority
                              </Badge>
                            </div>
                            <CardTitle className="text-lg text-slate-800">{dispute.title}</CardTitle>
                            <CardDescription className="mt-2">{dispute.description}</CardDescription>
                          </div>
                          <div className="flex flex-col md:items-end gap-2">
                            <Badge
                              variant="secondary"
                              className={
                                dispute.status === "Under Review"
                                  ? "bg-blue-100 text-blue-700"
                                  : dispute.status === "Mediation"
                                    ? "bg-purple-100 text-purple-700"
                                    : "bg-orange-100 text-orange-700"
                              }
                            >
                              {dispute.status}
                            </Badge>
                            <span className="text-lg font-semibold text-green-600">{dispute.amount}</span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-slate-700">Client:</span>
                              <div className="flex items-center mt-1">
                                <Avatar className="w-6 h-6 mr-2">
                                  <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
                                    {dispute.client[0]}
                                  </AvatarFallback>
                                </Avatar>
                                {dispute.client}
                              </div>
                            </div>
                            <div>
                              <span className="font-medium text-slate-700">Freelancer:</span>
                              <div className="flex items-center mt-1">
                                <Avatar className="w-6 h-6 mr-2">
                                  <AvatarFallback className="text-xs bg-green-100 text-green-600">
                                    {dispute.freelancer[0]}
                                  </AvatarFallback>
                                </Avatar>
                                {dispute.freelancer}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-4 border-t border-slate-100">
                            <span className="text-sm text-slate-500">Created {dispute.created}</span>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4 mr-1" />
                                View Details
                              </Button>
                              <Button size="sm" className="bg-blue-500 hover:bg-blue-600">
                                Take Action
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2 text-blue-500" />
                  User Management
                </CardTitle>
                <CardDescription>Monitor and manage platform users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      name: "Sarah Johnson",
                      email: "sarah@example.com",
                      type: "Freelancer",
                      status: "Active",
                      joined: "Jan 2024",
                      jobs: 47,
                      rating: 4.9,
                      earnings: "12,450 HBAR",
                      flags: 0,
                    },
                    {
                      name: "TechStartup Inc.",
                      email: "contact@techstartup.com",
                      type: "Client",
                      status: "Active",
                      joined: "Mar 2024",
                      jobs: 12,
                      rating: 4.7,
                      spent: "45,200 HBAR",
                      flags: 1,
                    },
                    {
                      name: "Mike Developer",
                      email: "mike@dev.com",
                      type: "Freelancer",
                      status: "Under Review",
                      joined: "Feb 2024",
                      jobs: 23,
                      rating: 4.2,
                      earnings: "8,750 HBAR",
                      flags: 2,
                    },
                  ].map((user, index) => (
                    <Card key={index} className={user.flags > 0 ? "border-l-4 border-l-yellow-500" : ""}>
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex items-center space-x-4">
                            <Avatar className="w-12 h-12">
                              <AvatarFallback className="bg-blue-100 text-blue-600">{user.name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-semibold text-slate-800">{user.name}</h4>
                              <p className="text-sm text-slate-600">{user.email}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline">{user.type}</Badge>
                                <Badge
                                  className={
                                    user.status === "Active"
                                      ? "bg-green-100 text-green-700"
                                      : "bg-yellow-100 text-yellow-700"
                                  }
                                >
                                  {user.status}
                                </Badge>
                                {user.flags > 0 && (
                                  <Badge className="bg-red-100 text-red-700">{user.flags} Flags</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col md:items-end gap-2">
                            <div className="text-sm text-slate-600">
                              <div>
                                <strong>{user.jobs}</strong> jobs • <strong>{user.rating}</strong>★
                              </div>
                              <div className="text-green-600 font-medium">
                                {user.type === "Freelancer" ? user.earnings : user.spent}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                              {user.status === "Under Review" && (
                                <>
                                  <Button size="sm" className="bg-green-500 hover:bg-green-600">
                                    <UserCheck className="w-4 h-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Button variant="destructive" size="sm">
                                    <Ban className="w-4 h-4 mr-1" />
                                    Suspend
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="jobs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Briefcase className="w-5 h-5 mr-2 text-purple-500" />
                  Job Monitoring
                </CardTitle>
                <CardDescription>Monitor job postings and completion status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      id: "JOB-1234",
                      title: "React Developer for DeFi Platform",
                      client: "CryptoStartup Inc.",
                      budget: "3,500 HBAR",
                      status: "In Progress",
                      proposals: 15,
                      created: "2 days ago",
                      flagged: false,
                    },
                    {
                      id: "JOB-1235",
                      title: "Suspicious High-Value Project",
                      client: "Unknown Client",
                      budget: "50,000 HBAR",
                      status: "Under Review",
                      proposals: 2,
                      created: "1 hour ago",
                      flagged: true,
                    },
                    {
                      id: "JOB-1236",
                      title: "Mobile App UI Design",
                      client: "DesignCorp",
                      budget: "2,200 HBAR",
                      status: "Completed",
                      proposals: 23,
                      created: "1 week ago",
                      flagged: false,
                    },
                  ].map((job, index) => (
                    <Card key={index} className={job.flagged ? "border-l-4 border-l-red-500" : ""}>
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="font-mono text-xs">
                                {job.id}
                              </Badge>
                              {job.flagged && (
                                <Badge className="bg-red-100 text-red-700">
                                  <AlertTriangle className="w-3 h-3 mr-1" />
                                  Flagged
                                </Badge>
                              )}
                            </div>
                            <h4 className="font-semibold text-slate-800">{job.title}</h4>
                            <p className="text-sm text-slate-600">{job.client}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                              <span>{job.proposals} proposals</span>
                              <span>•</span>
                              <span>Posted {job.created}</span>
                            </div>
                          </div>
                          <div className="flex flex-col md:items-end gap-2">
                            <Badge
                              className={
                                job.status === "Completed"
                                  ? "bg-green-100 text-green-700"
                                  : job.status === "In Progress"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-yellow-100 text-yellow-700"
                              }
                            >
                              {job.status}
                            </Badge>
                            <span className="text-lg font-semibold text-green-600">{job.budget}</span>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4 mr-1" />
                                Review
                              </Button>
                              {job.flagged && (
                                <Button variant="destructive" size="sm">
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Remove
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="w-5 h-5 mr-2 text-green-500" />
                  Payment Monitoring
                </CardTitle>
                <CardDescription>Track escrow payments and transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      id: "TXN-789",
                      project: "E-commerce Website Development",
                      client: "TechStartup Inc.",
                      freelancer: "Sarah Johnson",
                      amount: "3,500 HBAR",
                      status: "Escrowed",
                      type: "Milestone Payment",
                      created: "1 hour ago",
                    },
                    {
                      id: "TXN-790",
                      project: "Smart Contract Audit",
                      client: "CryptoLabs",
                      freelancer: "Mike Auditor",
                      amount: "4,800 HBAR",
                      status: "Released",
                      type: "Final Payment",
                      created: "3 hours ago",
                    },
                    {
                      id: "TXN-791",
                      project: "Logo Design Project",
                      client: "StartupXYZ",
                      freelancer: "Anna Designer",
                      amount: "1,200 HBAR",
                      status: "Disputed",
                      type: "Full Payment",
                      created: "1 day ago",
                    },
                  ].map((payment, index) => (
                    <Card key={index}>
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="font-mono text-xs">
                                {payment.id}
                              </Badge>
                              <Badge variant="secondary">{payment.type}</Badge>
                            </div>
                            <h4 className="font-semibold text-slate-800">{payment.project}</h4>
                            <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                              <span>
                                <strong>Client:</strong> {payment.client}
                              </span>
                              <span>•</span>
                              <span>
                                <strong>Freelancer:</strong> {payment.freelancer}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col md:items-end gap-2">
                            <Badge
                              className={
                                payment.status === "Released"
                                  ? "bg-green-100 text-green-700"
                                  : payment.status === "Escrowed"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-red-100 text-red-700"
                              }
                            >
                              <div className="flex items-center">
                                {payment.status === "Released" ? (
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                ) : payment.status === "Disputed" ? (
                                  <AlertTriangle className="w-3 h-3 mr-1" />
                                ) : (
                                  <Clock className="w-3 h-3 mr-1" />
                                )}
                                {payment.status}
                              </div>
                            </Badge>
                            <span className="text-lg font-semibold text-green-600">{payment.amount}</span>
                            <span className="text-sm text-slate-500">{payment.created}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Growth</CardTitle>
                  <CardDescription>User registration and activity trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">New Users (30 days)</span>
                      <span className="text-2xl font-bold text-blue-600">1,247</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Active Users (7 days)</span>
                      <span className="text-2xl font-bold text-green-600">8,934</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Jobs Posted (30 days)</span>
                      <span className="text-2xl font-bold text-purple-600">456</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Success Rate</span>
                      <span className="text-2xl font-bold text-orange-600">94.2%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Financial Overview</CardTitle>
                  <CardDescription>Platform revenue and transaction volume</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total Volume (30 days)</span>
                      <span className="text-2xl font-bold text-green-600">245K HBAR</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Platform Fees</span>
                      <span className="text-2xl font-bold text-blue-600">12.3K HBAR</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Avg. Job Value</span>
                      <span className="text-2xl font-bold text-purple-600">2,847 HBAR</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Dispute Rate</span>
                      <span className="text-2xl font-bold text-red-600">2.1%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest platform events and actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    {
                      action: "New user registration",
                      user: "Alex Developer",
                      time: "2 minutes ago",
                      type: "user",
                    },
                    {
                      action: "Job completed",
                      user: "React Development Project",
                      time: "15 minutes ago",
                      type: "job",
                    },
                    {
                      action: "Dispute resolved",
                      user: "Payment dispute #DSP-004",
                      time: "1 hour ago",
                      type: "dispute",
                    },
                    {
                      action: "Large payment processed",
                      user: "8,500 HBAR escrow release",
                      time: "2 hours ago",
                      type: "payment",
                    },
                    {
                      action: "User verification completed",
                      user: "TechCorp Industries",
                      time: "3 hours ago",
                      type: "verification",
                    },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            activity.type === "user"
                              ? "bg-blue-500"
                              : activity.type === "job"
                                ? "bg-green-500"
                                : activity.type === "dispute"
                                  ? "bg-red-500"
                                  : activity.type === "payment"
                                    ? "bg-purple-500"
                                    : "bg-orange-500"
                          }`}
                        />
                        <div>
                          <p className="text-sm font-medium text-slate-800">{activity.action}</p>
                          <p className="text-xs text-slate-600">{activity.user}</p>
                        </div>
                      </div>
                      <span className="text-xs text-slate-500">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
    </div>
  )
}
