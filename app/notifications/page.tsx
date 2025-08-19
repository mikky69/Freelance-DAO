"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Bell,
  MessageSquare,
  DollarSign,
  Briefcase,
  Star,
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings,
  Smartphone,
  Mail,
  Volume2,
} from "lucide-react"
import { useState } from "react"
import { ProtectedRoute } from "@/components/protected-route"

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "payment",
      title: "Payment Received",
      message: "You received 3,500 HBAR from TechStartup Inc. for E-commerce Website Development",
      time: "2 minutes ago",
      read: false,
      icon: <DollarSign className="w-5 h-5 text-green-500" />,
      action: "View Transaction",
    },
    {
      id: 2,
      type: "message",
      title: "New Message",
      message: "CryptoLabs sent you a message about the Smart Contract Audit project",
      time: "15 minutes ago",
      read: false,
      icon: <MessageSquare className="w-5 h-5 text-blue-500" />,
      action: "Reply",
    },
    {
      id: 3,
      type: "job",
      title: "Job Application Update",
      message: "Your proposal for 'React Native App Development' has been accepted!",
      time: "1 hour ago",
      read: true,
      icon: <Briefcase className="w-5 h-5 text-purple-500" />,
      action: "View Project",
    },
    {
      id: 4,
      type: "review",
      title: "New Review",
      message: "DesignCorp left you a 5-star review for the Mobile App UI Design project",
      time: "3 hours ago",
      read: true,
      icon: <Star className="w-5 h-5 text-yellow-500" />,
      action: "View Review",
    },
    {
      id: 5,
      type: "dispute",
      title: "Dispute Resolution",
      message: "The dispute for project #PRJ-456 has been resolved in your favor",
      time: "1 day ago",
      read: true,
      icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
      action: "View Details",
    },
    {
      id: 6,
      type: "milestone",
      title: "Milestone Approved",
      message: "Milestone 2 for E-commerce Website Development has been approved",
      time: "2 days ago",
      read: true,
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      action: "Continue Work",
    },
  ])

  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    soundEnabled: true,
    jobAlerts: true,
    messageAlerts: true,
    paymentAlerts: true,
    reviewAlerts: true,
    disputeAlerts: true,
    milestoneAlerts: true,
  })

  const markAsRead = (id: number) => {
    setNotifications(notifications.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)))
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map((notif) => ({ ...notif, read: true })))
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <ProtectedRoute requireAuth={true} requireCompleteProfile={true}>
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <div className="bg-white border-b border-slate-200">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Notifications</h1>
                <p className="text-slate-600">Stay updated with your freelance activities</p>
              </div>
              <div className="flex items-center space-x-3">
                {unreadCount > 0 && <Badge className="bg-blue-500 text-white">{unreadCount} unread</Badge>}
                <Button onClick={markAllAsRead} variant="outline">
                  Mark All Read
                </Button>
                <Button className="bg-blue-500 hover:bg-blue-600">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="w-5 h-5 mr-2 text-blue-500" />
                  All Notifications
                </CardTitle>
                <CardDescription>Your recent activity and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border rounded-lg transition-colors cursor-pointer ${
                        notification.read ? "border-slate-200 bg-white" : "border-blue-200 bg-blue-50"
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 mt-1">{notification.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className={`font-semibold ${notification.read ? "text-slate-800" : "text-blue-800"}`}>
                                {notification.title}
                              </h4>
                              <p className={`text-sm mt-1 ${notification.read ? "text-slate-600" : "text-blue-700"}`}>
                                {notification.message}
                              </p>
                              <div className="flex items-center justify-between mt-3">
                                <span className="text-xs text-slate-500 flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {notification.time}
                                </span>
                                <Button variant="outline" size="sm">
                                  {notification.action}
                                </Button>
                              </div>
                            </div>
                            {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-2"></div>}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2 text-blue-500" />
                  Message Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notifications
                    .filter((n) => n.type === "message")
                    .map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border rounded-lg ${
                          notification.read ? "border-slate-200" : "border-blue-200 bg-blue-50"
                        }`}
                      >
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0 mt-1">{notification.icon}</div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-800">{notification.title}</h4>
                            <p className="text-sm text-slate-600 mt-1">{notification.message}</p>
                            <div className="flex items-center justify-between mt-3">
                              <span className="text-xs text-slate-500">{notification.time}</span>
                              <Button variant="outline" size="sm">
                                {notification.action}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="w-5 h-5 mr-2 text-green-500" />
                  Payment Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notifications
                    .filter((n) => n.type === "payment" || n.type === "milestone")
                    .map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border rounded-lg ${
                          notification.read ? "border-slate-200" : "border-green-200 bg-green-50"
                        }`}
                      >
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0 mt-1">{notification.icon}</div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-800">{notification.title}</h4>
                            <p className="text-sm text-slate-600 mt-1">{notification.message}</p>
                            <div className="flex items-center justify-between mt-3">
                              <span className="text-xs text-slate-500">{notification.time}</span>
                              <Button variant="outline" size="sm">
                                {notification.action}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="jobs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Briefcase className="w-5 h-5 mr-2 text-purple-500" />
                  Job Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notifications
                    .filter((n) => n.type === "job")
                    .map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border rounded-lg ${
                          notification.read ? "border-slate-200" : "border-purple-200 bg-purple-50"
                        }`}
                      >
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0 mt-1">{notification.icon}</div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-800">{notification.title}</h4>
                            <p className="text-sm text-slate-600 mt-1">{notification.message}</p>
                            <div className="flex items-center justify-between mt-3">
                              <span className="text-xs text-slate-500">{notification.time}</span>
                              <Button variant="outline" size="sm">
                                {notification.action}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="w-5 h-5 mr-2 text-yellow-500" />
                  Review Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notifications
                    .filter((n) => n.type === "review")
                    .map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border rounded-lg ${
                          notification.read ? "border-slate-200" : "border-yellow-200 bg-yellow-50"
                        }`}
                      >
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0 mt-1">{notification.icon}</div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-800">{notification.title}</h4>
                            <p className="text-sm text-slate-600 mt-1">{notification.message}</p>
                            <div className="flex items-center justify-between mt-3">
                              <span className="text-xs text-slate-500">{notification.time}</span>
                              <Button variant="outline" size="sm">
                                {notification.action}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Notification Channels */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="w-5 h-5 mr-2 text-slate-500" />
                    Notification Channels
                  </CardTitle>
                  <CardDescription>Choose how you want to receive notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-blue-500" />
                      <div>
                        <Label htmlFor="email">Email Notifications</Label>
                        <p className="text-sm text-slate-500">Receive notifications via email</p>
                      </div>
                    </div>
                    <Switch
                      id="email"
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Smartphone className="w-5 h-5 text-green-500" />
                      <div>
                        <Label htmlFor="push">Push Notifications</Label>
                        <p className="text-sm text-slate-500">Receive browser push notifications</p>
                      </div>
                    </div>
                    <Switch
                      id="push"
                      checked={settings.pushNotifications}
                      onCheckedChange={(checked) => setSettings({ ...settings, pushNotifications: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <MessageSquare className="w-5 h-5 text-purple-500" />
                      <div>
                        <Label htmlFor="sms">SMS Notifications</Label>
                        <p className="text-sm text-slate-500">Receive text message alerts</p>
                      </div>
                    </div>
                    <Switch
                      id="sms"
                      checked={settings.smsNotifications}
                      onCheckedChange={(checked) => setSettings({ ...settings, smsNotifications: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Volume2 className="w-5 h-5 text-orange-500" />
                      <div>
                        <Label htmlFor="sound">Sound Alerts</Label>
                        <p className="text-sm text-slate-500">Play sound for notifications</p>
                      </div>
                    </div>
                    <Switch
                      id="sound"
                      checked={settings.soundEnabled}
                      onCheckedChange={(checked) => setSettings({ ...settings, soundEnabled: checked })}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Notification Types */}
              <Card>
                <CardHeader>
                  <CardTitle>Notification Types</CardTitle>
                  <CardDescription>Choose which types of notifications to receive</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Briefcase className="w-5 h-5 text-purple-500" />
                      <Label htmlFor="jobs">Job Updates</Label>
                    </div>
                    <Switch
                      id="jobs"
                      checked={settings.jobAlerts}
                      onCheckedChange={(checked) => setSettings({ ...settings, jobAlerts: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <MessageSquare className="w-5 h-5 text-blue-500" />
                      <Label htmlFor="messages">New Messages</Label>
                    </div>
                    <Switch
                      id="messages"
                      checked={settings.messageAlerts}
                      onCheckedChange={(checked) => setSettings({ ...settings, messageAlerts: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <DollarSign className="w-5 h-5 text-green-500" />
                      <Label htmlFor="payments">Payment Updates</Label>
                    </div>
                    <Switch
                      id="payments"
                      checked={settings.paymentAlerts}
                      onCheckedChange={(checked) => setSettings({ ...settings, paymentAlerts: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Star className="w-5 h-5 text-yellow-500" />
                      <Label htmlFor="reviews">New Reviews</Label>
                    </div>
                    <Switch
                      id="reviews"
                      checked={settings.reviewAlerts}
                      onCheckedChange={(checked) => setSettings({ ...settings, reviewAlerts: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                      <Label htmlFor="disputes">Dispute Alerts</Label>
                    </div>
                    <Switch
                      id="disputes"
                      checked={settings.disputeAlerts}
                      onCheckedChange={(checked) => setSettings({ ...settings, disputeAlerts: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <Label htmlFor="milestones">Milestone Updates</Label>
                    </div>
                    <Switch
                      id="milestones"
                      checked={settings.milestoneAlerts}
                      onCheckedChange={(checked) => setSettings({ ...settings, milestoneAlerts: checked })}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Quiet Hours</CardTitle>
                <CardDescription>Set times when you don't want to receive notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start-time">Start Time</Label>
                    <input
                      type="time"
                      id="start-time"
                      className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2"
                      defaultValue="22:00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="end-time">End Time</Label>
                    <input
                      type="time"
                      id="end-time"
                      className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2"
                      defaultValue="08:00"
                    />
                  </div>
                </div>
                <Button className="mt-4 bg-blue-500 hover:bg-blue-600">Save Quiet Hours</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
