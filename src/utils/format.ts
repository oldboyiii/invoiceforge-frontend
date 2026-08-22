export const formatAddress = (addr: string) =>
  `${addr.slice(0, 6)}...${addr.slice(-4)}`;

export const formatUSDC = (amount: bigint, decimals: number) => {
  const str = amount.toString().padStart(decimals + 1, '0');
  const intPart = str.slice(0, -decimals) || '0';
  const fracPart = str.slice(-decimals).replace(/0+$/, '');
  return fracPart ? `${intPart}.${fracPart}` : intPart;
};

export const parseUSDC = (amount: string, decimals: number): bigint => {
  const [intPart, fracPart = ''] = amount.split('.');
  const padded = fracPart.padEnd(decimals, '0').slice(0, decimals);
  return BigInt(intPart + padded);
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
