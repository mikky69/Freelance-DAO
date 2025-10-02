"use client"

import type React from "react"
import { Inter } from "next/font/google"
import { usePathname } from "next/navigation"
import "./globals.css"
import { TopNavigation, BottomNavigation } from "@/components/navigation"
import { AuthProvider } from "@/lib/auth-context"
import { ContractNotification } from "@/components/contract-notification"
import { Toaster } from "sonner"
import { Twitter, BookText } from "lucide-react";
import Image from "next/image"
import RainbowkitHederaProvider from "@/RainbowkitHederaProvider"

const inter = Inter({ subsets: ["latin"] })


export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-[#1D0225] via-[#2A0632] to-[#1D0225] text-white py-16 mt-0 relative">
      <div className="container mx-auto px-6">
        <div className="grid gap-10 md:grid-cols-4">
          {/* Brand Section */}
          <div>
            <div className="flex items-center space-x-3 mb-5">
              <Image
                src="/images/freelancedao-logo.png"
                alt="FreeLanceDAO"
                width={42}
                height={42}
                className="rounded-lg shadow-md"
              />
              <div>
                <span className="text-xl font-bold tracking-wide">FreeLanceDAO</span>
                <div className="text-xs text-slate-400">
                  Decentralized Freelancing
                </div>
              </div>
            </div>
            <p className="text-slate-400 leading-relaxed text-sm">
              The decentralized freelance platform combining Web2 usability with
              Web3 security. Join us in shaping the future of work.
            </p>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="font-semibold mb-4 text-lg">Platform</h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <a
                  href="/jobs"
                  className="hover:text-[#FA5F04] transition-colors duration-200"
                >
                  Find Work
                </a>
              </li>
              <li>
                <a
                  href="/freelancers"
                  className="hover:text-[#FA5F04] transition-colors duration-200"
                >
                  Find Talent
                </a>
              </li>
              <li>
                <a
                  href="/post-job"
                  className="hover:text-[#FA5F04] transition-colors duration-200"
                >
                  Post Job
                </a>
              </li>
            </ul>
          </div>

          {/* Community Links */}
          <div>
            <h4 className="font-semibold mb-4 text-lg">Community</h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <a
                  href="https://x.com/Freelance_DAO"
                  className="flex items-center gap-2 hover:text-[#FA5F04] transition-colors duration-200"
                >
                  <Twitter className="w-4 h-4" /> Twitter/X
                </a>
              </li>
              
              <li>
                <a
                  href="https://medium.com/@freelancedao"
                  className="flex items-center gap-2 hover:text-[#FA5F04] transition-colors duration-200"
                >
                  <BookText className="w-4 h-4" /> Medium
                </a>
              </li>
            </ul>
          </div>

          {/* Governance Links */}
          <div>
            <h4 className="font-semibold mb-4 text-lg">Governance</h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <a
                  href="/dao"
                  className="hover:text-[#FA5F04] transition-colors duration-200"
                >
                  Join DAO
                </a>
              </li>
              <li>
                <a
                  href="/proposals"
                  className="hover:text-[#FA5F04] transition-colors duration-200"
                >
                  Proposals
                </a>
              </li>
              <li>
                <a
                  href="/governance"
                  className="hover:text-[#FA5F04] transition-colors duration-200"
                >
                  Governance
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-white/10 mt-10 pt-6 text-center">
          <div className="flex items-center justify-center gap-3">
            <Image
              src="/images/freelancedao-logo.png"
              alt="FreeLanceDAO"
              width={24}
              height={24}
              className="rounded opacity-80"
            />
            <p className="text-slate-400 text-sm">
              &copy; {year} FreeLanceDAO. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

function ConditionalNavigation() {
  const pathname = usePathname()
  const isAdminPage = pathname?.startsWith('/admin')
  
  if (isAdminPage) {
    return null
  }
  
  return <TopNavigation />
}

function ConditionalBottomNavigation() {
  const pathname = usePathname()
  const isAdminPage = pathname?.startsWith('/admin')
  
  if (isAdminPage) {
    return null
  }
  
  return <BottomNavigation />
}

function ConditionalFooter() {
  const pathname = usePathname()
  const isAdminPage = pathname?.startsWith('/admin')
  
  if (isAdminPage) {
    return null
  }
  
  return <Footer />
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <RainbowkitHederaProvider>
          <ConditionalNavigation />
          <main className="pb-20 md:pb-0">{children}</main>
          <ConditionalBottomNavigation />
          <ConditionalFooter />
          <ContractNotification />
          <Toaster position="top-right" richColors />
          </RainbowkitHederaProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
