export const formatAddress = (addr: string) =>
  addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '0x0000...0000';

export const safeBigInt = (val: any): bigint => {
  if (val === undefined || val === null) return 0n;
  if (typeof val === 'bigint') return val;
  try { return BigInt(val.toString()); } catch { return 0n; }
};

export const safeNumber = (val: any): number => {
  if (val === undefined || val === null) return 0;
  try { return Number(val.toString()); } catch { return 0; }
};

export const formatUSDC = (amount: bigint | any, decimals: number): string => {
  try {
    const amt = safeBigInt(amount);
    if (amt === 0n) return '0';
    const str = amt.toString().padStart(decimals + 1, '0');
    const intPart = str.slice(0, -decimals) || '0';
    const fracPart = str.slice(-decimals).replace(/0+$/, '');
    return fracPart ? `${intPart}.${fracPart}` : intPart;
  } catch {
    return '0';
  }
};

export const parseUSDC = (amount: string, decimals: number): bigint => {
  try {
    const [intPart, fracPart = ''] = amount.split('.');
    const padded = fracPart.padEnd(decimals, '0').slice(0, decimals);
    return BigInt(intPart + padded);
  } catch {
    return 0n;
  }
};

export const safeDate = (timestamp: bigint | any): string => {
  try {
    const ts = safeNumber(timestamp);
    if (ts === 0) return 'No date';
    return new Date(ts * 1000).toLocaleDateString();
  } catch {
    return 'Invalid date';
  }
};

export const statusLabels: Record<number, string> = {
  0: 'Pending',
  1: 'Paid',
  2: 'Cancelled',
};

export const statusColors: Record<number, string> = {
  0: 'bg-yellow-100 text-yellow-800',
  1: 'bg-green-100 text-green-800',
  2: 'bg-red-100 text-red-800',
};

export const factoringStatusLabels: Record<number, string> = {
  0: 'None',
  1: 'Requested',
  2: 'Accepted',
  3: 'Cancelled',
};
