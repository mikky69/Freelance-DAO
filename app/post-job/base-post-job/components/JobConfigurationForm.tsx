'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Users, Wallet, Clock, Info } from "lucide-react"

export const JobConfigurationForm = ({ formData, handleInputChange }: any) => {
  const deadlineDays = parseInt(formData.deadlineDays) || 14
  const deadlineDate = new Date(Date.now() + deadlineDays * 86400 * 1000).toLocaleDateString('en-US', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
  })

  return (
    <>
      {/* Budget */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Wallet className="w-5 h-5 mr-2 text-emerald-500" />
            Escrow Budget
          </CardTitle>
          <CardDescription>
            This exact amount of ETH will be locked in the smart contract until you confirm delivery
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="budget-eth">Budget Amount (ETH) *</Label>
            <div className="relative">
              <Input
                id="budget-eth"
                type="number"
                step="0.0001"
                min="0.0001"
                value={formData.budgetEth}
                onChange={(e) => handleInputChange('budgetEth', e.target.value)}
                placeholder="e.g. 0.05"
                className="text-base pr-14"
                required
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">ETH</span>
            </div>
            <p className="text-sm text-slate-500">
              Make sure your connected wallet has at least this amount plus gas fees.
            </p>
          </div>

          {/* Escrow info callout */}
          <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
            <Info className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
            <div className="text-sm text-emerald-800 space-y-1">
              <p className="font-medium">How escrow works</p>
              <ul className="space-y-0.5 text-emerald-700 text-xs">
                <li>• Your ETH is locked on-chain when you post the job</li>
                <li>• The freelancer can only withdraw after you confirm delivery</li>
                <li>• A 5% platform fee applies on normal completion (7% if late)</li>
                <li>• Disputes are resolved by the FreelanceDAO</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deadline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2 text-emerald-500" />
            Project Deadline
          </CardTitle>
          <CardDescription>
            The on-chain deadline — after this date the freelancer's delivery is flagged as late
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="deadline-days">Days from today *</Label>
            <div className="relative">
              <Input
                id="deadline-days"
                type="number"
                min="1"
                max="365"
                value={formData.deadlineDays}
                onChange={(e) => handleInputChange('deadlineDays', e.target.value)}
                placeholder="14"
                className="text-base pr-16"
                required
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">days</span>
            </div>
            {deadlineDays > 0 && (
              <p className="text-sm text-slate-500">
                Deadline: <span className="font-medium text-slate-700">{deadlineDate}</span>
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Experience Level */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2 text-emerald-500" />
            Experience Level
          </CardTitle>
          <CardDescription>What level of experience do you need?</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={formData.experienceLevel}
            onValueChange={(value) => handleInputChange('experienceLevel', value)}
            className="space-y-4"
          >
            <div className="flex items-center space-x-2 p-4 border border-slate-200 rounded-lg">
              <RadioGroupItem value="entry" id="entry" />
              <Label htmlFor="entry" className="flex-1 cursor-pointer">
                <div className="font-medium">Entry Level</div>
                <div className="text-sm text-slate-500">New freelancers with basic skills</div>
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-4 border border-slate-200 rounded-lg">
              <RadioGroupItem value="intermediate" id="intermediate" />
              <Label htmlFor="intermediate" className="flex-1 cursor-pointer">
                <div className="font-medium">Intermediate</div>
                <div className="text-sm text-slate-500">Experienced freelancers with proven track record</div>
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-4 border border-slate-200 rounded-lg">
              <RadioGroupItem value="expert" id="expert" />
              <Label htmlFor="expert" className="flex-1 cursor-pointer">
                <div className="font-medium">Expert</div>
                <div className="text-sm text-slate-500">Top-tier freelancers with specialized expertise</div>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>
    </>
  )
}