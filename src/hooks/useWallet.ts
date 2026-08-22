import { useState, useEffect, useCallback } from 'react';
import { BrowserProvider, JsonRpcSigner } from 'ethers';
import { ARC_CHAIN_ID, ARC_NETWORK } from '@/config/contracts';

interface WalletState {
  address: string | null;
  signer: JsonRpcSigner | null;
  provider: BrowserProvider | null;
  chainId: number | null;
  isConnected: boolean;
  isArcNetwork: boolean;
  usdcBalance: string;
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    address: null,
    signer: null,
    provider: null,
    chainId: null,
    isConnected: false,
    isArcNetwork: false,
    usdcBalance: '0',
  });

  const [isLoading, setIsLoading] = useState(false);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask or another Web3 wallet');
      return;
    }

    setIsLoading(true);
    try {
      const provider = new BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();
      const address = await signer.getAddress();
      const chainId = Number(network.chainId);

      setState({
        address,
        signer,
        provider,
        chainId,
        isConnected: true,
        isArcNetwork: chainId === ARC_CHAIN_ID,
        usdcBalance: '0',
      });

      if (chainId !== ARC_CHAIN_ID) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: ARC_NETWORK.chainId }],
          });
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [ARC_NETWORK],
            });
          }
        }
      }
    } catch (err) {
      console.error('Connection error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setState({
      address: null,
      signer: null,
      provider: null,
      chainId: null,
      isConnected: false,
      isArcNetwork: false,
      usdcBalance: '0',
    });
  }, []);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) disconnect();
        else connect();
      });
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, [connect, disconnect]);

  return { ...state, connect, disconnect, isLoading };
}

declare global {
  interface Window {
    ethereum?: any;
  }
}
