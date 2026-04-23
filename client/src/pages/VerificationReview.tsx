import React, { useEffect, useState } from 'react';
import { CheckIcon, XIcon } from 'lucide-react';
import { apiRequest } from '../lib/api';
import { useAdminAuth } from '../context/AdminAuthContext';

type VerificationItem = {
  id: number;
  userName: string;
  livePhoto: string | null;
  profilePhoto: string | null;
  submittedDate: string;
  status: string;
  result: string;
  attemptCount: number;
  reason: string | null;
};

type VerificationResponse = {
  data: {
    items: VerificationItem[];
  };
};

export function VerificationReview() {
  const { token } = useAdminAuth();
  const [items, setItems] = useState<VerificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionId, setActionId] = useState<number | null>(null);

  const loadItems = async () => {
    if (!token) {
      return;
    }
    setLoading(true);
    try {
      const response = await apiRequest<VerificationResponse>('/admin/verifications', { token });
      setItems(response.data.items);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load verifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, [token]);

  const runAction = async (id: number, action: 'approve' | 'reject') => {
    if (!token) {
      return;
    }
    setActionId(id);
    try {
      await apiRequest(`/admin/verifications/${id}/${action}`, {
        method: 'POST',
        token,
        body: { note: `${action}d by admin` },
      });
      await loadItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${action} verification`);
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Verification Review
        </h1>
      </div>

      {error ? <div className="mb-6 rounded-xl bg-rose-50 text-rose-700 px-4 py-3">{error}</div> : null}

      <div className="space-y-6">
        {loading ? <div className="text-gray-500">Loading verification reviews...</div> : null}
        {!loading && items.length === 0 ? <div className="text-gray-500">No verification reviews available.</div> : null}

        {items.map((item) =>
          <div key={item.id} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{item.userName}</h3>
                <p className="text-sm text-gray-600">
                  Submitted: {new Date(item.submittedDate).toLocaleDateString()} | Result: {item.result} | Attempts: {item.attemptCount}
                </p>
              </div>
              <div className="text-sm text-gray-500">{item.reason || 'Manual review pending'}</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm font-semibold text-gray-700 mb-3">
                  Live Face Verification
                </div>
                <div className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                  {item.livePhoto ? (
                    <img
                      src={item.livePhoto}
                      alt="Live verification"
                      className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No live image</div>
                  )}
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold text-gray-700 mb-3">
                  Main Profile Photo
                </div>
                <div className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                  {item.profilePhoto ? (
                    <img
                      src={item.profilePhoto}
                      alt="Profile photo"
                      className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No profile photo</div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                disabled={actionId === item.id}
                onClick={() => runAction(item.id, 'approve')}
                className="flex-1 bg-green-500 text-white py-3 px-6 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2 font-semibold disabled:opacity-60">
                <CheckIcon size={20} />
                Verify
              </button>
              <button
                disabled={actionId === item.id}
                onClick={() => runAction(item.id, 'reject')}
                className="flex-1 bg-red-500 text-white py-3 px-6 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2 font-semibold disabled:opacity-60">
                <XIcon size={20} />
                Reject / Request Re-verify
              </button>
            </div>
          </div>
        )}
      </div>
    </div>);
}
