"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import ProfileCompletion from '@/components/profile-completion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { CheckCircle } from 'lucide-react'

export default function ProfileCompletionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [missingFields, setMissingFields] = useState<string[]>([])
  const accountType = searchParams.get('type') as 'freelancer' | 'client'

  useEffect(() => {
    // Get missing fields from URL params or determine based on user type
    const fields = searchParams.get('missing')?.split(',') || []
    setMissingFields(fields)
  }, [searchParams])

  const handleComplete = () => {
    router.push('/onboarding/complete')
  }

  if (!accountType) {
    router.push('/onboarding/account-type')
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">Getting Started</span>
              <span className="text-sm text-slate-500">Step 4 of 5</span>
            </div>
            <Progress value={80} className="h-2" />
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              Complete Your Profile
            </h1>
            <p className="text-slate-600">
              Just a few more details to get you started on the platform
            </p>
          </div>

          <ProfileCompletion
            missingFields={missingFields}
            userType={accountType}
            onComplete={handleComplete}
          />
        </div>
      </div>
    </div>
  )
}