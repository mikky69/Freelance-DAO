'use client'

import { useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { CreditCard, Shield, ArrowRight, Zap, Lock } from "lucide-react"

export default function PostJobChoicePage() {
  const router = useRouter()

  return (
    <ProtectedRoute requireAuth={true} requiredRole="client" requireCompleteProfile={true}>
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <div className="bg-white border-b border-slate-200">
          <div className="container mx-auto px-4 py-6">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">Post a Job</h1>
              <p className="text-slate-600">Choose how you want to hire and pay your freelancer</p>
            </div>
          </div>
        </div>

        {/* Choice Cards */}
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Web2 / Paystack */}
            <button
              onClick={() => router.push('/post-job/web2-post-job')}
              className="group text-left bg-white border border-slate-200 rounded-2xl p-8 hover:border-blue-400 hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-5 group-hover:bg-blue-500 transition-colors duration-200">
                <CreditCard className="w-6 h-6 text-blue-500 group-hover:text-white transition-colors duration-200" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Standard Payment</h2>
              <p className="text-slate-500 text-sm mb-5 leading-relaxed">
                Post your job and pay freelancers using traditional payment methods via Paystack.
              </p>
              <ul className="space-y-2 mb-6">
                {["Pay in USD via card or bank transfer", "Managed via FreelanceDAO platform", "$1 job posting fee"].map(item => (
                  <li key={item} className="flex items-center gap-2 text-sm text-slate-600">
                    <Zap className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="flex items-center text-blue-500 font-medium text-sm group-hover:gap-2 transition-all">
                Get started <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </button>

            {/* Base Escrow */}
            <button
              onClick={() => router.push('/post-job/base-post-job')}
              className="group text-left bg-white border border-slate-200 rounded-2xl p-8 hover:border-emerald-400 hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-5 group-hover:bg-emerald-500 transition-colors duration-200">
                <Shield className="w-6 h-6 text-emerald-500 group-hover:text-white transition-colors duration-200" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Escrow Smart Contract</h2>
              <p className="text-slate-500 text-sm mb-5 leading-relaxed">
                Lock funds in a trustless smart contract on Base. Freelancer gets paid automatically on completion.
              </p>
              <ul className="space-y-2 mb-6">
                {["Pay in ETH via your connected wallet", "Funds locked on-chain until confirmed", "Dispute resolution via DAO"].map(item => (
                  <li key={item} className="flex items-center gap-2 text-sm text-slate-600">
                    <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="flex items-center text-emerald-500 font-medium text-sm">
                Get started <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </button>

          </div>

          <p className="text-center text-xs text-slate-400 mt-8">
            Not sure which to choose?{" "}
            <a href="/docs/payment-methods" className="text-blue-500 hover:underline">
              Learn about the differences
            </a>
          </p>
        </div>
      </div>
    </ProtectedRoute>
  )
}
