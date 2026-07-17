import React, { useEffect, useState } from 'react';
import { useFirebase } from './FirebaseProvider';

export const AdminDebugger: React.FC = () => {
  const { sellers, banners, promotions } = useFirebase();
  const [wallet, setWallet] = useState<any>(null);

  useEffect(() => {
    // Read wallet from localStorage
    try {
      const balance = localStorage.getItem('emakethe_wallet_balance');
      const transactions = localStorage.getItem('emakethe_wallet_transactions');
      setWallet({
        balance: balance || '0.00',
        transactions: transactions ? JSON.parse(transactions) : []
      });
    } catch (e) {
      console.error('Error reading wallet:', e);
    }
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen text-xs">
      <h1 className="text-2xl font-bold mb-6">Admin Debugger</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DataList title="Sellers (Traders)" data={sellers} />
        <DataList title="Promotions" data={promotions} />
        <DataList title="Banners" data={banners} />
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-bold text-lg mb-2">Wallet (Local Storage)</h2>
          <pre>{JSON.stringify(wallet, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
};

const DataList: React.FC<{ title: string; data: any[] }> = ({ title, data }) => (
  <div className="bg-white p-4 rounded shadow">
    <h2 className="font-bold text-lg mb-2">{title} ({data.length})</h2>
    <div className="max-h-60 overflow-y-auto">
      {data.map((item, idx) => (
        <pre key={idx} className="bg-gray-100 p-1 mb-1 rounded">{JSON.stringify(item, null, 2)}</pre>
      ))}
    </div>
  </div>
);
