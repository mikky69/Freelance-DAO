"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "./ui/button"
import { usePrivy, useWallets } from "@privy-io/react-auth"
import { useChainId, useSwitchChain } from "wagmi"
import { hederaTestnet } from "wagmi/chains"
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

// Hedera chain IDs
const HEDERA_CHAIN_IDS = [295, 296, 297] // mainnet, testnet, previewnet

// Resolve EVM address to Hedera account ID
async function resolveHederaAccountId(evmAddress: string): Promise<string> {
  try {
    const response = await fetch(
      `https://testnet.mirrornode.hedera.com/api/v1/accounts/${evmAddress}`
    )
    if (!response.ok) {
      throw new Error("Failed to resolve Hedera account from EVM address")
    }
    const data = await response.json()
    const accountId = data.account || data.evm_address
    return accountId
  } catch {
    // Return shortened EVM address as fallback
    return `${evmAddress.slice(0, 6)}...${evmAddress.slice(-4)}`
  }
}

// Format wallet address for display: 0x1234...5678
function formatAddress(address: string): string {
  if (!address) return ""
  if (address.startsWith("0.0.")) return address // Hedera native format
  if (address.length <= 13) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export const PrivyHederaConnectButton = () => {
  const [accountId, setAccountId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [isSwitchingChain, setIsSwitchingChain] = useState(false)

  const { ready, authenticated, login, logout, user: privyUser } = usePrivy()
  const { wallets } = useWallets()
  const { user } = useAuth()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()

  // Get the primary wallet
  const primaryWallet = wallets.length > 0 ? wallets[0] : null
  const walletAddress = primaryWallet?.address

  // Check if current chain is Hedera
  const isOnHedera = HEDERA_CHAIN_IDS.includes(chainId)

  // Switch to Hedera chain when connected to wrong chain
  useEffect(() => {
    if (authenticated && walletAddress && !isOnHedera && !isSwitchingChain) {
      setIsSwitchingChain(true)
      toast.info("Switching to Hedera Testnet...")

      switchChain(
        { chainId: hederaTestnet.id },
        {
          onSuccess: () => {
            toast.success("Switched to Hedera Testnet")
            setIsSwitchingChain(false)
          },
          onError: (error) => {
            console.error("Chain switch failed:", error)
            toast.error(
              "Failed to switch to Hedera. Please switch manually in your wallet."
            )
            setIsSwitchingChain(false)
          },
        }
      )
    }
  }, [authenticated, walletAddress, isOnHedera, switchChain, isSwitchingChain])

  // Resolve Hedera account ID when wallet connects
  useEffect(() => {
    async function fetchAccountId() {
      if (walletAddress && walletAddress.startsWith("0x")) {
        const resolved = await resolveHederaAccountId(walletAddress)
        setAccountId(resolved)
      } else if (walletAddress) {
        setAccountId(walletAddress)
      } else {
        setAccountId(null)
      }
    }

    if (authenticated && walletAddress) {
      fetchAccountId()
    } else {
      setAccountId(null)
    }
  }, [authenticated, walletAddress])

  // Copy full wallet address to clipboard
  const copyAddress = async () => {
    const addressToCopy = walletAddress || accountId
    if (addressToCopy) {
      await navigator.clipboard.writeText(addressToCopy)
      setCopied(true)
      toast.success("Address copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // View on explorer
  const viewOnExplorer = () => {
    if (walletAddress) {
      window.open(
        `https://hashscan.io/testnet/account/${walletAddress}`,
        "_blank"
      )
    }
  }

  if (!ready) {
    return (
      <Button
        variant="outline"
        disabled
        className="space-x-1 md:space-x-2 border border-[#AE16A7]/50 rounded-xl px-2 md:px-3 py-2 bg-gradient-to-r from-[#AE16A7]/10 to-[#FF068D]/10 opacity-50"
      >
        <span className="animate-pulse">Loading...</span>
      </Button>
    )
  }

  if (!authenticated) {
    return (
      <Button
        variant="outline"
        onClick={login}
        className="space-x-1 md:space-x-2 border border-[#AE16A7]/50 hover:bg-gradient-to-r hover:from-[#AE16A7]/20 hover:to-[#FF068D]/20 hover:border-[#AE16A7] rounded-xl transition-all duration-300 px-2 md:px-3 py-2 bg-gradient-to-r from-[#AE16A7]/10 to-[#FF068D]/10"
      >
        <IconifyIcon icon="mdi:wallet" className="w-4 h-4 mr-1" />
        <span className="hidden sm:inline">Connect Wallet</span>
        <span className="sm:hidden">Connect</span>
      </Button>
    )
  }

  // Display address: prefer accountId, fallback to truncated walletAddress
  const displayAddress = accountId || (walletAddress ? formatAddress(walletAddress) : "Connected")

  // Authenticated state
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="space-x-1 md:space-x-2 border border-[#AE16A7]/50 hover:bg-gradient-to-r hover:from-[#AE16A7]/20 hover:to-[#FF068D]/20 hover:border-[#AE16A7] rounded-xl transition-all duration-300 px-2 md:px-3 py-2 bg-gradient-to-r from-[#AE16A7]/10 to-[#FF068D]/10"
        >
          <div className="overflow-hidden">
            <Image
              alt="Hedera Chain icon"
              src="/hedera-logo.jpg"
              width={24}
              height={24}
              className="w-5 h-5 md:w-6 md:h-6 object-cover rounded-full"
            />
          </div>
          <span className="hidden sm:inline font-medium text-sm">
            {formatAddress(displayAddress)}
          </span>
          <span className="sm:hidden text-xs">
            {formatAddress(displayAddress)}
          </span>
          <IconifyIcon icon="mdi:chevron-down" className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-64 border-[#AE16A7]/30 shadow-2xl rounded-xl backdrop-blur-md"
        style={{ backgroundColor: "#1D0225" }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#AE16A7]/10 to-[#FF068D]/10 rounded-xl"></div>

        <DropdownMenuLabel className="relative z-10 text-white">
          <div className="flex items-center space-x-3 py-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#AE16A7] to-[#FF068D] flex items-center justify-center">
              <Image
                alt="Hedera"
                src="/hedera-logo.jpg"
                width={32}
                height={32}
                className="rounded-full"
              />
            </div>
            <div className="flex-1 min-w-0">
              {/* Clickable wallet address to copy */}
              <button
                onClick={copyAddress}
                className="flex items-center space-x-1 font-semibold text-white hover:text-[#FA5F04] transition-colors cursor-pointer group"
                title="Click to copy address"
              >
                <span className="truncate max-w-[140px] block">
                  {formatAddress(displayAddress)}
                </span>
                {copied ? (
                  <IconifyIcon
                    icon="mdi:check"
                    className="w-3 h-3 text-green-500 flex-shrink-0"
                  />
                ) : (
                  <IconifyIcon
                    icon="mdi:content-copy"
                    className="w-3 h-3 opacity-50 group-hover:opacity-100 flex-shrink-0"
                  />
                )}
              </button>
              <div className="flex items-center space-x-2 mt-0.5">
                <div className="text-xs text-[#AE16A7]/70">
                  Hedera Testnet
                </div>
                {user?.role && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#AE16A7]/20 text-[#FF068D] capitalize border border-[#AE16A7]/30">
                    {user.role}
                  </span>
                )}
              </div>
              {!isOnHedera && walletAddress && (
                <div className="text-[10px] text-red-400 mt-0.5 flex items-center space-x-1">
                  <IconifyIcon icon="mdi:alert" className="w-3 h-3" />
                  <span>Wrong network</span>
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
            <IconifyIcon
              icon="mdi:check-circle"
              className="w-4 h-4 mr-3 text-green-500"
            />
          ) : (
            <IconifyIcon
              icon="mdi:content-copy"
              className="w-4 h-4 mr-3 text-[#FA5F04]"
            />
          )}
          <span>{copied ? "Copied!" : "Copy Address"}</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={viewOnExplorer}
          className="relative z-10 flex items-center hover:bg-gradient-to-r hover:from-[#AE16A7]/20 hover:to-[#FF068D]/20 text-white cursor-pointer"
        >
          <IconifyIcon
            icon="mdi:open-in-new"
            className="w-4 h-4 mr-3 text-[#FA5F04]"
          />
          <span>View on HashScan</span>
        </DropdownMenuItem>

        {!isOnHedera && walletAddress && (
          <>
            <DropdownMenuSeparator className="border-[#AE16A7]/30" />
            <DropdownMenuItem
              onClick={() => {
                switchChain({ chainId: hederaTestnet.id })
              }}
              className="relative z-10 flex items-center hover:bg-gradient-to-r hover:from-[#FA5F04]/20 hover:to-[#FF068D]/20 text-[#FA5F04] cursor-pointer"
            >
              <IconifyIcon
                icon="mdi:swap-horizontal"
                className="w-4 h-4 mr-3"
              />
              <span>Switch to Hedera</span>
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
