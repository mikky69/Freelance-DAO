import type React from "react"
// import { Inter } from "next/font/google"
import localFont from "next/font/local"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"
import { ContractNotification } from "@/components/contract-notification"
import { Toaster } from "sonner"
import PrivyHederaProvider from "@/PrivyHederaProvider"
import { ConditionalBottomNavigation, ConditionalFooter, ConditionalNavigation } from "./LayoutComponent"
import { FeedbackWidget } from "@/components/feedback-widget"
import type { Metadata } from "next"
import { Nunito, Italianno } from "next/font/google"
const inter = localFont({
  src: [
    {
      path: "./fonts/Inter-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/Inter-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/Inter-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/Inter-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-inter",
  display: "swap",
})

  const nunito = Nunito({
    subsets: ["latin"],
    variable: "--font-nunito",
    weight: ["700"],
    display: "swap",

  })
  const italianno = Italianno({
    subsets: ["latin"],
    variable: "--font-italianno",
    weight: ["400"],
    display: "swap",
  })
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
      <body className={`${inter.variable} ${nunito.variable} ${italianno.variable}`}>
        <PrivyHederaProvider>
          <AuthProvider>
            <ConditionalNavigation />
            <main className="pb-20 md:pb-0">{children}</main>
            <ConditionalBottomNavigation />
            <ConditionalFooter />
            <ContractNotification />
            <FeedbackWidget />
            <Toaster position="top-right" richColors />
          </AuthProvider>
        </PrivyHederaProvider>
      </body>
    </html>
  )
}
