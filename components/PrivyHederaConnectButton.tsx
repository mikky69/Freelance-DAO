"use client"

import React, { useState } from "react"
import { Button } from "./ui/button"
import { usePrivy, useWallets } from "@privy-io/react-auth"
import { useChainId, useSwitchChain } from "wagmi"
import { baseSepolia } from "wagmi/chains"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"
import { IconifyIcon } from "@/components/iconify-icon"
import { Wallet } from "lucide-react"

function formatAddress(address: string): string {
  if (!address) return ""
  if (address.length <= 13) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export const PrivyHederaConnectButton = () => {
  const [copied, setCopied] = useState(false)
  const [isSwitching, setIsSwitching] = useState(false)

  const { ready, authenticated, login, logout } = usePrivy()
  const { wallets } = useWallets()
  const { user } = useAuth()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()

  const primaryWallet = wallets.length > 0 ? wallets[0] : null
  const walletAddress = primaryWallet?.address
  const isOnBase = chainId === baseSepolia.id

  const copyAddress = async () => {
    if (walletAddress) {
      await navigator.clipboard.writeText(walletAddress)
      setCopied(true)
      toast.success("Address copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const viewOnExplorer = () => {
    if (walletAddress) {
      window.open(`https://sepolia.basescan.org/address/${walletAddress}`, "_blank")
    }
  }

  const handleSwitchChain = () => {
    setIsSwitching(true)
    switchChain(
      { chainId: baseSepolia.id },
      {
        onSuccess: () => { toast.success("Switched to Base Sepolia"); setIsSwitching(false) },
        onError: () => { toast.error("Failed to switch network"); setIsSwitching(false) },
      }
    )
  }

  if (!ready) {
    return (
      <Button variant="outline" disabled className="border border-[#AE16A7]/50 rounded-xl px-2 md:px-3 py-2 bg-gradient-to-r from-[#AE16A7]/10 to-[#FF068D]/10 opacity-50">
        <span className="animate-pulse text-white text-sm">Loading...</span>
      </Button>
    )
  }

  if (!authenticated) {
    return (
      <Button
        variant="outline"
        onClick={login}
        className="flex items-center space-x-2 border border-[#AE16A7]/50 text-white hover:bg-gradient-to-r hover:from-[#AE16A7]/20 hover:to-[#FF068D]/20 hover:border-[#AE16A7] rounded-xl transition-all duration-300 px-2 md:px-3 py-2 bg-gradient-to-r from-[#AE16A7]/10 to-[#FF068D]/10"
      >
        <Wallet className="w-4 h-4" />
        <span className="hidden sm:inline text-sm font-semibold">Connect Wallet</span>
        <span className="sm:hidden text-xs font-semibold">Connect</span>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center space-x-2 border border-[#AE16A7]/50 text-white hover:bg-gradient-to-r hover:from-[#AE16A7]/20 hover:to-[#FF068D]/20 hover:border-[#AE16A7] rounded-xl transition-all duration-300 px-2 md:px-3 py-2 bg-gradient-to-r from-[#AE16A7]/10 to-[#FF068D]/10"
        >
          <div className="w-5 h-5 rounded-full bg-gradient-to-r from-[#0052FF] to-[#AE16A7] flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
            B
          </div>
          <span className="hidden sm:inline font-mono text-sm">
            {walletAddress ? formatAddress(walletAddress) : "Connected"}
          </span>
          {!isOnBase && (
            <span className="text-[10px] text-red-400">Wrong network</span>
          )}
          <IconifyIcon icon="mdi:chevron-down" className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-64 border-[#AE16A7]/30 shadow-2xl rounded-xl backdrop-blur-md"
        style={{ backgroundColor: "#1D0225" }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#AE16A7]/10 to-[#FF068D]/10 rounded-xl pointer-events-none"></div>

        <DropdownMenuLabel className="relative z-10 text-white">
          <div className="flex items-center space-x-3 py-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#0052FF] to-[#AE16A7] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
              B
            </div>
            <div className="flex-1 min-w-0">
              <button
                onClick={copyAddress}
                className="flex items-center space-x-1 font-semibold text-white hover:text-[#FA5F04] transition-colors cursor-pointer group"
                title="Click to copy address"
              >
                <span className="truncate max-w-[140px] block font-mono text-sm">
                  {walletAddress ? formatAddress(walletAddress) : "Connected"}
                </span>
                {copied ? (
                  <IconifyIcon icon="mdi:check" className="w-3 h-3 text-green-500 flex-shrink-0" />
                ) : (
                  <IconifyIcon icon="mdi:content-copy" className="w-3 h-3 opacity-50 group-hover:opacity-100 flex-shrink-0" />
                )}
              </button>
              <div className="flex items-center space-x-2 mt-0.5">
                <div className="text-xs text-[#AE16A7]/70">Base Sepolia</div>
                {user?.role && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#AE16A7]/20 text-[#FF068D] capitalize border border-[#AE16A7]/30">
                    {user.role}
                  </span>
                )}
              </div>
              {!isOnBase && (
                <div className="text-[10px] text-red-400 mt-0.5 flex items-center space-x-1">
                  <IconifyIcon icon="mdi:alert" className="w-3 h-3" />
                  <span>Wrong network — switch to Base Sepolia</span>
                </div>
              )}
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="border-[#AE16A7]/30" />

        <DropdownMenuItem
          onClick={copyAddress}
          className="relative z-10 flex items-center hover:bg-gradient-to-r hover:from-[#AE16A7]/20 hover:to-[#FF068D]/20 text-white cursor-pointer"
        >
          {copied ? (
            <IconifyIcon icon="mdi:check-circle" className="w-4 h-4 mr-3 text-green-500" />
          ) : (
            <IconifyIcon icon="mdi:content-copy" className="w-4 h-4 mr-3 text-[#FA5F04]" />
          )}
          <span>{copied ? "Copied!" : "Copy Address"}</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={viewOnExplorer}
          className="relative z-10 flex items-center hover:bg-gradient-to-r hover:from-[#AE16A7]/20 hover:to-[#FF068D]/20 text-white cursor-pointer"
        >
          <IconifyIcon icon="mdi:open-in-new" className="w-4 h-4 mr-3 text-[#FA5F04]" />
          <span>View on Basescan</span>
        </DropdownMenuItem>

        {!isOnBase && (
          <>
            <DropdownMenuSeparator className="border-[#AE16A7]/30" />
            <DropdownMenuItem
              onClick={handleSwitchChain}
              disabled={isSwitching}
              className="relative z-10 flex items-center hover:bg-gradient-to-r hover:from-[#FA5F04]/20 hover:to-[#FF068D]/20 text-[#FA5F04] cursor-pointer"
            >
              <IconifyIcon icon="mdi:swap-horizontal" className="w-4 h-4 mr-3" />
              <span>{isSwitching ? "Switching..." : "Switch to Base Sepolia"}</span>
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator className="border-[#AE16A7]/30" />

        <DropdownMenuItem
          onClick={logout}
          className="relative z-10 flex items-center hover:bg-gradient-to-r hover:from-red-500/20 hover:to-red-600/20 text-red-400 cursor-pointer"
        >
          <IconifyIcon icon="mdi:logout" className="w-4 h-4 mr-3" />
          <span>Disconnect</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}