"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "sonner"
import { Briefcase, CheckCircle, XCircle } from "lucide-react"

interface JobItem {
  id: string
  title: string
  client: string
  clientCompany: string
  budget: string
  status: string
  proposals: number
  created: string
  flagged: boolean
  category: string
  skills: string[]
  description: string
  duration: string
  urgency: string
}

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<JobItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("draft")
  const [category, setCategory] = useState("all")
  const [flaggedOnly, setFlaggedOnly] = useState(false)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 12

  const qs = useMemo(() => {
    const params = new URLSearchParams()
    if (status) params.set("status", status)
    if (category) params.set("category", category)
    if (search.trim()) params.set("search", search.trim())
    if (flaggedOnly) params.set("flagged", "true")
    params.set("page", String(page))
    params.set("limit", String(limit))
    return params.toString()
  }, [status, category, search, flaggedOnly, page])

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('freelancedao_token')
      const res = await fetch(`/api/admin/jobs?${qs}`, { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.message || 'Failed to load jobs')
        return
      }
      setJobs(data.jobs || [])
      setTotal(data.pagination?.total || 0)
    } catch (e) {
      console.error('Load jobs error:', e)
      toast.error('Could not load jobs')
    } finally {
      setLoading(false)
    }
  }

  const handleJobAction = async (jobId: string, action: 'approve' | 'reject') => {
    try {
      const token = localStorage.getItem('freelancedao_token')
      const res = await fetch('/api/admin/jobs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ jobId, action })
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.message || `Failed to ${action} job`)
        return
      }
      toast.success(`Job ${action}d successfully`)
      fetchJobs()
    } catch (e) {
      console.error('Job action error:', e)
      toast.error('Action failed')
    }
  }

  useEffect(() => { fetchJobs() }, [qs])

  const pages = Math.max(1, Math.ceil(total / limit))

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Briefcase className="w-5 h-5 mr-2 text-purple-500" />
            Jobs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
            <Input placeholder="Search jobs" value={search} onChange={(e) => setSearch(e.target.value)} />
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                <SelectItem value="web-dev">Web Dev</SelectItem>
                <SelectItem value="mobile-dev">Mobile Dev</SelectItem>
                <SelectItem value="design">Design</SelectItem>
                <SelectItem value="writing">Writing</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="data">Data</SelectItem>
                <SelectItem value="blockchain">Blockchain</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Button variant={flaggedOnly ? 'default' : 'outline'} onClick={() => setFlaggedOnly(v => !v)}>
              {flaggedOnly ? 'Showing flagged only' : 'Show flagged only'}
            </Button>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Briefcase className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <p>No jobs found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <Card key={job.id} className="border-l-4 border-l-orange-500">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="font-mono text-xs">{job.id}</Badge>
                          <Badge className="bg-orange-100 text-orange-700">{job.status}</Badge>
                          <Badge variant="secondary">{job.category}</Badge>
                          {job.urgency === 'high' && (<Badge className="bg-red-100 text-red-700">High Priority</Badge>)}
                          {job.flagged && (<Badge className="bg-yellow-100 text-yellow-700">Flagged</Badge>)}
                          <Badge variant="outline">{job.proposals} proposals</Badge>
                        </div>
                        <h4 className="font-semibold text-slate-800 text-lg mb-2">{job.title}</h4>
                        <p className="text-sm text-slate-600 mb-3 line-clamp-2">{job.description}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-slate-700">Client:</span>
                            <div className="flex items-center mt-1">
                              <Avatar className="w-6 h-6 mr-2"><AvatarFallback className="text-xs bg-blue-100 text-blue-600">{job.client[0]}</AvatarFallback></Avatar>
                              <div>
                                <div>{job.client}</div>
                                {job.clientCompany && (<div className="text-xs text-slate-500">{job.clientCompany}</div>)}
                              </div>
                            </div>
                          </div>
                          <div>
                            <span className="font-medium text-slate-700">Budget:</span>
                            <div className="text-green-600 font-semibold mt-1">{job.budget}</div>
                          </div>
                          <div>
                            <span className="font-medium text-slate-700">Duration:</span>
                            <div className="mt-1">{job.duration}</div>
                          </div>
                          <div>
                            <span className="font-medium text-slate-700">Skills:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {job.skills.slice(0, 3).map((skill, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">{skill}</Badge>
                              ))}
                              {job.skills.length > 3 && (
                                <Badge variant="outline" className="text-xs">+{job.skills.length - 3} more</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="text-sm text-slate-500 text-right">Posted {job.created}</div>
                        {job.status.toLowerCase() === 'draft' && (
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleJobAction(job.id, 'reject')}>
                              <XCircle className="w-4 h-4 mr-1" /> Reject
                            </Button>
                            <Button size="sm" className="bg-green-500 hover:bg-green-600" onClick={() => handleJobAction(job.id, 'approve')}>
                              <CheckCircle className="w-4 h-4 mr-1" /> Approve
                            </Button>
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
