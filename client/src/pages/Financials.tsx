import React, { useEffect, useState } from 'react';
import {
  DollarSignIcon,
  CreditCardIcon,
  ShoppingBagIcon,
  TrendingUpIcon } from
'lucide-react';
import { apiRequest } from '../lib/api';
import { useAdminAuth } from '../context/AdminAuthContext';

type Transaction = {
  id: string;
  userName: string;
  type: 'Premium Subscription' | 'One-Time Purchase';
  item: string;
  amount: string;
  date: string;
};

type FinancialsResponse = {
  data: {
    stats: { label: string; value: string | number }[];
    transactions: Transaction[];
  };
};

const icons = [DollarSignIcon, CreditCardIcon, ShoppingBagIcon, TrendingUpIcon];

export function Financials() {
  const { token } = useAdminAuth();
  const [data, setData] = useState<FinancialsResponse['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      return;
    }
    apiRequest<FinancialsResponse>('/admin/financials/overview', { token })
      .then((response) => setData(response.data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load financials'))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Financials & Purchases</h1>
      </div>

      {error ? <div className="mb-6 rounded-xl bg-rose-50 text-rose-700 px-4 py-3">{error}</div> : null}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {(data?.stats || []).map((stat, index) => {
          const Icon = icons[index] || DollarSignIcon;
          return (
            <div key={stat.label} className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Icon className="text-primary" size={24} />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {loading ? '...' : stat.value}
              </div>
              <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
            </div>);
        })}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Recent Transactions</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">User</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Type</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Item</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="py-6 px-4 text-gray-500" colSpan={5}>Loading transactions...</td>
                </tr>
              ) : !data?.transactions.length ? (
                <tr>
                  <td className="py-6 px-4 text-gray-500" colSpan={5}>No transactions available.</td>
                </tr>
              ) : data.transactions.map((transaction) =>
                <tr
                  key={transaction.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-medium text-gray-900">{transaction.userName}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${transaction.type === 'Premium Subscription' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {transaction.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{transaction.item}</td>
                  <td className="py-3 px-4 font-semibold text-gray-900">{transaction.amount}</td>
                  <td className="py-3 px-4 text-gray-600">{new Date(transaction.date).toLocaleDateString()}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>);
}
