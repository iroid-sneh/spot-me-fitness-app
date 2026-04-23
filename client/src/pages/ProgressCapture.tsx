import React, { useEffect, useState } from 'react';
import { CheckIcon, XIcon } from 'lucide-react';
import { apiRequest } from '../lib/api';
import { useAdminAuth } from '../context/AdminAuthContext';

type ProgressItem = {
  id: number;
  userName: string;
  avatar: string;
  thumbnail: string | null;
  timestamp: string;
  workoutType: string | null;
  badgeGranted: boolean;
  status: string;
  caption: string | null;
  rawVerified: boolean;
};

type ProgressResponse = {
  data: {
    items: ProgressItem[];
  };
};

export function ProgressCapture() {
  const { token } = useAdminAuth();
  const [items, setItems] = useState<ProgressItem[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);

  const loadProgress = async () => {
    if (!token) {
      return;
    }
    setLoading(true);
    try {
      const response = await apiRequest<ProgressResponse>('/admin/progress/reviews', { token });
      setItems(response.data.items);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load progress captures');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProgress();
  }, [token]);

  const runAction = async (id: number, action: 'approve' | 'reject') => {
    if (!token) {
      return;
    }
    setActionId(id);
    try {
      await apiRequest(`/admin/progress/${id}/${action}`, {
        method: 'POST',
        token,
        body: { note: `${action}d in admin review` },
      });
      await loadProgress();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${action} progress capture`);
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Progress Capture Review
        </h1>
        <p className="text-gray-600 mt-1">
          Review in-app only captures and validate badge-eligible activity
        </p>
      </div>

      {error ? <div className="mb-6 rounded-xl bg-rose-50 text-rose-700 px-4 py-3">{error}</div> : null}

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="space-y-4">
          {loading ? <div className="text-gray-500">Loading progress captures...</div> : null}
          {!loading && items.length === 0 ? <div className="text-gray-500">No progress captures available.</div> : null}
          {items.map((item) =>
            <div
              key={item.id}
              className="flex flex-col xl:flex-row xl:items-center gap-6 p-4 border border-gray-200 rounded-lg hover:border-primary/50 transition-colors">
              <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center font-semibold text-lg">
                {item.avatar}
              </div>

              <div className="flex-1">
                <div className="font-semibold text-gray-900">{item.userName}</div>
                <div className="text-sm text-gray-600">{item.timestamp}</div>
                <div className="text-sm text-gray-500 mt-1">{item.caption || 'No caption'}</div>
              </div>

              <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100">
                {item.thumbnail ? (
                  <img
                    src={item.thumbnail}
                    alt="Progress capture"
                    className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No preview</div>
                )}
              </div>

              <div className="w-48">
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  {item.workoutType || 'Unknown workout'}
                </span>
                <div className="text-xs text-gray-500 mt-3">
                  Review: {item.status} | Badge: {item.badgeGranted ? 'active' : 'inactive'} | Raw verified: {item.rawVerified ? 'yes' : 'no'}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => runAction(item.id, 'approve')}
                  disabled={actionId === item.id}
                  className="inline-flex items-center gap-2 rounded-lg bg-green-500 px-4 py-3 text-white font-semibold hover:bg-green-600 disabled:opacity-60">
                  <CheckIcon size={18} />
                  Approve
                </button>
                <button
                  onClick={() => runAction(item.id, 'reject')}
                  disabled={actionId === item.id}
                  className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-4 py-3 text-white font-semibold hover:bg-red-600 disabled:opacity-60">
                  <XIcon size={18} />
                  Reject
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>);
}
