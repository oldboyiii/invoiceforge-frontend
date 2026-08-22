export const INVOICE_ADDRESS = import.meta.env.VITE_INVOICE_CONTRACT as string;
export const USDC_ADDRESS = import.meta.env.VITE_USDC_ADDRESS as string;
export const FXBLITZ_ADDRESS = import.meta.env.VITE_FXBLITZ_ADDRESS as string;
export const ARC_EXPLORER = import.meta.env.VITE_ARC_EXPLORER as string;
export const ARC_RPC_URL = import.meta.env.VITE_ARC_RPC_URL as string;

export const ARC_CHAIN_ID = 5042002;

export const ARC_NETWORK = {
  chainId: `0x${ARC_CHAIN_ID.toString(16)}`,
  chainName: 'Arc Testnet',
  nativeCurrency: {
    name: 'USDC',
    symbol: 'USDC',
    decimals: 18,
  },
  rpcUrls: [ARC_RPC_URL],
  blockExplorerUrls: [ARC_EXPLORER],
};
