import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { TopNavigation, BottomNavigation } from "@/components/navigation"
import { AuthProvider } from "@/lib/auth-context"
import { Toaster } from "sonner"
import Image from "next/image"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "FreeLanceDAO - Decentralized Freelance Platform",
  description: "The future of freelancing with Web3 security and Web2 simplicity",
    generator: 'v0.dev'
}

function Footer() {
  return (
    <footer className="bg-slate-900 text-white py-12 mt-0">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <Image
                src="/images/freelancedao-logo.png"
                alt="FreeLanceDAO"
                width={40}
                height={40}
                className="rounded-lg shadow-lg"
              />
              <div>
                <span className="text-xl font-bold">FreeLanceDAO</span>
                <div className="text-xs text-slate-400">Decentralized Freelancing</div>
              </div>
            </div>
            <p className="text-slate-400 leading-relaxed">
              The decentralized freelance platform combining Web2 usability with Web3 security.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 flex items-center">Platform</h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <a href="/jobs" className="hover:text-white transition-colors duration-200">
                  Find Work
                </a>
              </li>
              <li>
                <a href="/freelancers" className="hover:text-white transition-colors duration-200">
                  Find Talent
                </a>
              </li>
              <li>
                <a href="/post-job" className="hover:text-white transition-colors duration-200">
                  Post Job
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Community</h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <a href="https://x.com/Freelance_DAO" className="hover:text-white transition-colors duration-200">
                  Twitter/X
                </a>
              </li>
              <li>
                <a href="https://discord.gg/pYyf2fkFZj" className="hover:text-white transition-colors duration-200">
                  Discord
                </a>
              </li>
              <li>
                <a href="https://medium.com/@freelancedao" className="hover:text-white transition-colors duration-200">
                  Medium
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Governance</h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <a href="/dao" className="hover:text-white transition-colors duration-200">
                  Join DAO
                </a>
              </li>
              <li>
                <a href="/proposals" className="hover:text-white transition-colors duration-200">
                  Proposals
                </a>
              </li>
              <li>
                <a href="/governance" className="hover:text-white transition-colors duration-200">
                  Governance
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
          <div className="flex items-center justify-center space-x-3">
            <Image
              src="/images/freelancedao-logo.png"
              alt="FreeLanceDAO"
              width={24}
              height={24}
              className="rounded opacity-75"
            />
            <p>&copy; 2024 FreeLanceDAO. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  )
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
          <TopNavigation />
          <main className="pb-20 md:pb-0">{children}</main>
          <BottomNavigation />
          <Footer />
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </body>
    </html>
  )
}
