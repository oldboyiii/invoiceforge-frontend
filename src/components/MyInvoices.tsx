import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { useInvoice, useUSDC } from '@/hooks/useContract';
import { BrowserProvider, Contract } from 'ethers';
import { formatUSDC, formatAddress, statusLabels, statusColors, factoringStatusLabels, ARC_EXPLORER } from '@/utils/format';
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

export default function MyInvoices() {
  const { address, signer, provider, isConnected, isArcNetwork } = useWallet();
  const contract = useInvoice(signer);
  const readContract = useInvoice(provider);
  const usdcContract = useUSDC(signer);

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [usdcDecimals, setUsdcDecimals] = useState(18);

  const fetchInvoices = useCallback(async () => {
    if (!readContract || !address) return;
    setLoading(true);
    try {
      const [issuerIds, clientIds] = await Promise.all([
        readContract.getIssuerInvoices(address),
        readContract.getClientInvoices(address),
      ]);

      const allIds = Array.from(new Set([...issuerIds, ...clientIds]));
      const items: Invoice[] = [];

      for (const id of allIds) {
        const inv = await readContract.getInvoice(id);
        let factoring = null;
        try {
          const f = await readContract.getFactoringRequest(id);
          if (f.factor !== '0x0000000000000000000000000000000000000000') {
            factoring = {
              factor: f.factor,
              offerAmount: f.offerAmount,
              status: Number(f.status),
            };
          }
        } catch {}

        items.push({
          id: inv.id,
          issuer: inv.issuer,
          client: inv.client,
          amount: inv.amount,
          dueDate: inv.dueDate,
          factoringFee: inv.factoringFee,
          metadataURI: inv.metadataURI,
          status: Number(inv.status),
          createdAt: inv.createdAt,
          factoring,
        });
      }

      items.sort((a, b) => Number(b.createdAt - a.createdAt));
      setInvoices(items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [readContract, address]);

  useEffect(() => {
    if (provider) {
      const usdc = new Contract(
        import.meta.env.VITE_USDC_ADDRESS,
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
      const allowance = await usdcContract.allowance(address, import.meta.env.VITE_INVOICE_CONTRACT);
      if (allowance < amount) {
        const approveTx = await usdcContract.approve(import.meta.env.VITE_INVOICE_CONTRACT, amount);
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

  return (
    <div className="max-w-6xl mx-auto mt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Invoices</h2>
        <button onClick={fetchInvoices} className="btn-secondary text-sm">
          Refresh
        </button>
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
            const isIssuer = inv.issuer.toLowerCase() === address?.toLowerCase();
            const isClient = inv.client.toLowerCase() === address?.toLowerCase();
            const isPending = inv.status === 0;

            return (
              <div key={String(inv.id)} className="card">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm text-gray-500">#{String(inv.id)}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[inv.status]}`}>
                        {statusLabels[inv.status]}
                      </span>
                      {inv.factoring && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Factoring: {factoringStatusLabels[inv.factoring.status]}
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
                        {actionLoading === Number(inv.id) ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                        Pay
                      </button>
                    )}

                    {isIssuer && isPending && !inv.factoring && (
                      <button
                        onClick={() => handleCancel(inv.id)}
                        disabled={actionLoading === Number(inv.id)}
                        className="btn-secondary flex items-center gap-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        {actionLoading === Number(inv.id) ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                        Cancel
                      </button>
                    )}

                    {isIssuer && inv.factoring?.status === 1 && (
                      <button
                        onClick={() => handleAcceptFactoring(inv.id)}
                        disabled={actionLoading === Number(inv.id)}
                        className="btn-primary flex items-center gap-2 text-sm bg-green-600 hover:bg-green-700"
                      >
                        {actionLoading === Number(inv.id) ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <HandCoins className="w-4 h-4" />
                        )}
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
