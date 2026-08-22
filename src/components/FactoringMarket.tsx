import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { useInvoice, useFXBlitz } from '@/hooks/useContract';
import { formatUSDC, formatAddress, statusLabels, statusColors, safeBigInt, safeDate } from '@/utils/format';
import { ARC_EXPLORER } from '@/config/contracts';
import { Loader2, HandCoins, ExternalLink } from 'lucide-react';

interface MarketInvoice {
  id: bigint;
  issuer: string;
  client: string;
  amount: bigint;
  dueDate: bigint;
  factoringFee: bigint;
  metadataURI: string;
  status: number;
  createdAt: bigint;
  clientGamesPlayed: bigint;
}

function parseInvoice(raw: any) {
  const get = (field: string, idx: number) => {
    if (raw && typeof raw === 'object') {
      return raw[field] !== undefined ? raw[field] : raw[idx];
    }
    return undefined;
  };

  return {
    id: safeBigInt(get('id', 0)),
    issuer: get('issuer', 1) || '0x0000000000000000000000000000000000000000',
    client: get('client', 2) || '0x0000000000000000000000000000000000000000',
    amount: safeBigInt(get('amount', 3)),
    dueDate: safeBigInt(get('dueDate', 4)),
    factoringFee: safeBigInt(get('factoringFee', 5)),
    metadataURI: get('metadataURI', 6) || '',
    status: Number(get('status', 7) || 0),
    createdAt: safeBigInt(get('createdAt', 8)),
  };
}

const ZERO_ADDR = '0x0000000000000000000000000000000000000000';

// Таймаут для RPC вызовов
const withTimeout = <T,>(promise: Promise<T>, ms: number): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms))
  ]);
};

export default function FactoringMarket() {
  const { address, signer, isConnected, isArcNetwork } = useWallet();
  const contract = useInvoice(signer);
  const readContract = useInvoice(signer);
  const fxblitz = useFXBlitz(signer);

  const [invoices, setInvoices] = useState<MarketInvoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState<bigint | null>(null);
  const [offerAmount, setOfferAmount] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchMarket = useCallback(async () => {
    if (!readContract || !fxblitz || !address) return;
    setLoading(true);
    setError(null);
    try {
      const items: MarketInvoice[] = [];
      let consecutiveErrors = 0;

      for (let i = 1; i <= 50; i++) {
        try {
          const raw = await withTimeout(readContract.getInvoice(BigInt(i)), 3000);
          const inv = parseInvoice(raw);

          // Пропускаем пустые/несуществующие инвойсы
          if (inv.issuer === ZERO_ADDR || inv.amount === 0n) {
            consecutiveErrors++;
            if (consecutiveErrors >= 5) break;
            continue;
          }

          if (inv.status !== 0) continue;
          if (inv.issuer.toLowerCase() === address.toLowerCase()) continue;
          if (inv.client.toLowerCase() === address.toLowerCase()) continue;

          let games = 0n;
          try {
            const g = await withTimeout(fxblitz.gamesPlayed(inv.client), 3000);
            games = safeBigInt(g);
          } catch { /* ignore */ }

          items.push({ ...inv, clientGamesPlayed: games });
          consecutiveErrors = 0;
        } catch (e: any) {
          consecutiveErrors++;
          if (consecutiveErrors >= 5) break;
        }
      }

      setInvoices(items);
    } catch (err: any) {
      console.error('Fetch market error:', err);
      setError(err.reason || err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [readContract, fxblitz, address]);

  useEffect(() => {
    if (isConnected && isArcNetwork) fetchMarket();
  }, [isConnected, isArcNetwork, fetchMarket]);

  const handleRequestFactoring = async (invoiceId: bigint) => {
    if (!contract || !offerAmount) return;
    setActionId(invoiceId);
    try {
      const amount = BigInt(Math.floor(parseFloat(offerAmount) * 10 ** 6));
      const tx = await contract.requestFactoring(invoiceId, amount);
      await tx.wait();
      setOfferAmount('');
      fetchMarket();
    } catch (err: any) {
      alert(`Error: ${err.reason || err.message}`);
    } finally {
      setActionId(null);
    }
  };

  if (!isConnected) {
    return (
      <div className="max-w-6xl mx-auto mt-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Factoring Market</h2>
        <p className="text-gray-600">Connect your wallet to browse factoring opportunities</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto mt-8">
        <h2 className="text-2xl font-bold mb-6">Factoring Market</h2>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          <p className="font-semibold">Error loading market:</p>
          <p className="text-sm">{error}</p>
          <button onClick={fetchMarket} className="btn-primary mt-3 text-sm">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Factoring Market</h2>
        <button onClick={fetchMarket} className="btn-secondary text-sm">Refresh</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
        </div>
      ) : invoices.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p>No available invoices for factoring</p>
          <p className="text-xs mt-2 text-gray-400">Create an invoice first to see it here</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {invoices.map((inv) => {
            const statusLabel = statusLabels[inv.status];
            const statusColor = statusColors[inv.status];

            return (
              <div key={String(inv.id)} className="card">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-mono text-sm text-gray-500">#{String(inv.id)}</span>
                      {statusLabel && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
                          {statusLabel}
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        Number(inv.clientGamesPlayed) >= 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        FXBlitz: {String(inv.clientGamesPlayed)} games
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 text-xs">Amount</p>
                        <p className="font-semibold">{formatUSDC(inv.amount)} USDC</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Factoring Fee</p>
                        <p className="font-semibold">{(Number(inv.factoringFee) / 100).toFixed(2)}%</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Due Date</p>
                        <p className="font-semibold">{safeDate(inv.dueDate)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Client</p>
                        <p className="font-semibold">{formatAddress(inv.client)}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{inv.metadataURI}</p>
                  </div>

                  <div className="flex flex-col gap-3 min-w-[240px]">
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="0.000001"
                        placeholder="Offer amount (USDC)"
                        className="input text-sm"
                        value={offerAmount}
                        onChange={(e) => setOfferAmount(e.target.value)}
                        disabled={actionId === inv.id}
                      />
                    </div>
                    <button
                      onClick={() => handleRequestFactoring(inv.id)}
                      disabled={actionId === inv.id || !offerAmount || Number(inv.clientGamesPlayed) < 1}
                      className="btn-primary flex items-center justify-center gap-2 text-sm"
                    >
                      {actionId === inv.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <HandCoins className="w-4 h-4" />}
                      Request Factoring
                    </button>
                    <a
                      href={`${ARC_EXPLORER}/tx/${String(inv.id)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary flex items-center justify-center gap-2 text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View on Explorer
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
