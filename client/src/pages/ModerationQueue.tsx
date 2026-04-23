import React, { useEffect, useMemo, useState } from 'react';
import { CheckIcon, XIcon } from 'lucide-react';
import { apiRequest } from '../lib/api';
import { useAdminAuth } from '../context/AdminAuthContext';

type MediaType = 'profile_photo' | 'video' | 'fitness' | 'progress';

type MediaItem = {
  id: number;
  userName: string;
  type: string;
  thumbnail: string | null;
  status: string;
  flaggedBy: string;
};

type QueueResponse = {
  data: {
    items: MediaItem[];
  };
};

export function ModerationQueue() {
  const { token } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<MediaType>('profile_photo');
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionId, setActionId] = useState<number | null>(null);

  const loadQueue = async () => {
    if (!token) {
      return;
    }
    setLoading(true);
    try {
      const response = await apiRequest<QueueResponse>('/admin/media/queue', { token });
      setItems(response.data.items);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load moderation queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, [token]);

  const filteredMedia = useMemo(() => items.filter((item) => {
    if (activeTab === 'profile_photo') return item.type === 'profile_photo';
    if (activeTab === 'video') return item.type === 'video';
    if (activeTab === 'fitness') return item.type === 'fitness';
    if (activeTab === 'progress') return item.type === 'progress';
    return true;
  }), [activeTab, items]);

  const runAction = async (queueId: number, action: 'approve' | 'reject') => {
    if (!token) {
      return;
    }
    setActionId(queueId);
    try {
      await apiRequest(`/admin/media/${queueId}/${action}`, {
        method: 'POST',
        token,
        body: { note: `${action}d in admin panel` },
      });
      await loadQueue();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${action} media`);
    } finally {
      setActionId(null);
    }
  };

  const tabs = [
    { id: 'profile_photo' as MediaType, label: 'Main Profile Photos' },
    { id: 'video' as MediaType, label: 'Short Videos (7s)' },
    { id: 'fitness' as MediaType, label: 'Fitness Requirement Media' },
    { id: 'progress' as MediaType, label: 'Progress Captures' }];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Moderation Queue</h1>
      </div>

      {error ? <div className="mb-6 rounded-xl bg-rose-50 text-rose-700 px-4 py-3">{error}</div> : null}

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex gap-2 mb-8 border-b border-gray-200 overflow-auto">
          {tabs.map((tab) =>
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-medium transition-colors relative whitespace-nowrap ${activeTab === tab.id ? 'text-primary' : 'text-gray-600 hover:text-gray-900'}`}>
              {tab.label}
              {activeTab === tab.id &&
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              }
            </button>
          )}
        </div>

        {loading ? <div className="text-gray-500">Loading queue...</div> : null}

        {!loading && filteredMedia.length === 0 ? (
          <div className="text-gray-500">No moderation items for this category.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMedia.map((item) =>
              <div key={item.id} className="group relative">
                <div className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                  {item.thumbnail ? (
                    <img
                      src={item.thumbnail}
                      alt={item.userName}
                      className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No preview</div>
                  )}
                </div>
                <div className="mt-3 mb-3">
                  <div className="font-medium text-gray-900">{item.userName}</div>
                  <div className="text-sm text-gray-500">Flagged by {item.flaggedBy}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    disabled={actionId === item.id}
                    onClick={() => runAction(item.id, 'approve')}
                    className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                    <CheckIcon size={18} />
                    Approve
                  </button>
                  <button
                    disabled={actionId === item.id}
                    onClick={() => runAction(item.id, 'reject')}
                    className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                    <XIcon size={18} />
                    Reject
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>);
}
