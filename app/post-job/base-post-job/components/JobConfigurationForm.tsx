'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Users, Wallet, Clock, Info, Layers, Plus, Trash2, AlertCircle } from "lucide-react"
import type { JobType, Milestone } from "../hooks/useBasePostJobForm"

interface Props {
  formData: any
  handleInputChange: (field: string, value: any) => void
  jobType: JobType
  setJobType: (t: JobType) => void
  milestones: Milestone[]
  addMilestone: () => void
  removeMilestone: (i: number) => void
  updateMilestone: (i: number, field: keyof Milestone, value: string) => void
  milestoneTotalEth: number
}

export const JobConfigurationForm = ({
  formData,
  handleInputChange,
  jobType,
  setJobType,
  milestones,
  addMilestone,
  removeMilestone,
  updateMilestone,
  milestoneTotalEth,
}: Props) => {
  const deadlineDays = parseInt(formData.deadlineDays) || 14
  const deadlineDate = new Date(Date.now() + deadlineDays * 86400 * 1000).toLocaleDateString(
    "en-US",
    { weekday: "short", year: "numeric", month: "short", day: "numeric" }
  )

  return (
    <>
      {/* ── Job Type Toggle ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Layers className="w-5 h-5 mr-2 text-emerald-500" />
            Payment Structure
          </CardTitle>
          <CardDescription>
            Choose how you want to pay for this job
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Fixed */}
            <button
              type="button"
              onClick={() => setJobType("fixed")}
              className={`text-left p-4 rounded-xl border-2 transition-all ${
                jobType === "fixed"
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Wallet className={`w-5 h-5 ${jobType === "fixed" ? "text-emerald-600" : "text-slate-400"}`} />
                <span className="font-semibold text-slate-800">Fixed Price</span>
                {jobType === "fixed" && (
                  <span className="ml-auto text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Selected</span>
                )}
              </div>
              <p className="text-sm text-slate-500">
                One lump-sum locked in escrow. Released when you confirm delivery.
              </p>
            </button>

            {/* Milestone */}
            <button
              type="button"
              onClick={() => setJobType("milestone")}
              className={`text-left p-4 rounded-xl border-2 transition-all ${
                jobType === "milestone"
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Layers className={`w-5 h-5 ${jobType === "milestone" ? "text-emerald-600" : "text-slate-400"}`} />
                <span className="font-semibold text-slate-800">Milestone</span>
                {jobType === "milestone" && (
                  <span className="ml-auto text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Selected</span>
                )}
              </div>
              <p className="text-sm text-slate-500">
                Split into stages. Each milestone is paid out as work is approved.
              </p>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* ── Fixed Budget Card ── */}
      {jobType === "fixed" && (
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
                  onChange={(e) => handleInputChange("budgetEth", e.target.value)}
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
            <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
              <Info className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
              <div className="text-sm text-emerald-800 space-y-0.5">
                <p className="font-medium">How escrow works</p>
                <ul className="space-y-0.5 text-emerald-700 text-xs">
                  <li>• Your ETH is locked on-chain when you post the job</li>
                  <li>• The freelancer can only withdraw after you confirm delivery</li>
                  <li>• A 5% platform fee applies (7% if late)</li>
                  <li>• Disputes resolved by the FreelanceDAO</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Milestone Cards ── */}
      {jobType === "milestone" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Layers className="w-5 h-5 mr-2 text-emerald-500" />
              Milestones
            </CardTitle>
            <CardDescription>
              Break the project into stages. Each milestone ETH amount is locked and released separately.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {milestones.map((m, i) => (
              <div key={i} className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700">Milestone {i + 1}</span>
                  {milestones.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMilestone(i)}
                      className="text-red-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Deliverable name *</Label>
                    <Input
                      value={m.name}
                      onChange={(e) => updateMilestone(i, "name", e.target.value)}
                      placeholder="e.g. Design mockups"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Amount (ETH) *</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        step="0.0001"
                        min="0.0001"
                        value={m.amount}
                        onChange={(e) => updateMilestone(i, "amount", e.target.value)}
                        placeholder="0.01"
                        className="pr-12"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">ETH</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Description</Label>
                  <Textarea
                    value={m.description}
                    onChange={(e) => updateMilestone(i, "description", e.target.value)}
                    placeholder="What will be delivered in this milestone?"
                    rows={2}
                    className="text-sm"
                  />
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={addMilestone}
              className="w-full border-dashed border-emerald-300 text-emerald-600 hover:bg-emerald-50"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Milestone
            </Button>

            {/* Total summary */}
            {milestoneTotalEth > 0 && (
              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3">
                <span className="text-sm font-medium text-emerald-800">Total to lock in escrow:</span>
                <span className="text-base font-bold text-emerald-700">{milestoneTotalEth.toFixed(6)} ETH</span>
              </div>
            )}

            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
              <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-800">
                The total ETH across all milestones will be locked on-chain at posting time. Each milestone is released independently as you approve delivery.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Deadline ── */}
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
                onChange={(e) => handleInputChange("deadlineDays", e.target.value)}
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

      {/* ── Experience Level ── */}
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
            onValueChange={(value) => handleInputChange("experienceLevel", value)}
            className="space-y-4"
          >
            {[
              { value: "entry", label: "Entry Level", desc: "New freelancers with basic skills" },
              { value: "intermediate", label: "Intermediate", desc: "Experienced freelancers with proven track record" },
              { value: "expert", label: "Expert", desc: "Top-tier freelancers with specialized expertise" },
            ].map((opt) => (
              <div key={opt.value} className="flex items-center space-x-2 p-4 border border-slate-200 rounded-lg">
                <RadioGroupItem value={opt.value} id={opt.value} />
                <Label htmlFor={opt.value} className="flex-1 cursor-pointer">
                  <div className="font-medium">{opt.label}</div>
                  <div className="text-sm text-slate-500">{opt.desc}</div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>
    </>
  )
}