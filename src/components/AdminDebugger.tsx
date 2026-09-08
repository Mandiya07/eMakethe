import React, { useEffect, useState } from 'react';
import { useFirebase } from './FirebaseProvider';

export const AdminDebugger: React.FC = () => {
  const { sellers, banners, promotions, transactions } = useFirebase();

  return (
    <div className="p-6 bg-gray-50 min-h-screen text-xs">
      <h1 className="text-2xl font-bold mb-6">Admin Debugger</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DataList title="Sellers (Traders)" data={sellers} />
        <DataList title="Promotions" data={promotions} />
        <DataList title="Banners" data={banners} />
        <DataList title="Transactions Ledger (Firestore)" data={transactions} />
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
