"use client"
import '@rainbow-me/rainbowkit/styles.css';
import React, { ReactNode } from "react";
import {
  getDefaultConfig,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import {
  hederaTestnet,
  mainnet,
} from 'wagmi/chains';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";

const config = getDefaultConfig({
  appName: 'Freelance DAO',
  projectId: 'YOUR_PROJECT_ID',
  chains: [hederaTestnet, mainnet],
  ssr: true,
});

const queryClient = new QueryClient();

interface RainbowkitHederaProviderProps {
  children: ReactNode;
}

const RainbowkitHederaProvider: React.FC<RainbowkitHederaProviderProps> = ({ children }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default RainbowkitHederaProvider;