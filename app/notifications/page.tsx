"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
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
  Loader2,
} from "lucide-react"
import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"
import Link from "next/link"

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  data: {
    jobId?: string;
    proposalId?: string;
    contractId?: string;
    actionUrl?: string;
    senderName?: string;
    amount?: number;
    currency?: string;
  };
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'job_approved':
      return <Briefcase className="w-5 h-5 text-green-500" />;
    case 'proposal_submitted':
      return <MessageSquare className="w-5 h-5 text-blue-500" />;
    case 'proposal_accepted':
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    case 'proposal_rejected':
      return <AlertTriangle className="w-5 h-5 text-red-500" />;
    case 'contract_signed':
      return <DollarSign className="w-5 h-5 text-purple-500" />;
    case 'milestone_completed':
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    case 'payment_received':
      return <DollarSign className="w-5 h-5 text-green-500" />;
    default:
      return <Bell className="w-5 h-5 text-slate-500" />;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'job_approved':
    case 'proposal_accepted':
    case 'contract_signed':
    case 'milestone_completed':
    case 'payment_received':
      return 'border-green-200 bg-green-50';
    case 'proposal_submitted':
      return 'border-blue-200 bg-blue-50';
    case 'proposal_rejected':
      return 'border-red-200 bg-red-50';
    default:
      return 'border-slate-200 bg-white';
  }
};

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAsRead, setMarkingAsRead] = useState<string | null>(null);
  const [markingAllAsRead, setMarkingAllAsRead] = useState(false);
  
  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;
      
      try {
        const token = localStorage.getItem('freelancedao_token');
        if (!token) return;
        
        const response = await fetch('/api/notifications', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setNotifications(data.notifications || []);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
        toast.error('Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotifications();
  }, [user]);
  
  const markAsRead = async (notificationId: string) => {
    setMarkingAsRead(notificationId);
    
    try {
      const token = localStorage.getItem('freelancedao_token');
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationIds: [notificationId]
        }),
      });
      
      if (response.ok) {
        setNotifications(notifications.map(notif => 
          notif._id === notificationId ? { ...notif, read: true } : notif
        ));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    } finally {
      setMarkingAsRead(null);
    }
  };
  
  const markAllAsRead = async () => {
    setMarkingAllAsRead(true);
    
    try {
      const token = localStorage.getItem('freelancedao_token');
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          markAll: true
        }),
      });
      
      if (response.ok) {
        setNotifications(notifications.map(notif => ({ ...notif, read: true })));
        toast.success('All notifications marked as read');
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    } finally {
      setMarkingAllAsRead(false);
    }
  };
  
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

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <ProtectedRoute requireAuth={true} requireCompleteProfile={true}>

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
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="p-4 border rounded-lg">
                        <div className="flex items-start space-x-4">
                          <Skeleton className="w-10 h-10 rounded-full" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-full" />
                            <Skeleton className="h-3 w-1/2" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                    <h3 className="text-lg font-medium text-slate-800 mb-2">No notifications yet</h3>
                    <p className="text-slate-600">You'll see notifications here when there's activity on your account.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {notifications.map((notification) => (
                      <div
                        key={notification._id}
                        className={`p-4 border rounded-lg transition-colors cursor-pointer ${
                          notification.read ? "border-slate-200 bg-white" : getNotificationColor(notification.type)
                        }`}
                        onClick={() => !notification.read && markAsRead(notification._id)}
                      >
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className={`font-semibold ${
                                  notification.read ? "text-slate-800" : "text-slate-900"
                                }`}>
                                  {notification.title}
                                </h4>
                                <p className={`text-sm mt-1 ${
                                  notification.read ? "text-slate-600" : "text-slate-700"
                                }`}>
                                  {notification.message}
                                </p>
                                <div className="flex items-center justify-between mt-3">
                                  <span className="text-xs text-slate-500 flex items-center">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {formatTimeAgo(notification.createdAt)}
                                  </span>
                                  {notification.data.actionUrl && (
                                    <Link href={notification.data.actionUrl}>
                                      <Button variant="outline" size="sm">
                                        View Details
                                      </Button>
                                    </Link>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {markingAsRead === notification._id && (
                                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                                )}
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                    .filter((n) => n.type === "proposal_submitted" || n.type === "message_received")
                    .map((notification) => (
                      <div
                        key={notification._id}
                        className={`p-4 border rounded-lg ${
                          notification.read ? "border-slate-200" : "border-blue-200 bg-blue-50"
                        }`}
                      >
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-800">{notification.title}</h4>
                            <p className="text-sm text-slate-600 mt-1">{notification.message}</p>
                            <div className="flex items-center justify-between mt-3">
                              <span className="text-xs text-slate-500">{formatTimeAgo(notification.createdAt)}</span>
                              {notification.data.actionUrl && (
                                <Link href={notification.data.actionUrl}>
                                  <Button variant="outline" size="sm">
                                    View Details
                                  </Button>
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  {notifications.filter((n) => n.type === "proposal_submitted" || n.type === "message_received").length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                      <MessageSquare className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                      <p>No message notifications</p>
                    </div>
                  )}
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
                    .filter((n) => n.type === "payment_received" || n.type === "contract_signed" || n.type === "milestone_completed")
                    .map((notification) => (
                      <div
                        key={notification._id}
                        className={`p-4 border rounded-lg ${
                          notification.read ? "border-slate-200" : "border-green-200 bg-green-50"
                        }`}
                      >
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-800">{notification.title}</h4>
                            <p className="text-sm text-slate-600 mt-1">{notification.message}</p>
                            <div className="flex items-center justify-between mt-3">
                              <span className="text-xs text-slate-500">{formatTimeAgo(notification.createdAt)}</span>
                              {notification.data.actionUrl && (
                                <Link href={notification.data.actionUrl}>
                                  <Button variant="outline" size="sm">
                                    View Details
                                  </Button>
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  {notifications.filter((n) => n.type === "payment_received" || n.type === "contract_signed" || n.type === "milestone_completed").length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                      <DollarSign className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                      <p>No payment notifications</p>
                    </div>
                  )}
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
                    .filter((n) => n.type === "job_approved" || n.type === "proposal_accepted" || n.type === "proposal_rejected")
                    .map((notification) => (
                      <div
                        key={notification._id}
                        className={`p-4 border rounded-lg ${
                          notification.read ? "border-slate-200" : getNotificationColor(notification.type)
                        }`}
                      >
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-800">{notification.title}</h4>
                            <p className="text-sm text-slate-600 mt-1">{notification.message}</p>
                            <div className="flex items-center justify-between mt-3">
                              <span className="text-xs text-slate-500">{formatTimeAgo(notification.createdAt)}</span>
                              {notification.data.actionUrl && (
                                <Link href={notification.data.actionUrl}>
                                  <Button variant="outline" size="sm">
                                    View Details
                                  </Button>
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  {notifications.filter((n) => n.type === "job_approved" || n.type === "proposal_accepted" || n.type === "proposal_rejected").length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                      <Briefcase className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                      <p>No job notifications</p>
                    </div>
                  )}
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
                    .filter((n) => n.type === "review_received")
                    .map((notification) => (
                      <div
                        key={notification._id}
                        className={`p-4 border rounded-lg ${
                          notification.read ? "border-slate-200" : "border-yellow-200 bg-yellow-50"
                        }`}
                      >
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-800">{notification.title}</h4>
                            <p className="text-sm text-slate-600 mt-1">{notification.message}</p>
                            <div className="flex items-center justify-between mt-3">
                              <span className="text-xs text-slate-500">{formatTimeAgo(notification.createdAt)}</span>
                              {notification.data.actionUrl && (
                                <Link href={notification.data.actionUrl}>
                                  <Button variant="outline" size="sm">
                                    View Details
                                  </Button>
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  {notifications.filter((n) => n.type === "review_received").length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                      <Star className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                      <p>No review notifications</p>
                    </div>
                  )}
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
                        <p className="text-sm text-slate-500">Play sound for new notifications</p>
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
                  <CardDescription>Control which types of notifications you receive</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="jobAlerts">Job Alerts</Label>
                    <Switch
                      id="jobAlerts"
                      checked={settings.jobAlerts}
                      onCheckedChange={(checked) => setSettings({ ...settings, jobAlerts: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="messageAlerts">Message Alerts</Label>
                    <Switch
                      id="messageAlerts"
                      checked={settings.messageAlerts}
                      onCheckedChange={(checked) => setSettings({ ...settings, messageAlerts: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="paymentAlerts">Payment Alerts</Label>
                    <Switch
                      id="paymentAlerts"
                      checked={settings.paymentAlerts}
                      onCheckedChange={(checked) => setSettings({ ...settings, paymentAlerts: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="reviewAlerts">Review Alerts</Label>
                    <Switch
                      id="reviewAlerts"
                      checked={settings.reviewAlerts}
                      onCheckedChange={(checked) => setSettings({ ...settings, reviewAlerts: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="disputeAlerts">Dispute Alerts</Label>
                    <Switch
                      id="disputeAlerts"
                      checked={settings.disputeAlerts}
                      onCheckedChange={(checked) => setSettings({ ...settings, disputeAlerts: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="milestoneAlerts">Milestone Alerts</Label>
                    <Switch
                      id="milestoneAlerts"
                      checked={settings.milestoneAlerts}
                      onCheckedChange={(checked) => setSettings({ ...settings, milestoneAlerts: checked })}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  )
}
