import type React from "react"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"
import { ContractNotification } from "@/components/contract-notification"
import { Toaster } from "sonner"
import { WalletProvider } from "@/lib/wallet-context"
import { ConditionalBottomNavigation, ConditionalFooter, ConditionalNavigation } from "./LayoutComponent"
import { FeedbackWidget } from "@/components/feedback-widget"
import type { Metadata } from "next"
import { TestnetBanner } from "@/components/TestnetBanner"

export const metadata: Metadata = {
  title: "FreeLanceDAO - Decentralized Freelancing Platform",
  description:
    "The decentralized freelance platform combining Web2 usability with Web3 security. Join us in shaping the future of work.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <AuthProvider>
          <WalletProvider>
            <TestnetBanner />
            <ConditionalNavigation />
            <main className="pb-20 md:pb-0">{children}</main>
            <ConditionalBottomNavigation />
            <ConditionalFooter />
            <ContractNotification />
            <FeedbackWidget />
            <Toaster position="top-right" richColors />
          </WalletProvider>
        </AuthProvider>
      </body>
    </html>
  )
}