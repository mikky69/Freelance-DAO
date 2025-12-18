"use client"

import type React from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Shield,
  Users,
  Briefcase,
  DollarSign,
  BarChart3,
  Settings,
  Bell,
  LogOut,
  AlertTriangle,
  Menu,
  LayoutDashboard,
  FileText,
  MessageSquare
} from "lucide-react"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import Link from "next/link"
import { ProtectedRoute } from "@/components/protected-route"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { signOut } = useAuth()
  return (
    <ProtectedRoute requireAuth={true} requiredRole="admin" redirectTo="/auth/signin/admin">
      <div className="flex h-screen bg-[#0f111a] text-slate-300 font-sans">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-64 bg-[#0B0E14] border-r border-[#1e293b]">
          <div className="p-6 flex items-center gap-3">
            <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-white animate-spin-slow" />
            </div>
            <span className="text-xl font-bold text-white tracking-wide">Admin</span>
          </div>

          <nav className="flex-1 px-4 space-y-2 mt-4">
            <Link href="/admin/disputes" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-white hover:bg-[#1e293b] transition-all">
              <FileText className="w-5 h-5" />
              <span>Disputes</span>
            </Link>
            <Link href="/admin/users" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-white hover:bg-[#1e293b] transition-all">
              <Users className="w-5 h-5" />
              <span>Users</span>
            </Link>
            <Link href="/admin/jobs" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-white hover:bg-[#1e293b] transition-all">
              <BarChart3 className="w-5 h-5" />
              <span>Jobs</span>
            </Link>
            <Link href="/admin/payments" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-white hover:bg-[#1e293b] transition-all">
              <DollarSign className="w-5 h-5" />
              <span>Payments</span>
            </Link>
            <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#1e293b] text-cyan-400 font-medium transition-all">
              <LayoutDashboard className="w-5 h-5" />
              <span>Analytics</span>
            </Link>
          </nav>

          <div className="p-4 border-t border-[#1e293b] space-y-2">
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-white hover:bg-[#1e293b] cursor-pointer transition-all">
                <Link href="/admin/feedbacks" className="flex items-center gap-3 px-4 py-2 hover:text-white">
              <FileText className="w-5 h-5" />
              <span>Feedbacks</span>
              </Link>
            </div>
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-white hover:bg-[#1e293b] cursor-pointer transition-all"
              onClick={() => signOut()}
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </div>
          </div>
        </aside>

        {/* Mobile Header */}
        <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#0B0E14] border-b border-[#1e293b] p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">Admin</span>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white">
                <Menu className="w-6 h-6" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#1e293b] border-[#2e3b4e] text-slate-300">
              <nav className="space-y-4 mt-8">
                <Link href="/admin/disputes" className="flex items-center gap-3 px-4 py-2 hover:text-white">Disputes</Link>
                <Link href="/admin/users" className="flex items-center gap-3 px-4 py-2 hover:text-white">Users</Link>
                <Link href="/admin/jobs" className="flex items-center gap-3 px-4 py-2 hover:text-white">Jobs</Link>
                <Link href="/admin/payments" className="flex items-center gap-3 px-4 py-2 hover:text-white">Payments</Link>
                <Link href="/admin/feedbacks" className="flex items-center gap-3 px-4 py-2 hover:text-white">Feedbacks</Link>
                <Link href="/admin" className="flex items-center gap-3 px-4 py-2 text-cyan-400">Analytics</Link>
              </nav>
            </DialogContent>
          </Dialog>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
          <div className="p-8">
            {/* Note: Header is visually part of the dashboard page in the mockup, but we can put a common header here if needed. 
                 For now, relying on the page to render the "Analytics" title to match mockup exactly. */}

            {/* Alert Banner for Critical Issues (Styled Dark) */}
            {/* <div className="mb-6 bg-red-900/20 border border-red-900/50 rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-red-400">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">5 disputes require immediate attention</span>
              </div>
              <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-900/30">
                View All
              </Button>
            </div> */}

            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
