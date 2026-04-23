import React, { useEffect, useState } from 'react';
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
import { apiRequest } from '../lib/api';
import { useAdminAuth } from '../context/AdminAuthContext';

type DashboardResponse = {
  data: {
    stats: { label: string; value: string | number; change: string; positive: boolean }[];
    userGrowth: { month: string; users: number }[];
    premiumFeatures: { feature: string; count: number }[];
    queues: {
      pendingVerifications: number;
      pendingMediaReviews: number;
      pendingReports: number;
      pendingProgressReviews: number;
    };
    health: {
      verifiedUsers: number;
      totalUsers: number;
    };
  };
};

const icons = [UsersIcon, TrendingUpIcon, CreditCardIcon, AlertCircleIcon];

export function Dashboard() {
  const { token } = useAdminAuth();
  const [data, setData] = useState<DashboardResponse['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      return;
    }

    apiRequest<DashboardResponse>('/admin/dashboard/overview', { token })
      .then((response) => setData(response.data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, [token]);

  const compatibility = data?.health.totalUsers
    ? Math.round((data.health.verifiedUsers / data.health.totalUsers) * 100)
    : 0;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Live admin overview connected to backend metrics, moderation queues, and purchase data.
        </p>
      </div>

      {error ? <div className="mb-6 rounded-xl bg-rose-50 text-rose-700 px-4 py-3">{error}</div> : null}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {(data?.stats || []).map((stat, index) => {
          const Icon = icons[index] || UsersIcon;
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
                {loading ? '...' : stat.value}
              </div>
              <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-6">User Growth</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data?.userGrowth || []}>
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
            <BarChart data={data?.premiumFeatures || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="feature" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip />
              <Bar dataKey="count" fill="#25c5a5" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <HeartIcon className="text-primary" size={32} />
            </div>
            <div>
              <div className="text-sm text-gray-600">
                Verified User Ratio
              </div>
              <div className="text-4xl font-bold text-gray-900">{compatibility}%</div>
              <div className="text-sm text-green-600 font-medium">
                based on total vs verified users
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Pending Queues</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Verification reviews</span>
              <span className="font-semibold text-gray-900">{data?.queues.pendingVerifications || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Media moderation</span>
              <span className="font-semibold text-gray-900">{data?.queues.pendingMediaReviews || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Reports</span>
              <span className="font-semibold text-gray-900">{data?.queues.pendingReports || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Progress reviews</span>
              <span className="font-semibold text-gray-900">{data?.queues.pendingProgressReviews || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>);
}
