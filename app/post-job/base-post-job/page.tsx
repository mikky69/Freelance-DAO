'use client'

import { useEffect } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { parseEther } from "viem"
import EscrowDeployment from "@/base-smart-contracts/deployments/baseSepolia/FreelanceDAOEscrowV2.json"
import { useBasePostJobForm } from "./hooks/useBasePostJobForm"
import { JobDetailsForm } from "./components/JobDetailsForm"
import { JobConfigurationForm } from "./components/JobConfigurationForm"
import { PostJobActions } from "./components/PostJobActions"
import { txSubmittedToast, txSuccessToast, txErrorToast } from "@/components/tx-toast"
import { ArrowLeft, Shield, AlertCircle } from "lucide-react"

const ESCROW_ADDRESS = EscrowDeployment.address as `0x${string}`
const ESCROW_ABI     = EscrowDeployment.abi

export default function BasePostJobPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { address, isConnected } = useAccount()

  const {
    formData, skills, newSkill, setNewSkill,
    handleInputChange, addSkill, removeSkill,
    jobType, setJobType,
    milestones, addMilestone, removeMilestone, updateMilestone, milestoneTotalEth,
    validateForm, getDeadlineTimestamp, getProjectDuration, resetForm,
  } = useBasePostJobForm()

  const {
    writeContract, data: txHash, isPending,
    error: writeError, reset: resetTx,
  } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash })

  useEffect(() => {
    if (txHash) txSubmittedToast(txHash, "Job posting")
  }, [txHash])

  useEffect(() => {
    if (writeError) {
      txErrorToast(writeError.message?.slice(0, 120) || "Transaction failed")
      resetTx()
    }
  }, [writeError, resetTx])

  useEffect(() => {
    if (isSuccess && txHash) {
      txSuccessToast(txHash, "Job posted")
      ;(async () => {
        try {
          const token = localStorage.getItem('freelancedao_token')
          await fetch('/api/jobs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              title: formData.title,
              description: formData.description,
              category: formData.category,
              skills,
              budgetEth: jobType === "milestone"
                ? milestoneTotalEth.toString()
                : formData.budgetEth,
              deadlineDays: formData.deadlineDays,
              experienceLevel: formData.experienceLevel,
              currency: 'ETH',
              paymentMethod: jobType === "milestone" ? 'milestone_escrow' : 'escrow',
              jobType,
              milestones: jobType === "milestone" ? milestones : undefined,
              txHash,
              walletAddress: address,
            }),
          })
        } catch (err) {
          console.warn("Failed to save job metadata:", err)
        } finally {
          resetForm()
          router.push('/dashboard')
        }
      })()
    }
  }, [isSuccess, txHash, address, formData.budgetEth, formData.category, formData.deadlineDays, formData.description, formData.experienceLevel, formData.title, jobType, milestoneTotalEth, milestones, resetForm, router, skills])

  const handleSubmit = () => {
    if (!user?.id) { router.push('/auth/signin/client'); return }
    if (!isConnected || !address) { txErrorToast("Please connect your wallet first"); return }

    const errors = validateForm()
    if (errors.length > 0) { txErrorToast(errors[0]); return }

    try {
      const deadline = getDeadlineTimestamp()
      const duration = getProjectDuration()

      if (jobType === "fixed") {
        const budgetWei = parseEther(formData.budgetEth)
        writeContract({
          address: ESCROW_ADDRESS,
          abi: ESCROW_ABI,
          functionName: "createFixedJob",
          value: budgetWei,
          args: [{
            jobTitle:           formData.title,
            jobCategory:        formData.category,
            projectDescription: formData.description,
            requiredSkills:     skills,
            projectDuration:    duration,
            minimumBudget:      budgetWei,
            maximumBudget:      budgetWei,
            deadline,
          }],
        })
      } else {
        // milestoneAmounts is FIRST, JobParams struct is SECOND (per ABI)
        const totalWei = parseEther(milestoneTotalEth.toFixed(18))
        const milestoneAmounts = milestones.map(m => parseEther(m.amount || "0"))

        writeContract({
          address: ESCROW_ADDRESS,
          abi: ESCROW_ABI,
          functionName: "createMilestoneJob",
          value: totalWei,
          args: [
            milestoneAmounts,   // uint256[] — first
            {                   // JobParams struct — second
              jobTitle:           formData.title,
              jobCategory:        formData.category,
              projectDescription: formData.description,
              requiredSkills:     skills,
              projectDuration:    duration,
              minimumBudget:      totalWei,
              maximumBudget:      totalWei,
              deadline,
            },
          ],
        })
      }
    } catch (err: any) {
      txErrorToast(err?.message || "Failed to submit transaction")
    }
  }

  return (
    <ProtectedRoute requireAuth={true} requiredRole="client" requireCompleteProfile={true}>
      <div className="min-h-screen bg-slate-50">
        <div className="bg-white border-b border-slate-200">
          <div className="container mx-auto px-4 py-6">
            <div className="max-w-4xl mx-auto">
              <button
                onClick={() => router.push('/post-job')}
                className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-4 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back to payment options
              </button>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-emerald-600" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Post a Job — Escrow</h1>
              </div>
              <p className="text-slate-600">
                Funds are locked on Base blockchain and released when you confirm delivery
              </p>
            </div>
          </div>
        </div>

        {!isConnected && (
          <div className="container mx-auto px-4 pt-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-lg p-4">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-800">Wallet not connected</p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    Connect via the wallet button in the header to post an escrow job.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); handleSubmit() }}>
              <JobDetailsForm
                formData={formData}
                skills={skills}
                newSkill={newSkill}
                setNewSkill={setNewSkill}
                handleInputChange={handleInputChange}
                addSkill={addSkill}
                removeSkill={removeSkill}
              />
              <JobConfigurationForm
                formData={formData}
                handleInputChange={handleInputChange}
                jobType={jobType}
                setJobType={setJobType}
                milestones={milestones}
                addMilestone={addMilestone}
                removeMilestone={removeMilestone}
                updateMilestone={updateMilestone}
                milestoneTotalEth={milestoneTotalEth}
              />
              <PostJobActions
                onSubmit={handleSubmit}
                isSubmitting={false}
                isPending={isPending}
                isConfirming={isConfirming}
                budgetEth={formData.budgetEth}
                jobType={jobType}
                milestoneTotalEth={milestoneTotalEth}
              />
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}