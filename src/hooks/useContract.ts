import { useMemo } from 'react';
import { Contract, JsonRpcSigner, BrowserProvider } from 'ethers';
import { INVOICE_ABI, ERC20_ABI, FXBLITZ_ABI } from '@/config/abi';
import { INVOICE_ADDRESS, USDC_ADDRESS, FXBLITZ_ADDRESS } from '@/config/contracts';

export function useInvoice(signerOrProvider: JsonRpcSigner | BrowserProvider | null) {
  return useMemo(() => {
    if (!signerOrProvider) return null;
    return new Contract(INVOICE_ADDRESS, INVOICE_ABI, signerOrProvider);
  }, [signerOrProvider]);
}

export function useUSDC(signerOrProvider: JsonRpcSigner | BrowserProvider | null) {
  return useMemo(() => {
    if (!signerOrProvider) return null;
    return new Contract(USDC_ADDRESS, ERC20_ABI, signerOrProvider);
  }, [signerOrProvider]);
}

export function useFXBlitz(signerOrProvider: JsonRpcSigner | BrowserProvider | null) {
  return useMemo(() => {
    if (!signerOrProvider) return null;
    return new Contract(FXBLITZ_ADDRESS, FXBLITZ_ABI, signerOrProvider);
  }, [signerOrProvider]);
}
