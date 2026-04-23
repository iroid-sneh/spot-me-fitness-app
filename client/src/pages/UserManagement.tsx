import React, { useEffect, useMemo, useState } from 'react';
import { SearchIcon, EditIcon, XIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiRequest } from '../lib/api';
import { useAdminAuth } from '../context/AdminAuthContext';

type UserListItem = {
  id: number;
  name: string;
  email: string;
  accountStatus: string;
  profileStatus: string;
  fitnessGoals: string[];
  workoutFrequency: string | null;
  trainingStyles: string[];
  dietStyle: string | null;
  createdAt: string;
  avatar: string;
};

type UserListResponse = {
  data: {
    items: UserListItem[];
  };
};

type UserDetailResponse = {
  data: {
    user: {
      id: number;
      email: string;
      accountStatus: string;
      faceVerifiedStatus: string;
      isVerified: boolean;
      profile: { full_name?: string; profile_status?: string } | null;
      fitness: {
        workout_frequency?: string | null;
        training_styles?: string[];
        diet_style?: string | null;
        fitness_goals?: string[];
      } | null;
      progress: { id: number }[];
      media: { id: number }[];
      reports: { id: number; status: string }[];
    };
  };
};

const normalizeArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item));
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.map((item) => String(item)) : [];
    } catch {
      return value ? [value] : [];
    }
  }

  return [];
};

const formatFitnessValue = (value: string | null | undefined) => {
  if (!value) {
    return 'Not set';
  }

  const normalized = value
    .replace(/_/g, ' ')
    .replace(/\bper\b/gi, 'per')
    .replace(/\bx\b/gi, 'x');

  return normalized.replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatFitnessList = (value: unknown) => {
  const items = normalizeArray(value).map((item) => formatFitnessValue(item)).filter(Boolean);
  return items.length ? items.join(', ') : 'Not set';
};

export function UserManagement() {
  const { token } = useAdminAuth();
  const [selectedUser, setSelectedUser] = useState<UserDetailResponse['data']['user'] | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusLoading, setStatusLoading] = useState<number | null>(null);

  const loadUsers = async () => {
    if (!token) {
      return;
    }
    setLoading(true);
    setError('');
    try {
      const query = searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : '';
      const response = await apiRequest<UserListResponse>(`/admin/users${query}`, { token });
      setUsers(response.data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      loadUsers();
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [searchQuery, token]);

  const openUser = async (userId: number, openEdit = false) => {
    if (!token) {
      return;
    }
    try {
      const response = await apiRequest<UserDetailResponse>(`/admin/users/${userId}`, { token });
      const user = response.data.user;
      setSelectedUser({
        ...user,
        fitness: user.fitness ? {
          ...user.fitness,
          training_styles: normalizeArray(user.fitness.training_styles),
          fitness_goals: normalizeArray(user.fitness.fitness_goals),
        } : null,
      });
      setEditModalOpen(openEdit);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user detail');
    }
  };

  const updateStatus = async (userId: number, status: string) => {
    if (!token) {
      return;
    }
    setStatusLoading(userId);
    try {
      await apiRequest(`/admin/users/${userId}/status`, {
        method: 'PATCH',
        token,
        body: { status },
      });
      await loadUsers();
      if (selectedUser?.id === userId) {
        await openUser(userId, editModalOpen);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
    } finally {
      setStatusLoading(null);
    }
  };

  const forceVerification = async (userId: number) => {
    if (!token) {
      return;
    }
    setStatusLoading(userId);
    try {
      await apiRequest(`/admin/users/${userId}/force-face-verify`, {
        method: 'POST',
        token,
      });
      await loadUsers();
      if (selectedUser?.id === userId) {
        await openUser(userId, editModalOpen);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to trigger verification');
    } finally {
      setStatusLoading(null);
    }
  };

  const filteredUsers = useMemo(() => users, [users]);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
      </div>

      {error ? <div className="mb-6 rounded-xl bg-rose-50 text-rose-700 px-4 py-3">{error}</div> : null}

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="mb-6">
          <div className="relative">
            <SearchIcon
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20} />

            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Name</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Fitness Goal</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Join Date</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="py-6 px-4 text-gray-500" colSpan={6}>Loading users...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td className="py-6 px-4 text-gray-500" colSpan={6}>No users found.</td>
                </tr>
              ) : filteredUsers.map((user) =>
                <tr
                  key={user.id}
                  className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => openUser(user.id)}>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
                        {user.avatar}
                      </div>
                      <span className="font-medium text-gray-900">{user.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{user.email}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${user.accountStatus === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {user.accountStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {formatFitnessValue(user.fitnessGoals?.[0])}
                  </td>
                  <td className="py-3 px-4 text-gray-600">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openUser(user.id, true);
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <EditIcon size={18} className="text-gray-600" />
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {selectedUser && !editModalOpen &&
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedUser(null)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Fitness Identity</h2>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg">
                  <XIcon size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Name</div>
                  <div className="font-semibold text-gray-900">{selectedUser.profile?.full_name || selectedUser.email}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Workout Frequency</div>
                  <div className="font-semibold text-gray-900">{formatFitnessValue(selectedUser.fitness?.workout_frequency)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Training Styles</div>
                  <div className="font-semibold text-gray-900">{formatFitnessList(selectedUser.fitness?.training_styles)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Diet</div>
                  <div className="font-semibold text-gray-900">{formatFitnessValue(selectedUser.fitness?.diet_style)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Fitness Goal</div>
                  <div className="font-semibold text-gray-900">{formatFitnessList(selectedUser.fitness?.fitness_goals)}</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        }

        {editModalOpen && selectedUser &&
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setEditModalOpen(false)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-8 max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Manage User</h2>
                  <p className="text-gray-600 mt-1">Review account state and trigger moderation actions.</p>
                </div>
                <button
                  onClick={() => setEditModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg">
                  <XIcon size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border border-gray-200 p-4">
                    <div className="text-sm text-gray-500">Email</div>
                    <div className="font-semibold text-gray-900">{selectedUser.email}</div>
                  </div>
                  <div className="rounded-lg border border-gray-200 p-4">
                    <div className="text-sm text-gray-500">Face Verification</div>
                    <div className="font-semibold text-gray-900">{selectedUser.faceVerifiedStatus}</div>
                  </div>
                  <div className="rounded-lg border border-gray-200 p-4">
                    <div className="text-sm text-gray-500">Media</div>
                    <div className="font-semibold text-gray-900">{selectedUser.media.length}</div>
                  </div>
                  <div className="rounded-lg border border-gray-200 p-4">
                    <div className="text-sm text-gray-500">Reports</div>
                    <div className="font-semibold text-gray-900">{selectedUser.reports.length}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {['active', 'flagged', 'inactive', 'banned'].map((status) => (
                    <button
                      key={status}
                      onClick={() => updateStatus(selectedUser.id, status)}
                      disabled={statusLoading === selectedUser.id}
                      className="px-4 py-3 rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors disabled:opacity-60"
                    >
                      Set {status}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => forceVerification(selectedUser.id)}
                  disabled={statusLoading === selectedUser.id}
                  className="w-full px-4 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
                >
                  Trigger Face Re-verification
                </button>
              </div>
            </motion.div>
          </motion.div>
        }
      </AnimatePresence>
    </div>);
}
