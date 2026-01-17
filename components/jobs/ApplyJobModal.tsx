"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Loader2, Send } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"

interface Job {
  _id: string
  title: string
  budget: {
    amount: number
    currency: string
    type: "fixed" | "hourly"
  }
  duration: string
  proposals: any[]
}

interface ApplyJobModalProps {
  job: Job
  trigger: React.ReactNode
  onSuccess?: () => void
}

export function ApplyJobModal({ job, trigger, onSuccess }: ApplyJobModalProps) {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [proposalText, setProposalText] = useState("")
  const [proposalBudget, setProposalBudget] = useState("")
  const [proposalTimeline, setProposalTimeline] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const submitProposal = async () => {
    if (!proposalText || !proposalBudget) {
      toast.error("Please fill in all required fields")
      return
    }

    if (!user) {
      toast.error("Please log in to submit a proposal")
      return
    }

    if (user.role !== 'freelancer') {
      toast.error("Only freelancers can submit proposals")
      return
    }

    setIsSubmitting(true)

    try {
      const token = localStorage.getItem('freelancedao_token')
      if (!token) {
        toast.error('Please log in to submit a proposal')
        return
      }

      const response = await fetch('/api/proposals', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jobId: job._id,
          title: `Proposal for ${job.title}`,
          description: proposalText,
          budget: {
            amount: parseFloat(proposalBudget),
            currency: job.budget.currency
          },
          timeline: proposalTimeline || 'As discussed',
          milestones: []
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to submit proposal')
      }

      toast.success("Proposal submitted successfully!")
      
      // Reset form
      setProposalText("")
      setProposalBudget("")
      setProposalTimeline("")
      setIsOpen(false)
      
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error('Error submitting proposal:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to submit proposal')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Submit Proposal</DialogTitle>
          <DialogDescription>Submit your proposal for "{job.title}"</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Job Summary */}
          <div className="bg-slate-50 p-4 rounded-lg">
            <h4 className="font-medium text-slate-800 mb-2">{job.title}</h4>
            <div className="flex items-center space-x-4 text-sm text-slate-600">
              <span>Budget: {job.budget.amount} {job.budget.currency}</span>
              <span>Duration: {job.duration}</span>
              <span>{job.proposals?.length || 0} proposals</span>
            </div>
          </div>

          {/* Proposal Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="proposal">Cover Letter *</Label>
              <Textarea
                id="proposal"
                placeholder="Explain why you're the best fit for this project..."
                value={proposalText}
                onChange={(e) => setProposalText(e.target.value)}
                rows={6}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="budget">Your Bid ({job.budget.currency}) *</Label>
                <Input
                  id="budget"
                  type="number"
                  placeholder="Enter your bid"
                  value={proposalBudget}
                  onChange={(e) => setProposalBudget(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="timeline">Timeline</Label>
                <Input
                  id="timeline"
                  placeholder="e.g., 2 weeks"
                  value={proposalTimeline}
                  onChange={(e) => setProposalTimeline(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsOpen(false)
                  setProposalText("")
                  setProposalBudget("")
                  setProposalTimeline("")
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={submitProposal}
                disabled={isSubmitting || !proposalText || !proposalBudget}
                className="bg-blue-500 hover:bg-blue-600"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Proposal
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
