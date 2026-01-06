"use client"

import type React from "react"
import { useState } from "react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Bot, CheckCircle, Zap, Wallet, ArrowRight, AlertCircle } from "lucide-react"
import { toast } from "sonner"

import { MultiWalletConnect } from "@/components/multi-wallet-connect"
import type { HederaAccount } from "@/lib/hedera-wallet"

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

interface AIAgent {
  id: string
  name: string
  avatar?: string
  pricing?: {
    amount: number
    currency: string
    type: "hourly" | "fixed" | "per_task"
  }
  capabilities?: string[]
  description: string
}

interface HireAgentModalProps {
  agent: AIAgent | null
  trigger?: React.ReactNode
}

/* -------------------------------------------------------------------------- */
/*                          HireAgentModal Component                          */
/* -------------------------------------------------------------------------- */

export function HireAgentModal({ agent, trigger }: HireAgentModalProps) {
  /* ------------------------------ Local state --------------------------- */
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState(1)
  const [taskTitle, setTaskTitle] = useState("")
  const [taskDescription, setTaskDescription] = useState("")
  const [budget, setBudget] = useState("")
  const [deadline, setDeadline] = useState("")
  const [priority, setPriority] = useState<"" | "low" | "medium" | "high">("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [connectedAccount, setConnectedAccount] = useState<HederaAccount | null>(null)

  /* ---------------------------------------------------------------------- */
  /* Early exit if the agent isn't provided                                 */
  /* ---------------------------------------------------------------------- */
  if (!agent) return null

  /* --------------------------- Wallet callback -------------------------- */
  const handleConnectionChange = (connected: boolean, account?: HederaAccount) => {
    setConnectedAccount(connected && account ? account : null)
  }

  /* ------------------------------ Helpers ------------------------------- */
  const defaultPricing = { amount: 50, currency: "HBAR", type: "hourly" as const }
  const agentPricing = agent.pricing ?? defaultPricing
  const agentCapabilities = agent.capabilities ?? []

  const estimatedCost = budget ? Number.parseFloat(budget) : agentPricing.amount
  const platformFee = estimatedCost * 0.05
  const totalCost = estimatedCost + platformFee

  /* ----------------------------- Submission ----------------------------- */
  const handleSubmit = async () => {
    if (!taskTitle || !taskDescription || !budget || !deadline) {
      toast.error("Please fill in all required fields")
      return
    }
    if (!connectedAccount) {
      toast.error("Please connect your wallet to proceed")
      return
    }

    setIsSubmitting(true)
    try {
      await new Promise((res) => setTimeout(res, 2000)) // simulate API / contract
      toast.success(`Successfully hired ${agent.name}!`)
      setIsOpen(false)
      setStep(1)
      setTaskTitle("")
      setTaskDescription("")
      setBudget("")
      setDeadline("")
      setPriority("")
    } catch (err) {
      toast.error("Failed to create contract. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  /* -------------------------------- Render ------------------------------ */
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-blue-500 hover:bg-blue-600">
            <Bot className="w-4 h-4 mr-2" />
            Hire Agent
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Bot className="w-5 h-5 text-blue-500" />
            <span>Hire {agent.name}</span>
          </DialogTitle>
          <DialogDescription>Set up your project requirements and create a smart contract</DialogDescription>
        </DialogHeader>

        {/* ------------------------------ Steps ----------------------------- */}
        <StepIndicator current={step} total={3} />

        {/* ------------------------- Step content -------------------------- */}
        {step === 1 && (
          <ProjectDetailsStep
            taskTitle={taskTitle}
            setTaskTitle={setTaskTitle}
            taskDescription={taskDescription}
            setTaskDescription={setTaskDescription}
            budget={budget}
            setBudget={setBudget}
            deadline={deadline}
            setDeadline={setDeadline}
            priority={priority}
            setPriority={setPriority}
            capabilities={agentCapabilities}
          />
        )}

        {step === 2 && (
          <WalletConnectStep connectedAccount={connectedAccount} handleConnectionChange={handleConnectionChange} />
        )}

        {step === 3 && (
          <ReviewStep
            agent={agent}
            connectedAccount={connectedAccount}
            taskTitle={taskTitle}
            budget={budget}
            deadline={deadline}
            priority={priority}
            platformFee={platformFee}
            totalCost={totalCost}
          />
        )}

        {/* --------------------------- Navigation -------------------------- */}
        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}>
            Previous
          </Button>

          {step < 3 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={
                (step === 1 && (!taskTitle || !taskDescription || !budget || !deadline)) ||
                (step === 2 && !connectedAccount)
              }
              className="bg-blue-500 hover:bg-blue-600"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !connectedAccount}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Creating Contract...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Confirm & Fund Escrow
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* -------------------------------------------------------------------------- */
/*                         Sub-components & Helpers                           */
/* -------------------------------------------------------------------------- */

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center space-x-4 mb-6">
      {Array.from({ length: total }, (_, i) => i + 1).map((num) => (
        <div key={num} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              current >= num ? "bg-blue-500 text-white" : "bg-slate-200 text-slate-600"
            }`}
          >
            {num}
          </div>
          {num < total && <div className={`w-12 h-0.5 mx-2 ${current > num ? "bg-blue-500" : "bg-slate-200"}`} />}
        </div>
      ))}
    </div>
  )
}

/* --------------------------- Step 1 component ----------------------------- */
function ProjectDetailsStep(props: {
  taskTitle: string
  setTaskTitle: (v: string) => void
  taskDescription: string
  setTaskDescription: (v: string) => void
  budget: string
  setBudget: (v: string) => void
  deadline: string
  setDeadline: (v: string) => void
  priority: "" | "low" | "medium" | "high"
  setPriority: (v: any) => void
  capabilities: string[]
}) {
  const {
    taskTitle,
    setTaskTitle,
    taskDescription,
    setTaskDescription,
    budget,
    setBudget,
    deadline,
    setDeadline,
    priority,
    setPriority,
    capabilities,
  } = props
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Project Details</h3>
      <Field label="Task Title *" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} />
      <Field
        label="Task Description *"
        asTextarea
        value={taskDescription}
        onChange={(e) => setTaskDescription(e.target.value)}
      />
      <div className="grid grid-cols-2 gap-4">
        <Field label="Budget (HBAR) *" type="number" value={budget} onChange={(e) => setBudget(e.target.value)} />
        <Field label="Deadline *" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label>Priority Level</Label>
        <Select value={priority} onValueChange={setPriority}>
          <SelectTrigger>
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {capabilities.length > 0 && (
        <div className="space-y-2">
          <Label>Agent Capabilities</Label>
          <div className="flex flex-wrap gap-2">
            {capabilities.map((cap) => (
              <Badge key={cap} variant="secondary">
                {cap}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* --------------------------- Step 2 component ----------------------------- */
function WalletConnectStep({
  connectedAccount,
  handleConnectionChange,
}: {
  connectedAccount: HederaAccount | null
  handleConnectionChange: (connected: boolean, account?: HederaAccount) => void
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Connect Wallet</h3>
      <p className="text-slate-600">Connect your Hedera wallet to create the smart contract and fund the escrow.</p>
      <MultiWalletConnect onConnectionChange={handleConnectionChange} />
      {connectedAccount && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-800">
            Wallet connected! You can proceed to review and confirm.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

/* --------------------------- Step 3 component ----------------------------- */
function ReviewStep(props: {
  agent: AIAgent
  connectedAccount: HederaAccount | null
  taskTitle: string
  budget: string
  deadline: string
  priority: "" | "low" | "medium" | "high"
  platformFee: number
  totalCost: number
}) {
  const { agent, connectedAccount, taskTitle, budget, deadline, priority, platformFee, totalCost } = props
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Review & Confirm</h3>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contract Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Row label="Task" value={taskTitle} />
          <Row label="Agent" value={agent.name} />
          <Row label="Budget" value={`${budget} HBAR`} />
          <Row label="Platform Fee (5%)" value={`${platformFee.toFixed(2)} HBAR`} />
          <Separator />
          <Row label="Total Cost" value={`${totalCost.toFixed(2)} HBAR`} bold valueClass="text-green-700" />
          <Row label="Deadline" value={deadline} />
          {priority && (
            <Row
              label="Priority"
              value={
                <Badge
                  className={
                    priority === "high"
                      ? "bg-red-100 text-red-700"
                      : priority === "medium"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                  }
                >
                  {priority}
                </Badge>
              }
            />
          )}
        </CardContent>
      </Card>

      <Alert className="border-amber-200 bg-amber-50">
        <AlertCircle className="w-4 h-4 text-amber-600" />
        <AlertDescription>
          Payment is held in escrow until you approve the completed work. You may request revisions within 48 h of
          delivery or receive a refund if the agent fails to deliver.
        </AlertDescription>
      </Alert>

      {connectedAccount && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Wallet className="w-4 h-4 text-green-600" />
              <span className="font-medium text-green-800">Payment Wallet</span>
            </div>
            <div className="text-sm text-green-700">
              <div>Account: {connectedAccount.accountId}</div>
              <div>Balance: {connectedAccount.balance} HBAR</div>
              <div>Network: {connectedAccount.network}</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

/* ----------------------------- UI helpers -------------------------------- */
function Field({
  label,
  asTextarea = false,
  ...props
}: {
  label: string
  asTextarea?: boolean
} & React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {asTextarea ? <Textarea {...(props as any)} rows={4} /> : <Input {...props} />}
    </div>
  )
}

function Row({
  label,
  value,
  bold,
  valueClass = "",
}: {
  label: string
  value: React.ReactNode
  bold?: boolean
  valueClass?: string
}) {
  return (
    <div className="flex justify-between">
      <span className={bold ? "font-semibold" : "text-slate-600"}>{label}:</span>
      <span className={`${bold ? "font-bold" : "font-medium"} ${valueClass}`}>{value}</span>
    </div>
  )
}
