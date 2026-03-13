import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider } from "@/lib/auth-context"
import { WagmiProvider } from "wagmi"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { wagmiConfig } from "@/lib/wagmi"

const inter = Inter({ subsets: ["latin"] })
const queryClient = new QueryClient()

export const metadata: Metadata = {
  title: "FreeLanceDAO",
  description: "Decentralized freelancing platform",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WagmiProvider config={wagmiConfig}>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              {children}
              <Toaster />
            </AuthProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </body>
    </html>
  )
}