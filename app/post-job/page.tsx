'use client'

import { useEffect, useState } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useWatchContractEvent, useReadContract } from "wagmi"
import escrowContractABI from "@/hedera-frontend-abi/FreeLanceDAOEscrowPayment.json";
import escrowContractDeployment from "@/hedera-deployments/hedera-escrow-testnet.json";
import { usePostJobForm } from "./hooks/usePostJobForm"
import { JobDetailsForm } from "./components/JobDetailsForm"
import { JobConfigurationForm } from "./components/JobConfigurationForm"
import { PostJobActions } from "./components/PostJobActions"
import { PaymentModal } from "./components/PaymentModal"

const HEDERA_TESTNET_CHAIN_ID = 296;

export default function PostJobPage() {
  const { user } = useAuth()
  const router = useRouter()

  const {
    formData,
    skills,
    newSkill,
    setNewSkill,
    handleInputChange,
    addSkill,
    removeSkill,
    validateForm
  } = usePostJobForm();

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDraft, setIsDraft] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("")

  //web3 part
  const { isConnected } = useAccount()
  const contractAddress = escrowContractDeployment.FreeLanceDAOEscrow.evmAddress;
  const contractAbi = escrowContractABI.abi;

  const { writeContract, data: txData, error: writeError, reset } = useWriteContract();
  const txHash = typeof txData === 'object' && txData !== null && 'hash' in txData ? (txData as any).hash : undefined;
  const { } = useWaitForTransactionReceipt({
    hash: txHash,
  });


  useEffect(() => {
    if (writeError) {
      toast.error(writeError.message || "error creating job");
      console.error("error:", writeError);
    }
  }, [writeError])

  useWatchContractEvent({
    address: contractAddress as `0x${string}`,
    abi: contractAbi,
    eventName: "JobCreated",
    chainId: HEDERA_TESTNET_CHAIN_ID,
    onLogs: (logs: any[]) => {
      if (logs && logs.length > 0) {
        toast.success("Job posted successfully!");
        console.log("job posted", logs)
        reset();
        setIsSubmitting(false);
      }
    },
  });


  useReadContract({
    address: contractAddress as `0x${string}`,
    abi: contractAbi,
    functionName: "daoFeePct",
    chainId: HEDERA_TESTNET_CHAIN_ID,
    query: {
      enabled: typeof window !== 'undefined' && !!contractAddress
    }
  });

  const handlePostWeb3Job = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet.");
      console.warn("Wallet not connected");
      return;
    }
    try {
      const params = {
        jobTitle: formData.title,
        jobCategory: formData.category,
        projectDescription: formData.description,
        requiredSkills: skills,
        projectDuration: formData.duration,
        minimumBudget: BigInt(Math.floor(parseFloat(formData.budgetMin) * 1e18)),
        maximumBudget: BigInt(Math.floor(parseFloat(formData.budgetMax) * 1e18))
      };
      
      writeContract({
        address: contractAddress as `0x${string}`,
        abi: contractAbi,
        functionName: "createFixedJob",
        value: BigInt(Number(formData.budgetMax) * 1e18),
        args: [params],
      });

    } catch (err: any) {
      toast.error(err?.message || "Error posting job.");
      console.error("Job posting error:", err);
    }
  }

  const submitJob = async (asDraft = false) => {
    setIsSubmitting(true);
    if (!user || !user.id) {
      toast.error('Please log in to post a job')
      router.push('/auth/signin/client')
      setIsSubmitting(false);
      return
    }

    if (!asDraft) {
      const errors = validateForm()
      if (errors.length > 0) {
        toast.error(errors[0])
        setIsSubmitting(false);
        return
      }

      if (formData.featured) {
        setShowPaymentModal(true)
        setIsSubmitting(false);
        return
      }
    }
    await handlePostWeb3Job();
  }

  const handlePaymentAndSubmit = async () => {
    if (!selectedPaymentMethod) {
      toast.error('Please select a payment method')
      return
    }

    setShowPaymentModal(false)

    toast.success(`Payment method selected: ${selectedPaymentMethod}. Payment processing later.`)

    await processJobSubmission(false)
  }

  const processJobSubmission = async (asDraft = false) => {
    setIsSubmitting(true)
    setIsDraft(asDraft)
    try {
      const token = localStorage.getItem('freelancedao_token')
      if (!token) {
        toast.error('Please log in to post a job')
        router.push('/auth/signin/client')
        return
      }

      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          skills,
          budgetMin: parseFloat(formData.budgetMin),
          budgetMax: formData.budgetMax ? parseFloat(formData.budgetMax) : null
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(asDraft ? 'Job saved as draft' : 'Job posted successfully!')
        router.push('/dashboard')
      } else {
        toast.error(data.message || 'Failed to post job')
      }
    } catch (error) {
      console.error('Error posting job:', error)
      toast.error('An error occurred while posting the job')
    } finally {
      setIsSubmitting(false)
      setIsDraft(false)
    }
  }

  return (
    <ProtectedRoute requireAuth={true} requiredRole="client" requireCompleteProfile={true}>
      <div className="min-h-screen bg-slate-50">
        <div className="bg-white border-b border-slate-200">
          <div className="container mx-auto px-4 py-6">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">Post a Job</h1>
              <p className="text-slate-600">Find the perfect freelancer for your project</p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); submitJob(false); }}>
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
              <PostJobActions submitJob={submitJob} isSubmitting={isSubmitting} isDraft={isDraft} />
            </form>
          </div>
        </div>
      </div>

      <PaymentModal
        showPaymentModal={showPaymentModal}
        setShowPaymentModal={setShowPaymentModal}
        selectedPaymentMethod={selectedPaymentMethod}
        setSelectedPaymentMethod={setSelectedPaymentMethod}
        handlePaymentAndSubmit={handlePaymentAndSubmit}
        isSubmitting={isSubmitting}
      />
    </ProtectedRoute>
  )
}