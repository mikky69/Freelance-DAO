'use client'

import { useEffect } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { parseEther } from "viem"
import EscrowDeployment from "@/base-smart-contracts/deployments/baseSepolia/FreelanceDAOEscrowV2.json"
import { useBasePostJobForm } from "./hooks/useBasePostJobForm"
import { JobDetailsForm } from "./components/JobDetailsForm"
import { JobConfigurationForm } from "./components/JobConfigurationForm"
import { PostJobActions } from "./components/PostJobActions"
import { ArrowLeft, Shield, AlertCircle } from "lucide-react"

const ESCROW_ADDRESS = EscrowDeployment.address as `0x${string}`
const ESCROW_ABI     = EscrowDeployment.abi

export default function BasePostJobPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { address, isConnected } = useAccount()

  const {
    formData,
    skills,
    newSkill,
    setNewSkill,
    handleInputChange,
    addSkill,
    removeSkill,
    validateForm,
    getDeadlineTimestamp,
    getProjectDuration,
    resetForm,
  } = useBasePostJobForm()

  const {
    writeContract,
    data: txHash,
    isPending,
    error: writeError,
    reset: resetTx,
  } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  })

  useEffect(() => {
    if (writeError) {
      toast.error(writeError.message?.slice(0, 120) || "Transaction failed")
      console.error("Contract write error:", writeError)
      resetTx()
    }
  }, [writeError])

  useEffect(() => {
    if (isSuccess && txHash) {
      ;(async () => {
        try {
          const token = localStorage.getItem('freelancedao_token')
          await fetch('/api/jobs', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              title: formData.title,
              description: formData.description,
              category: formData.category,
              skills,
              budgetEth: formData.budgetEth,
              deadlineDays: formData.deadlineDays,
              experienceLevel: formData.experienceLevel,
              currency: 'ETH',
              paymentMethod: 'escrow',
              txHash,
              walletAddress: address,
            }),
          })
        } catch (err) {
          // Non-fatal — job is already on-chain
          console.warn("Failed to save job metadata to backend:", err)
        } finally {
          toast.success("Job posted on-chain successfully!")
          resetForm()
          router.push('/dashboard')
        }
      })()
    }
  }, [isSuccess, txHash])

  const handleSubmit = () => {
    if (!user || !user.id) {
      toast.error('Please log in to post a job')
      router.push('/auth/signin/client')
      return
    }

    if (!isConnected || !address) {
      toast.error('Please connect your wallet to post an escrow job')
      return
    }

    const errors = validateForm()
    if (errors.length > 0) {
      toast.error(errors[0])
      return
    }

    try {
      const budgetWei  = parseEther(formData.budgetEth)
      const deadline   = getDeadlineTimestamp()
      const duration   = getProjectDuration() // e.g. "14 days"

      writeContract({
        address: ESCROW_ADDRESS,
        abi: ESCROW_ABI,
        functionName: "createFixedJob",
        value: budgetWei,
        args: [
          {
            jobTitle:           formData.title,
            jobCategory:        formData.category,
            projectDescription: formData.description,
            requiredSkills:     skills,           // string[]
            projectDuration:    duration,          // string e.g. "14 days"
            minimumBudget:      budgetWei,         // uint256 in Wei
            maximumBudget:      budgetWei,         // same — fixed price job
            deadline,                              // uint256 unix timestamp
          },
        ],
      })
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit transaction")
      console.error("Submit error:", err)
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
              <p className="text-slate-600">Funds are locked on Base blockchain and released when you confirm delivery</p>
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
                    You need a connected wallet to post an escrow job. Connect via the wallet button in the header.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <form
              className="space-y-8"
              onSubmit={(e) => { e.preventDefault(); handleSubmit() }}
            >
              <JobDetailsForm
                formData={formData}
                skills={skills}
                newSkill={newSkill}
                setNewSkill={setNewSkill}
                handleInputChange={handleInputChange}
                addSkill={addSkill}
                removeSkill={removeSkill}
              />
              <JobConfigurationForm formData={formData} handleInputChange={handleInputChange} />
              <PostJobActions
                onSubmit={handleSubmit}
                isSubmitting={false}
                isPending={isPending}
                isConfirming={isConfirming}
                budgetEth={formData.budgetEth}
              />
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}