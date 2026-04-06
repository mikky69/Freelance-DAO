"use client"

import { ConnectButton } from "@rainbow-me/rainbowkit"
import { Wallet } from "lucide-react"

/**
 * Styled wallet connect button matching the FreeLanceDAO dark purple aesthetic.
 * Uses RainbowKit's ConnectButton.Custom for full styling control.
 * Works on desktop (MetaMask extension) and mobile (MetaMask app via WalletConnect deep link).
 */
export function WalletButton() {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== "loading"
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated")

        if (!ready) {
          return (
            <button
              disabled
              className="flex items-center space-x-2 border border-[#AE16A7]/50 text-white rounded-xl px-3 py-2 bg-gradient-to-r from-[#AE16A7]/10 to-[#FF068D]/10 opacity-50 text-sm"
            >
              <span className="animate-pulse">Loading...</span>
            </button>
          )
        }

        if (!connected) {
          return (
            <button
              onClick={openConnectModal}
              className="flex items-center space-x-2 border border-[#AE16A7]/50 text-white hover:bg-gradient-to-r hover:from-[#AE16A7]/20 hover:to-[#FF068D]/20 hover:border-[#AE16A7] rounded-xl transition-all duration-300 px-3 py-2 bg-gradient-to-r from-[#AE16A7]/10 to-[#FF068D]/10"
            >
              <Wallet className="w-4 h-4" />
              <span className="hidden sm:inline text-sm font-semibold">Connect Wallet</span>
              <span className="sm:hidden text-xs font-semibold">Connect</span>
            </button>
          )
        }

        // Wrong network
        if (chain.unsupported) {
          return (
            <button
              onClick={openChainModal}
              className="flex items-center space-x-2 border border-red-500/50 text-red-400 hover:bg-red-500/10 rounded-xl px-3 py-2 text-xs font-semibold transition-all"
            >
              Wrong network — click to switch
            </button>
          )
        }

        // Connected state
        return (
          <div className="flex items-center space-x-2">
            {/* Chain badge */}
            <button
              onClick={openChainModal}
              className="hidden md:flex items-center space-x-1.5 border border-[#AE16A7]/30 rounded-xl px-2 py-1.5 bg-[#AE16A7]/10 hover:bg-[#AE16A7]/20 transition-all"
            >
              {chain.hasIcon && chain.iconUrl && (
                <img
                  alt={chain.name ?? "Chain icon"}
                  src={chain.iconUrl}
                  className="w-4 h-4 rounded-full"
                />
              )}
              <span className="text-[#AE16A7] text-xs font-medium">{chain.name}</span>
            </button>

            {/* Account button */}
            <button
              onClick={openAccountModal}
              className="flex items-center space-x-2 border border-[#AE16A7]/50 text-white hover:bg-gradient-to-r hover:from-[#AE16A7]/20 hover:to-[#FF068D]/20 rounded-xl px-3 py-2 bg-gradient-to-r from-[#AE16A7]/10 to-[#FF068D]/10 transition-all"
            >
              <div className="w-5 h-5 rounded-full bg-gradient-to-r from-[#0052FF] to-[#AE16A7] flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                {account.displayName?.[0]?.toUpperCase() ?? "W"}
              </div>
              <span className="font-mono text-xs hidden sm:inline">
                {account.displayName}
              </span>
              {account.displayBalance && (
                <span className="text-[#AE16A7]/70 text-xs hidden md:inline">
                  {account.displayBalance}
                </span>
              )}
            </button>
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
}