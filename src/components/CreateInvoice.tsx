import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { useInvoice } from '@/hooks/useContract';
import { parseUSDC } from '@/utils/format';
import { ARC_EXPLORER } from '@/config/contracts';
import { Loader2, CheckCircle, ExternalLink } from 'lucide-react';

export default function CreateInvoice() {
  const { signer, isConnected, isArcNetwork } = useWallet();
  const contract = useInvoice(signer);

  const [form, setForm] = useState({
    client: '',
    amount: '',
    dueDate: '',
    factoringFee: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contract || !isArcNetwork) return;

    setLoading(true);
    try {
      const dueTimestamp = Math.floor(new Date(form.dueDate).getTime() / 1000);
      const factoringFeeBps = Math.floor(parseFloat(form.factoringFee) * 100);

      const tx = await contract.createInvoice(
        form.client,
        parseUSDC(form.amount, 18),
        dueTimestamp,
        factoringFeeBps,
        form.description
      );

      setTxHash(tx.hash);
      await tx.wait();
    } catch (err: any) {
      alert(`Error: ${err.reason || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto mt-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Create Invoice</h2>
        <p className="text-gray-600">Connect your wallet to create invoices</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-6">Create New Invoice</h2>

      {txHash && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <div className="flex-1">
            <p className="text-sm text-green-800 font-medium">Invoice created successfully!</p>
            <a
              href={`${ARC_EXPLORER}/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-brand-600 hover:underline flex items-center gap-1 mt-1"
            >
              View on Explorer <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Client Address</label>
          <input
            type="text"
            required
            placeholder="0x..."
            className="input"
            value={form.client}
            onChange={(e) => setForm({ ...form, client: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (USDC)</label>
            <input
              type="number"
              step="0.000001"
              required
              placeholder="1000.00"
              className="input"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input
              type="datetime-local"
              required
              className="input"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Factoring Fee (%)</label>
          <input
            type="number"
            step="0.01"
            required
            placeholder="5.00"
            className="input"
            value={form.factoringFee}
            onChange={(e) => setForm({ ...form, factoringFee: e.target.value })}
          />
          <p className="text-xs text-gray-500 mt-1">Fee charged if invoice is factored (e.g. 5% = 500 bps)</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description / Metadata</label>
          <textarea
            required
            rows={3}
            placeholder="Invoice description..."
            className="input"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !isArcNetwork}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? 'Creating...' : 'Create Invoice'}
        </button>
      </form>
    </div>
  );
}
