'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { DollarSign, Clock, Users, ArrowLeft } from 'lucide-react'
import { ApplyJobModal } from '@/components/jobs/ApplyJobModal'

interface Job {
  _id: string
  title: string
  description: string
  budget: { amount: number; currency: string; type: 'fixed' | 'hourly' }
  duration: string
  skills: string[]
  client: { fullname: string; avatar?: string; verified?: boolean }
  createdAt: string
  proposals: any[]
  category: string
  urgency: 'low' | 'medium' | 'high'
  featured: boolean
}

export default function JobDetailPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch(`/api/jobs/${id}`)
        if (!res.ok) {
          setLoading(false)
          return
        }
        const data = await res.json()
        setJob(data.job)
      } finally {
        setLoading(false)
      }
    }
    if (id) run()
  }, [id])

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center gap-3">
          <Button variant="outline" onClick={() => router.push('/jobs')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Jobs
          </Button>
        </div>

        {loading ? (
          <Card>
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        ) : job ? (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle className="text-2xl">{job.title}</CardTitle>
                {job.featured && <Badge className="bg-blue-100 text-blue-700 text-xs">Featured</Badge>}
                <Badge className="text-xs">{job.urgency} priority</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-slate-700">{job.description}</p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                <div className="flex items-center">
                  <DollarSign className="w-4 h-4 mr-1" />
                  {job.budget.type === 'fixed'
                    ? `${job.budget.amount} ${job.budget.currency}`
                    : `${job.budget.amount} ${job.budget.currency}/hr`}
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {job.duration}
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {job.proposals?.length || 0} proposals
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {job.skills?.map((s, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {s}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={job.client?.avatar || '/placeholder.svg'} />
                    <AvatarFallback>{job.client?.fullname?.[0] || 'C'}</AvatarFallback>
                  </Avatar>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-800">{job.client?.fullname}</span>
                    {job.client?.verified && <Badge className="bg-green-100 text-green-700 text-xs">Verified</Badge>}
                  </div>
                </div>
                {user && user.role === 'freelancer' ? (
                  <ApplyJobModal
                    job={{
                      _id: job._id,
                      title: job.title,
                      budget: job.budget,
                      duration: job.duration,
                      proposals: job.proposals || [],
                    }}
                    trigger={<Button className="bg-blue-500 hover:bg-blue-600">Submit Proposal</Button>}
                    onSuccess={() => router.push('/jobs')}
                  />
                ) : (
                  <Button disabled className="bg-slate-300 text-slate-500">
                    {user ? 'Freelancers Only' : 'Login to Apply'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6">Not found</CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
