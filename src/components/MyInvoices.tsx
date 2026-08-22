import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { useInvoice, useUSDC } from '@/hooks/useContract';
import { Contract } from 'ethers';
import { formatUSDC, formatAddress, statusLabels, statusColors, factoringStatusLabels } from '@/utils/format';
import { ARC_EXPLORER, USDC_ADDRESS, INVOICE_ADDRESS } from '@/config/contracts';
import { Loader2, CheckCircle, XCircle, HandCoins, ExternalLink } from 'lucide-react';

interface Invoice {
  id: bigint;
  issuer: string;
  client: string;
  amount: bigint;
  dueDate: bigint;
  factoringFee: bigint;
  metadataURI: string;
  status: number;
  createdAt: bigint;
  factoring: {
    factor: string;
    offerAmount: bigint;
    status: number;
  } | null;
}

function parseInvoice(raw: any): Invoice {
  // ethers v6 может вернуть массив или объект
  const get = (field: string, idx: number) => raw[field] ?? raw[idx];
  return {
    id: BigInt(get('id', 0)?.toString() || 0),
    issuer: get('issuer', 1),
    client: get('client', 2),
    amount: BigInt(get('amount', 3)?.toString() || 0),
    dueDate: BigInt(get('dueDate', 4)?.toString() || 0),
    factoringFee: BigInt(get('factoringFee', 5)?.toString() || 0),
    metadataURI: get('metadataURI', 6) || '',
    status: Number(get('status', 7) || 0),
    createdAt: BigInt(get('createdAt', 8)?.toString() || 0),
    factoring: null,
  };
}

export default function MyInvoices() {
  const { address, signer, provider, isConnected, isArcNetwork } = useWallet();
  const contract = useInvoice(signer);
  const readContract = useInvoice(provider);
  const usdcContract = useUSDC(signer);

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [usdcDecimals, setUsdcDecimals] = useState(18);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = useCallback(async () => {
    if (!readContract || !address) return;
    setLoading(true);
    setError(null);
    try {
      const [issuerIds, clientIds] = await Promise.all([
        readContract.getIssuerInvoices(address),
        readContract.getClientInvoices(address),
      ]);

      const allIds = Array.from(new Set([...issuerIds, ...clientIds].map((id: any) => BigInt(id.toString()))));
      const items: Invoice[] = [];

      for (const id of allIds) {
        try {
          const raw = await readContract.getInvoice(id);
          const inv = parseInvoice(raw);

          let factoring = null;
          try {
            const f = await readContract.getFactoringRequest(id);
            const factor = f.factor || f[0];
            if (factor && factor !== '0x0000000000000000000000000000000000000000') {
              factoring = {
                factor: factor,
                offerAmount: BigInt((f.offerAmount || f[1])?.toString() || 0),
                status: Number(f.status || f[2] || 0),
              };
            }
          } catch {}

          inv.factoring = factoring;
          items.push(inv);
        } catch (e) {
          console.error(`Failed to fetch invoice ${id}:`, e);
        }
      }

      items.sort((a, b) => Number(b.createdAt - a.createdAt));
      setInvoices(items);
    } catch (err: any) {
      console.error('Fetch invoices error:', err);
      setError(err.reason || err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [readContract, address]);

  useEffect(() => {
    if (provider) {
      const usdc = new Contract(
        USDC_ADDRESS,
        ['function decimals() view returns (uint8)'],
        provider
      );
      usdc.decimals().then((d: number) => setUsdcDecimals(d)).catch(() => setUsdcDecimals(18));
    }
  }, [provider]);

  useEffect(() => {
    if (isConnected && isArcNetwork) fetchInvoices();
  }, [isConnected, isArcNetwork, fetchInvoices]);

  const handlePay = async (invoiceId: bigint, amount: bigint) => {
    if (!contract || !usdcContract || !address) return;
    setActionLoading(Number(invoiceId));
    try {
      const allowance = await usdcContract.allowance(address, INVOICE_ADDRESS);
      if (allowance < amount) {
        const approveTx = await usdcContract.approve(INVOICE_ADDRESS, amount);
        await approveTx.wait();
      }
      const tx = await contract.payInvoice(invoiceId);
      await tx.wait();
      fetchInvoices();
    } catch (err: any) {
      alert(`Error: ${err.reason || err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (invoiceId: bigint) => {
    if (!contract) return;
    setActionLoading(Number(invoiceId));
    try {
      const tx = await contract.cancelInvoice(invoiceId);
      await tx.wait();
      fetchInvoices();
    } catch (err: any) {
      alert(`Error: ${err.reason || err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleAcceptFactoring = async (invoiceId: bigint) => {
    if (!contract) return;
    setActionLoading(Number(invoiceId));
    try {
      const tx = await contract.acceptFactoring(invoiceId);
      await tx.wait();
      fetchInvoices();
    } catch (err: any) {
      alert(`Error: ${err.reason || err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  if (!isConnected) {
    return (
      <div className="max-w-6xl mx-auto mt-20 text-center">
        <h2 className="text-2xl font-bold mb-4">My Invoices</h2>
        <p className="text-gray-600">Connect your wallet to view your invoices</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto mt-8">
        <h2 className="text-2xl font-bold mb-6">My Invoices</h2>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          <p className="font-semibold">Error loading invoices:</p>
          <p className="text-sm">{error}</p>
          <button onClick={fetchInvoices} className="btn-primary mt-3 text-sm">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Invoices</h2>
        <button onClick={fetchInvoices} className="btn-secondary text-sm">Refresh</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
        </div>
      ) : invoices.length === 0 ? (
        <div className="text-center py-20 text-gray-500">No invoices found</div>
      ) : (
        <div className="space-y-4">
          {invoices.map((inv) => {
            const isIssuer = inv.issuer?.toLowerCase() === address?.toLowerCase();
            const isClient = inv.client?.toLowerCase() === address?.toLowerCase();
            const isPending = inv.status === 0;

            return (
              <div key={String(inv.id)} className="card">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm text-gray-500">#{String(inv.id)}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[inv.status] || 'bg-gray-100 text-gray-800'}`}>
                        {statusLabels[inv.status] || 'Unknown'}
                      </span>
                      {inv.factoring && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Factoring: {factoringStatusLabels[inv.factoring.status] || 'Unknown'}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 text-xs">Amount</p>
                        <p className="font-semibold">{formatUSDC(inv.amount, usdcDecimals)} USDC</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Due Date</p>
                        <p className="font-semibold">{new Date(Number(inv.dueDate) * 1000).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Issuer</p>
                        <p className="font-semibold">{formatAddress(inv.issuer)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Client</p>
                        <p className="font-semibold">{formatAddress(inv.client)}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{inv.metadataURI}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {isClient && isPending && (
                      <button
                        onClick={() => handlePay(inv.id, inv.amount)}
                        disabled={actionLoading === Number(inv.id)}
                        className="btn-primary flex items-center gap-2 text-sm"
                      >
                        {actionLoading === Number(inv.id) ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                        Pay
                      </button>
                    )}

                    {isIssuer && isPending && !inv.factoring && (
                      <button
                        onClick={() => handleCancel(inv.id)}
                        disabled={actionLoading === Number(inv.id)}
                        className="btn-secondary flex items-center gap-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        {actionLoading === Number(inv.id) ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                        Cancel
                      </button>
                    )}

                    {isIssuer && inv.factoring?.status === 1 && (
                      <button
                        onClick={() => handleAcceptFactoring(inv.id)}
                        disabled={actionLoading === Number(inv.id)}
                        className="btn-primary flex items-center gap-2 text-sm bg-green-600 hover:bg-green-700"
                      >
                        {actionLoading === Number(inv.id) ? <Loader2 className="w-4 h-4 animate-spin" /> : <HandCoins className="w-4 h-4" />}
                        Accept Factoring
                      </button>
                    )}

                    <a
                      href={`${ARC_EXPLORER}/tx/${String(inv.id)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary flex items-center gap-2 text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
