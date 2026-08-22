import { Routes, Route } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import CreateInvoice from '@/components/CreateInvoice';
import MyInvoices from '@/components/MyInvoices';
import FactoringMarket from '@/components/FactoringMarket';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <Routes>
          <Route path="/" element={<CreateInvoice />} />
          <Route path="/my-invoices" element={<MyInvoices />} />
          <Route path="/factoring" element={<FactoringMarket />} />
        </Routes>
      </main>
    </div>
  );
}
