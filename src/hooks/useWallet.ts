import { useState, useEffect, useCallback } from 'react';
import { BrowserProvider, JsonRpcSigner, Contract } from 'ethers';
import { ARC_CHAIN_ID, ARC_NETWORK, USDC_ADDRESS } from '@/config/contracts';

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

  const refreshBalance = useCallback(async (provider: BrowserProvider, address: string) => {
    try {
      const usdc = new Contract(
        USDC_ADDRESS,
        ['function balanceOf(address) view returns (uint256)', 'function decimals() view returns (uint8)'],
        provider
      );
      const [bal, decimals] = await Promise.all([usdc.balanceOf(address), usdc.decimals()]);
      const intPart = (bal / BigInt(10) ** BigInt(decimals)).toString();
      const fracPart = (bal % BigInt(10) ** BigInt(decimals)).toString().padStart(decimals, '0').replace(/0+$/, '');
      const formatted = fracPart ? `${intPart}.${fracPart}` : intPart;
      setState(prev => ({ ...prev, usdcBalance: formatted }));
    } catch {
      setState(prev => ({ ...prev, usdcBalance: '0' }));
    }
  }, []);

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

      refreshBalance(provider, address);

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
  }, [refreshBalance]);

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

  // Auto-connect on mount
  useEffect(() => {
    let cancelled = false;
    
    const checkExistingConnection = async () => {
      if (!window.ethereum) {
        setTimeout(() => {
          if (!cancelled && window.ethereum) {
            checkExistingConnection();
          }
        }, 800);
        return;
      }
      
      try {
        const provider = new BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0 && !cancelled) {
          await connect();
        }
      } catch (err) {
        console.error('Auto-connect check error:', err);
      }
    };

    checkExistingConnection();
    
    return () => {
      cancelled = true;
    };
  }, [connect]);

  useEffect(() => {
    if (!window.ethereum) return;
    
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) disconnect();
      else connect();
    };
    
    const handleChainChanged = () => {
      window.location.reload();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
    
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
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
