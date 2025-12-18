"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { MessageSquare, User } from "lucide-react"
import { toast } from "sonner"

interface FeedbackItem {
  _id: string
  content: string
  email?: string
  userType: string
  isAnonymous: boolean
  createdAt: string
}

export default function AdminFeedbacksPage() {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 10

  const fetchFeedbacks = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('freelancedao_token')
      const res = await fetch(`/api/admin/feedbacks?page=${page}&limit=${limit}`, { 
        headers: { Authorization: `Bearer ${token}` } 
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.message || 'Failed to load feedbacks')
        return
      }
      setFeedbacks(data.feedbacks || [])
      setTotal(data.pagination?.total || 0)
    } catch (e) {
      console.error('Load feedbacks error:', e)
      toast.error('Could not load feedbacks')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchFeedbacks() }, [page])

  const pages = Math.max(1, Math.ceil(total / limit))

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="w-5 h-5 mr-2 text-blue-500" />
            User Feedbacks
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : feedbacks.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <p>No feedbacks found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {feedbacks.map((feedback) => (
                <Card key={feedback._id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={feedback.isAnonymous ? "secondary" : "outline"}>
                            {feedback.isAnonymous ? "Anonymous" : feedback.userType}
                          </Badge>
                          <span className="text-xs text-slate-400">
                            {formatDate(feedback.createdAt)}
                          </span>
                        </div>
                        
                        <p className="text-slate-800 text-lg mb-3 whitespace-pre-wrap">
                          {feedback.content}
                        </p>
                        
                        {!feedback.isAnonymous && feedback.email && (
                          <div className="flex items-center text-sm text-slate-600">
                            <User className="w-4 h-4 mr-2" />
                            <span>{feedback.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-slate-600">Page {page} of {pages}</div>
            <div className="flex gap-2">
              <Button variant="outline" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Prev</Button>
              <Button variant="outline" disabled={page >= pages} onClick={() => setPage(p => Math.min(pages, p + 1))}>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
