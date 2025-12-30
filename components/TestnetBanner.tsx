"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

export function TestnetBanner() {
  return (
    <Alert className="mb-6 border-amber-500 bg-gradient-to-r from-amber-50 to-orange-50">
      <AlertTriangle className="h-5 w-5 text-amber-600" />
      <AlertTitle className="text-amber-900 font-semibold text-lg">
        Testnet Environment - Development Mode
      </AlertTitle>
      <AlertDescription className="text-amber-800 space-y-3">
        <p className="font-medium">
          This website is currently running on <span className="font-bold">Hedera Hashgraph Testnet</span>.
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Please connect with your <strong>testnet account</strong> in HashPack wallet</li>
          <li>Testnet HBAR has no real value and is for testing only</li>
          <li>Make sure your HashPack is set to <strong>Testnet network</strong> before connecting</li>
        </ul>
        <div className="flex flex-wrap gap-3 mt-3">
          <Button
            variant="outline"
            size="sm"
            className="text-amber-700 border-amber-300 hover:bg-amber-100"
            onClick={() => window.open("https://portal.hedera.com/register", "_blank")}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Get Testnet Account
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-amber-700 border-amber-300 hover:bg-amber-100"
            onClick={() => window.open("https://portal.hedera.com/", "_blank")}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Testnet Faucet (Free HBAR)
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}