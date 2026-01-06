"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

interface PaymentItem {
  id: string
  date: string
  payerName: string
  payerEmail: string
  amount: number
  currency: string
  method: string
  purpose: string
  status: string
  for: string
  jobTitle?: string | null
  reference?: string
  channel?: string
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const run = async () => {
      try {
        const token = localStorage.getItem('freelancedao_token')
        const res = await fetch('/api/admin/payments', { headers: { Authorization: `Bearer ${token}` } })
        if (!res.ok) {
          const err = await res.json().catch(() => ({ message: 'Failed to load payments' }))
          toast.error(err.message)
          return
        }
        const data = await res.json()
        setPayments(data.payments || [])
      } catch (e) {
        console.error('Load payments error:', e)
        toast.error('Could not load payments')
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [])

  return (
    <div className="container mx-auto px-2 sm:px-4 py-6 sm:py-8">
      <Card>
        <CardHeader>
          <CardTitle>Payments</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
          ) : (
            <>
              <div className="md:hidden space-y-3">
                {payments.length === 0 ? (
                  <div className="py-6 text-center text-slate-500">No payments found</div>
                ) : (
                  payments.map((p) => (
                    <div key={p.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{p.payerName}</div>
                        <Badge className={p.status === 'success' ? 'bg-green-600' : p.status === 'pending' ? 'bg-yellow-600' : 'bg-red-600'}>{p.status}</Badge>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">{new Date(p.date).toLocaleString()}</div>
                      <div className="mt-2 text-sm">{p.purpose.replace(/_/g, ' ')} • {p.for}</div>
                      <div className="mt-2 text-sm font-semibold text-green-700">{p.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {p.currency}</div>
                      <div className="mt-2 text-xs text-slate-500">{p.method}{p.jobTitle ? ` • ${p.jobTitle}` : ''}</div>
                      {p.reference && <div className="mt-2 text-xs font-mono text-slate-500">Ref: {p.reference}</div>}
                    </div>
                  ))
                )}
              </div>
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left">
                      <th className="py-2 px-3">Date</th>
                      <th className="py-2 px-3">Payer</th>
                      <th className="py-2 px-3">Email</th>
                      <th className="py-2 px-3">Purpose</th>
                      <th className="py-2 px-3">For</th>
                      <th className="py-2 px-3">Amount</th>
                      <th className="py-2 px-3">Currency</th>
                      <th className="py-2 px-3">Method</th>
                      <th className="py-2 px-3">Status</th>
                      <th className="py-2 px-3">Job</th>
                      <th className="py-2 px-3">Reference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p.id} className="border-t">
                        <td className="py-2 px-3">{new Date(p.date).toLocaleString()}</td>
                        <td className="py-2 px-3">{p.payerName}</td>
                        <td className="py-2 px-3">{p.payerEmail}</td>
                        <td className="py-2 px-3">{p.purpose.replace(/_/g, ' ')}</td>
                        <td className="py-2 px-3">{p.for}</td>
                        <td className="py-2 px-3">{p.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="py-2 px-3">{p.currency}</td>
                        <td className="py-2 px-3">{p.method}</td>
                        <td className="py-2 px-3">
                          <Badge className={p.status === 'success' ? 'bg-green-600' : p.status === 'pending' ? 'bg-yellow-600' : 'bg-red-600'}>{p.status}</Badge>
                        </td>
                        <td className="py-2 px-3">{p.jobTitle || '-'}</td>
                        <td className="py-2 px-3">{p.reference || '-'}</td>
                      </tr>
                    ))}
                    {payments.length === 0 && (
                      <tr>
                        <td className="py-6 px-3 text-center text-slate-500" colSpan={11}>No payments found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
