import { ConnectButton } from '@rainbow-me/rainbowkit';
import Image from 'next/image';
import { Button } from './ui/button';
import React from 'react';
import { ChevronDown } from 'lucide-react';


export const CustomHederaConnectButton = () => {
  const [accountId, setAccountId] = React.useState<string | null>(null);

  async function resolveHederaAccountId(evmAddress: string): Promise<string> {
    try {
      const response = await fetch(
        `https://testnet.mirrornode.hedera.com/api/v1/accounts/${evmAddress}`,
      )
      if (!response.ok) {
        throw new Error("Failed to resolve Hedera account from EVM address")
      }
      const data = await response.json()
      console.log("Resolved Hedera account data:", data)
      const accountId = data.account || data.evm_address
      return accountId
    } catch {
      return evmAddress
    }
  }


  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {

        const ready = mounted;
        const connected = ready && account && chain;

        React.useEffect(() => {
          async function fetchAccountId() {
            if (account?.displayName && account.displayName.startsWith('0x')) {
              const resolved = await resolveHederaAccountId(account.address);
              setAccountId(resolved);
            } else {
              setAccountId(account?.displayName || null);
            }
          }
          if (connected) {
            fetchAccountId();
          } else {
            setAccountId(null);
          }
        }, [connected, account?.displayName]);

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              'style': {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <Button variant={'outline'} onClick={openConnectModal} type="button" className='border-green-200 bg-green-50 text-green-700 hover:bg-green-100'>
                    Connect Wallet
                  </Button>
                );
              }
              if (chain.unsupported) {
                return (
                  <Button variant={'outline'} onClick={openChainModal} type="button" className='border-green-200 bg-green-50 text-green-700 hover:bg-green-100'>
                    Wrong network
                  </Button>
                );
              }
              return (
                <Button variant={'outline'} className=' border-green-200 bg-green-50 text-green-700 hover:bg-green-100 flex gap-4 items-center'>
                  <button
                    onClick={openChainModal}
                    type="button"
                  >
                    <div className='overflow-hidden'
                    >
                      {/* hardcoded hedera icon, change it if you switch chain */}
                      <Image
                        alt={chain.name ?? 'Hedera Chain icon'}
                        src="/hedera-logo.jpg"
                        width={1000}
                        height={1000}
                        className='w-6 object-cover'
                      />
                    </div>

                  </button>
                  <button onClick={openAccountModal} type="button" className='flex gap-2 items-center'>
                    {accountId}
                    {/* {account.displayBalance
                      ? ` (${account.displayBalance})`
                      : ''} */}
                    <ChevronDown/>
                  </button>
                </Button>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};
