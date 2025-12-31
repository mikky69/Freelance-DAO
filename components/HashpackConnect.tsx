"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Wallet,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Shield,
  Zap,
  Copy,
  UnplugIcon as Disconnect,
  Loader2,
  Sparkles,
  TrendingUp,
  RefreshCw,
  Download,
  AlertCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  type HederaAccount,
} from "@/lib/hedera-wallet";
import { useAuth } from "@/lib/auth-context";
import { useWallet } from "@/lib/wallet-context";
import Image from "next/image";

interface HashpackConnectProps {
  onConnectionChange?: (connected: boolean, account?: HederaAccount) => void;
  showDialog?: boolean;
}

export function HashpackConnect({
  onConnectionChange,
  showDialog = true,
}: HashpackConnectProps) {
  const {
    connectWallet: authConnectWallet,
    disconnectWallet: authDisconnectWallet,
  } = useAuth();

  const {
    account,
    isConnected,
    isConnecting,
    error: connectionError,
    connect,
    disconnect,
    refreshBalance: contextRefreshBalance,
  } = useWallet();

  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (isConnected && account) {
      authConnectWallet(account.accountId);
      onConnectionChange?.(true, account);
    }
  }, [isConnected, account, authConnectWallet, onConnectionChange]);

  const connectHashpack = async () => {
    await connect();
  };

  const disconnectHashpack = async () => {
    try {
      await disconnect();
      authDisconnectWallet();
      onConnectionChange?.(false);
    } catch (error) {
      // Error handled by context
    }
  };

  const refreshBalance = async () => {
    if (!isConnected) return;

    setIsRefreshing(true);
    try {
      await contextRefreshBalance();
    } catch (error) {
      // Error handled by context
    } finally {
      setIsRefreshing(false);
    }
  };

  const copyAddress = () => {
    if (account?.accountId) {
      navigator.clipboard.writeText(account.accountId);
      toast.success("Account ID copied to clipboard!");
   }
  };

  if (account) {
    return (
      <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div className="absolute inset-0 animate-ping">
                  <CheckCircle className="w-5 h-5 text-green-400 opacity-75" />
                </div>
              </div>
              <span className="text-green-800">HashPack Connected</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-green-100 text-green-700 animate-pulse">
                <Sparkles className="w-3 h-3 mr-1" />
                Testnet
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={refreshBalance}
                disabled={isRefreshing}
                className="hover:bg-green-100"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-white/70 backdrop-blur-sm p-4 rounded-lg border border-green-200/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600 font-medium">
                Account ID:
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyAddress}
                className="hover:bg-green-100 transition-colors duration-200"
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
            <div className="font-mono text-sm text-slate-800 break-all bg-slate-50 p-2 rounded border">
              {account.accountId}
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-4 rounded-lg text-white">
            <div className="text-sm opacity-90 mb-1">Balance:</div>
            <div className="text-2xl font-bold flex items-center">
              {account.balance} HBAR
              <TrendingUp className="w-5 h-5 ml-2 animate-bounce" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-blue-50 rounded-lg text-center group hover:bg-blue-100 transition-colors duration-200">
              <Shield className="w-6 h-6 text-blue-500 mx-auto mb-1 group-hover:scale-110 transition-transform duration-200" />
              <div className="text-xs text-blue-700 font-medium">Secure</div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg text-center group hover:bg-green-100 transition-colors duration-200">
              <Zap className="w-6 h-6 text-green-500 mx-auto mb-1 group-hover:scale-110 transition-transform duration-200" />
              <div className="text-xs text-green-700 font-medium">Fast</div>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg text-center group hover:bg-purple-100 transition-colors duration-200">
              <Sparkles className="w-6 h-6 text-purple-500 mx-auto mb-1 group-hover:scale-110 transition-transform duration-200" />
              <div className="text-xs text-purple-700 font-medium">Testnet</div>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={disconnectHashpack}
            className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-200 bg-transparent"
          >
            <Disconnect className="w-4 h-4 mr-2" />
            Disconnect Wallet
          </Button>
        </CardContent>
      </Card>
    );
  }
  const walletSelectionContent = (
    <>
      {connectionError && (
        <Alert className="mb-4 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-800">
            {connectionError}
          </AlertDescription>
        </Alert>
      )}

      <Card className="transition-all duration-300 border-slate-200">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Image
                src="/hedera-logo.jpg"
                alt="HashPack"
                width={48}
                height={48}
                className="rounded-lg"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-bold text-slate-800 text-lg">
                  HashPack Wallet
                </span>
                <Badge className="bg-green-100 text-green-700 text-xs">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Official
                </Badge>
              </div>
              <p className="text-sm text-slate-600">
                Connect with Hedera's most popular wallet
              </p>
              <p className="text-xs text-amber-600 font-medium mt-1">
                ⚠️ Make sure you're on <strong>Testnet</strong>
              </p>
            </div>
          </div>

          {/* Connect Button - Always show, handle detection on click */}
          <Button
            onClick={connectHashpack}
            disabled={isConnecting}
            className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg disabled:opacity-50"
          >
            {isConnecting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <div className="text-center pt-4 border-t border-slate-200 mt-4">
        <p className="text-sm text-slate-600 mb-2">New to HashPack?</p>
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              window.open("https://www.hashpack.app/download", "_blank")
            }
            className="text-purple-600 border-purple-200 hover:bg-purple-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Install HashPack Extension
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              window.open("https://portal.hedera.com/register", "_blank")
            }
            className="text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Create Testnet Account
          </Button>
        </div>
      </div>
    </>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative group text-white hover:bg-gradient-to-r hover:from-[#AE16A7]/20 hover:to-[#FF068D]/20 p-2 md:p-3 rounded-xl border border-transparent hover:border-[#AE16A7]/30 hover:shadow-lg hover:shadow-[#AE16A7]/20 transition-all duration-300"
        >
          <Image
            src="/hedera-logo.jpg"
            alt="Hedera Wallet"
            width={20}
            height={20}
            className="w-5 h-5 rounded"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 border-[#AE16A7]/30 shadow-2xl rounded-xl backdrop-blur-md p-4"
        style={{ backgroundColor: "#1D0225" }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#AE16A7]/10 to-[#FF068D]/10 rounded-xl pointer-events-none"></div>

        <div className="relative z-10">{walletSelectionContent}</div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default HashpackConnect;