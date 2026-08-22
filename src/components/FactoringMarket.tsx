import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { useInvoice, useFXBlitz } from '@/hooks/useContract';
import { BrowserProvider, Contract } from 'ethers';
import { formatUSDC, formatAddress, statusLabels, statusColors, ARC_EXPLORER } from '@/utils/format';
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

export default function FactoringMarket() {
  const { address, signer, provider, isConnected, isArcNetwork } = useWallet();
  const contract = useInvoice(signer);
  const readContract = useInvoice(provider);
  const fxblitz = useFXBlitz(provider);

  const [invoices, setInvoices] = useState<MarketInvoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState<bigint | null>(null);
  const [offerAmount, setOfferAmount] = useState('');
  const [usdcDecimals, setUsdcDecimals] = useState(18);

  const fetchMarket = useCallback(async () => {
    if (!readContract || !fxblitz || !address) return;
    setLoading(true);
    try {
      const items: MarketInvoice[] = [];

      for (let i = 1; i <= 100; i++) {
        try {
          const inv = await readContract.getInvoice(BigInt(i));
          if (inv.status !== 0) continue;
          if (inv.issuer.toLowerCase() === address.toLowerCase()) continue;
          if (inv.client.toLowerCase() === address.toLowerCase()) continue;

          const games = await fxblitz.gamesPlayed(inv.client);

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
            clientGamesPlayed: games,
          });
        } catch {
          break;
        }
      }

      setInvoices(items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [readContract, fxblitz, address]);

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
    if (isConnected && isArcNetwork) fetchMarket();
  }, [isConnected, isArcNetwork, fetchMarket]);

  const handleRequestFactoring = async (invoiceId: bigint) => {
    if (!contract || !offerAmount) return;
    setActionId(invoiceId);
    try {
      const decimals = usdcDecimals;
      const amount = BigInt(Math.floor(parseFloat(offerAmount) * 10 ** decimals));
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

  return (
    <div className="max-w-6xl mx-auto mt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Factoring Market</h2>
        <button onClick={fetchMarket} className="btn-secondary text-sm">
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
        </div>
      ) : invoices.length === 0 ? (
        <div className="text-center py-20 text-gray-500">No available invoices for factoring</div>
      ) : (
        <div className="grid gap-4">
          {invoices.map((inv) => (
            <div key={String(inv.id)} className="card">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono text-sm text-gray-500">#{String(inv.id)}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[inv.status]}`}>
                      {statusLabels[inv.status]}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      Number(inv.clientGamesPlayed) >= 1
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      FXBlitz: {String(inv.clientGamesPlayed)} games
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 text-xs">Amount</p>
                      <p className="font-semibold">{formatUSDC(inv.amount, usdcDecimals)} USDC</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Factoring Fee</p>
                      <p className="font-semibold">{(Number(inv.factoringFee) / 100).toFixed(2)}%</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Due Date</p>
                      <p className="font-semibold">{new Date(Number(inv.dueDate) * 1000).toLocaleDateString()}</p>
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
                    {actionId === inv.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <HandCoins className="w-4 h-4" />
                    )}
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
          ))}
        </div>
      )}
    </div>
  );
}
