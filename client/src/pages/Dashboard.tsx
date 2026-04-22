import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer } from
'recharts';
import {
  TrendingUpIcon,
  UsersIcon,
  CreditCardIcon,
  AlertCircleIcon,
  HeartIcon } from
'lucide-react';
const userGrowthData = [
{
  month: 'Jan',
  users: 18500
},
{
  month: 'Feb',
  users: 19800
},
{
  month: 'Mar',
  users: 21200
},
{
  month: 'Apr',
  users: 22800
},
{
  month: 'May',
  users: 23900
},
{
  month: 'Jun',
  users: 24580
}];

const premiumFeaturesData = [
{
  feature: 'Rewind',
  count: 4200
},
{
  feature: 'Profile Boost',
  count: 3800
},
{
  feature: 'Unlock Prompt',
  count: 3200
},
{
  feature: 'Super Like',
  count: 5100
},
{
  feature: 'Priority Queue',
  count: 2900
}];

const stats = [
{
  label: 'Total Users',
  value: '24,580',
  change: '+12.5%',
  icon: UsersIcon,
  positive: true
},
{
  label: 'Active Now',
  value: '1,247',
  change: '+8.2%',
  icon: TrendingUpIcon,
  positive: true
},
{
  label: 'Premium Conversions',
  value: '18.4%',
  change: '+3.1%',
  icon: CreditCardIcon,
  positive: true
},
{
  label: 'Reports Pending',
  value: '23',
  change: '-15%',
  icon: AlertCircleIcon,
  positive: true
}];

export function Dashboard() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Navigate through interactive dashboards to uncover trends and optimize
          operations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon className="text-primary" size={24} />
                </div>
                <span
                  className={`text-sm font-medium ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>
                  
                  {stat.change}
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
            </div>);

        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-6">User Growth</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="users"
                stroke="#25c5a5"
                strokeWidth={3}
                dot={{
                  fill: '#25c5a5',
                  r: 4
                }} />
              
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-6">
            Most Used Premium Features
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={premiumFeaturesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="feature" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip />
              <Bar dataKey="count" fill="#25c5a5" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <HeartIcon className="text-primary" size={32} />
          </div>
          <div>
            <div className="text-sm text-gray-600">
              Average Compatibility Score
            </div>
            <div className="text-4xl font-bold text-gray-900">72%</div>
            <div className="text-sm text-green-600 font-medium">
              +5% from last month
            </div>
          </div>
        </div>
      </div>
    </div>);

}