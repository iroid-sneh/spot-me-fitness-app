import React from 'react';
import {
  DollarSignIcon,
  CreditCardIcon,
  ShoppingBagIcon,
  TrendingUpIcon } from
'lucide-react';
interface Transaction {
  id: string;
  userName: string;
  type: 'Premium Subscription' | 'One-Time Purchase';
  item: string;
  amount: string;
  date: string;
}
const mockTransactions: Transaction[] = [
{
  id: '1',
  userName: 'Sarah Johnson',
  type: 'Premium Subscription',
  item: 'Monthly Premium',
  amount: '$9.99',
  date: '2024-03-15'
},
{
  id: '2',
  userName: 'Mike Chen',
  type: 'One-Time Purchase',
  item: 'Rewind Pack (5x)',
  amount: '$4.99',
  date: '2024-03-15'
},
{
  id: '3',
  userName: 'Emma Davis',
  type: 'One-Time Purchase',
  item: 'Profile Boost',
  amount: '$2.99',
  date: '2024-03-14'
},
{
  id: '4',
  userName: 'James Wilson',
  type: 'Premium Subscription',
  item: 'Annual Premium',
  amount: '$89.99',
  date: '2024-03-14'
},
{
  id: '5',
  userName: 'Lisa Anderson',
  type: 'One-Time Purchase',
  item: 'Unlock Prompt',
  amount: '$1.99',
  date: '2024-03-14'
},
{
  id: '6',
  userName: 'David Martinez',
  type: 'Premium Subscription',
  item: 'Monthly Premium',
  amount: '$9.99',
  date: '2024-03-13'
},
{
  id: '7',
  userName: 'Rachel Kim',
  type: 'One-Time Purchase',
  item: 'Super Like Pack (10x)',
  amount: '$7.99',
  date: '2024-03-13'
},
{
  id: '8',
  userName: 'Tom Brown',
  type: 'One-Time Purchase',
  item: 'Priority Queue',
  amount: '$3.99',
  date: '2024-03-12'
},
{
  id: '9',
  userName: 'Amy White',
  type: 'Premium Subscription',
  item: 'Monthly Premium',
  amount: '$9.99',
  date: '2024-03-12'
},
{
  id: '10',
  userName: 'Chris Lee',
  type: 'One-Time Purchase',
  item: 'Profile Boost',
  amount: '$2.99',
  date: '2024-03-11'
}];

const stats = [
{
  label: 'Total Revenue',
  value: '$124,580',
  icon: DollarSignIcon
},
{
  label: 'Premium Subscriptions',
  value: '2,847',
  icon: CreditCardIcon
},
{
  label: 'One-Time Purchases',
  value: '8,234',
  icon: ShoppingBagIcon
},
{
  label: 'Avg Revenue Per User',
  value: '$12.45',
  icon: TrendingUpIcon
}];

export function Financials() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Financials & Purchases
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Icon className="text-primary" size={24} />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
            </div>);

        })}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6">
          Recent Transactions
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  User
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Type
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Item
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Amount
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {mockTransactions.map((transaction) =>
              <tr
                key={transaction.id}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                
                  <td className="py-3 px-4 font-medium text-gray-900">
                    {transaction.userName}
                  </td>
                  <td className="py-3 px-4">
                    <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${transaction.type === 'Premium Subscription' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                    
                      {transaction.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {transaction.item}
                  </td>
                  <td className="py-3 px-4 font-semibold text-gray-900">
                    {transaction.amount}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {transaction.date}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>);

}