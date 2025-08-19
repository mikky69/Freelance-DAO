"use client"

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Users, AlertCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface EmptyProfileStateProps {
  userType: 'freelancer' | 'client'
  context: 'search' | 'browse' | 'dashboard'
}

export default function EmptyProfileState({ userType, context }: EmptyProfileStateProps) {
  const messages = {
    freelancer: {
      search: "No freelancers found matching your criteria",
      browse: "No freelancers available at the moment",
      dashboard: "Complete your profile to start finding work"
    },
    client: {
      search: "No clients found matching your criteria", 
      browse: "No clients available at the moment",
      dashboard: "Complete your profile to start hiring talent"
    }
  }

  const suggestions = {
    freelancer: {
      search: "Try adjusting your search filters or check back later",
      browse: "New freelancers join daily. Check back soon!",
      dashboard: "A complete profile helps you get discovered by clients"
    },
    client: {
      search: "Try adjusting your search filters or check back later",
      browse: "New clients join daily. Check back soon!", 
      dashboard: "A complete profile helps you attract top freelancers"
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="text-center p-8">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-slate-400" />
        </div>
        
        <h3 className="text-lg font-semibold text-slate-800 mb-2">
          {messages[userType][context]}
        </h3>
        
        <p className="text-slate-600 mb-6">
          {suggestions[userType][context]}
        </p>
        
        {context === 'dashboard' && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Complete your profile to unlock all platform features
            </AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-3">
          {context === 'dashboard' ? (
            <Link href="/profile">
              <Button className="w-full">
                Complete Profile
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          ) : (
            <Link href={userType === 'freelancer' ? '/freelancers' : '/jobs'}>
              <Button variant="outline" className="w-full">
                Browse All {userType === 'freelancer' ? 'Freelancers' : 'Jobs'}
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  )
}