'use client'

import { useEffect, useState } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { usePostJobForm } from "./hooks/usePostJobForm"
import { JobDetailsForm } from "./components/JobDetailsForm"
import { JobConfigurationForm } from "./components/JobConfigurationForm"
import { PostJobActions } from "./components/PostJobActions"
import { PaymentModal } from "./components/PaymentModal"
import { ArrowLeft } from "lucide-react"

export default function Web2PostJobPage() {
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
    validateForm,
  } = usePostJobForm()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDraft, setIsDraft] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paystackReady, setPaystackReady] = useState(false)
  const [paymentId, setPaymentId] = useState<string | null>(null)

  // Load Paystack inline script
  useEffect(() => {
    const id = 'paystack-inline'
    if (typeof window === 'undefined') return
    if (document.getElementById(id)) { setPaystackReady(true); return }
    const s = document.createElement('script')
    s.id = id
    s.src = 'https://js.paystack.co/v1/inline.js'
    s.onload = () => setPaystackReady(true)
    s.onerror = () => setPaystackReady(false)
    document.body.appendChild(s)
  }, [])

  const submitJob = async (asDraft = false) => {
    setIsSubmitting(true)

    if (!user || !user.id) {
      toast.error('Please log in to post a job')
      router.push('/auth/signin/client')
      setIsSubmitting(false)
      return
    }

    if (!asDraft) {
      const errors = validateForm()
      if (errors.length > 0) {
        toast.error(errors[0])
        setIsSubmitting(false)
        return
      }
      setShowPaymentModal(true)
      setIsSubmitting(false)
      return
    }

    await processJobSubmission(true)
  }

  const handlePaymentAndSubmit = async () => {
    setShowPaymentModal(false)

    if (!paystackReady) { toast.error('Paystack failed to load'); return }
    const key = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
    if (!key) { toast.error('Paystack public key not configured'); return }

    const email = user?.email || 'user@example.com'
    const baseFee = 1
    const featuredFee = formData.featured ? 5 : 0
    const totalAmountUsd = baseFee + featuredFee

    try {
      const rate = Number(process.env.NEXT_PUBLIC_USD_NGN_RATE || 1600)
      const ngnKobo = Math.round(Math.max(rate, 1) * totalAmountUsd * 100)

      const handler = (window as any).PaystackPop.setup({
        key,
        email,
        amount: ngnKobo,
        currency: 'NGN',
        metadata: { usd_equivalent: totalAmountUsd, featured_upgrade: formData.featured },
        callback: function (_response: any) {
          ;(async () => {
            let verifiedPaymentId: string | undefined
            try {
              const token = localStorage.getItem('freelancedao_token')
              const verifyRes = await fetch('/api/payments/verify', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  reference: _response?.reference,
                  purpose: formData.featured ? 'job_post_fee_featured' : 'job_post_fee',
                  amountUsd: totalAmountUsd,
                  amountNgn: ngnKobo / 100,
                }),
              })
              const v = await verifyRes.json()
              if (verifyRes.ok) {
                verifiedPaymentId = v.payment.id
                setPaymentId(verifiedPaymentId || null)
                toast.success('Payment successful')
              } else {
                toast.error(v.message || 'Failed to verify payment')
              }
            } catch (err: any) {
              console.error('Verify payment error:', err)
              toast.error('Verification error')
            } finally {
              processJobSubmission(false, verifiedPaymentId)
            }
          })()
        },
        onClose: function () {
          toast.error('Payment canceled')
        },
      })
      handler.openIframe()
    } catch (e: any) {
      toast.error(e?.message || 'Failed to initialize Paystack')
    }
  }

  const processJobSubmission = async (asDraft = false, overridePaymentId?: string) => {
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
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          skills,
          budgetMin: parseFloat(formData.budgetMin),
          budgetMax: formData.budgetMax ? parseFloat(formData.budgetMax) : null,
          currency: 'USD',
          paymentMethod: 'web2',
          paymentId: overridePaymentId || paymentId || undefined,
        }),
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
        {/* Header */}
        <div className="bg-white border-b border-slate-200">
          <div className="container mx-auto px-4 py-6">
            <div className="max-w-4xl mx-auto">
              <button
                onClick={() => router.push('/post-job')}
                className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-4 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back to payment options
              </button>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">Post a Job</h1>
              <p className="text-slate-600">Standard payment via Paystack — pay in USD</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <form
              className="space-y-8"
              onSubmit={(e) => { e.preventDefault(); submitJob(false) }}
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
              <PostJobActions submitJob={submitJob} isSubmitting={isSubmitting} isDraft={isDraft} />
            </form>
          </div>
        </div>
      </div>

      <PaymentModal
        showPaymentModal={showPaymentModal}
        setShowPaymentModal={setShowPaymentModal}
        handlePaymentAndSubmit={handlePaymentAndSubmit}
        isSubmitting={isSubmitting}
        featured={formData.featured}
      />
    </ProtectedRoute>
  )
}
