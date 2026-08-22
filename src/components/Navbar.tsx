import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '@/hooks/useWallet';
import { formatAddress } from '@/utils/format';
import { FileText, List, TrendingUp, Wallet, LogOut } from 'lucide-react';

export default function Navbar() {
  const { address, isConnected, isArcNetwork, connect, disconnect, usdcBalance } = useWallet();
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Create Invoice', icon: FileText },
    { path: '/my-invoices', label: 'My Invoices', icon: List },
    { path: '/factoring', label: 'Factoring Market', icon: TrendingUp },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xl text-gray-900 leading-tight">InvoiceForge</span>
                <span className="text-[10px] text-gray-500 leading-tight">Built on Arc Network</span>
              </div>
            </Link>
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isConnected ? (
              <>
                {!isArcNetwork && (
                  <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full">
                    Wrong Network
                  </span>
                )}
                {usdcBalance !== '0' && (
                  <span className="text-sm text-gray-600 hidden sm:block">
                    {usdcBalance} USDC
                  </span>
                )}
                <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
                  <Wallet className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium">{formatAddress(address!)}</span>
                </div>
                <button onClick={disconnect} className="p-2 text-gray-500 hover:text-red-600 transition-colors">
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button onClick={connect} className="btn-primary flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
