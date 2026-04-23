import React, { useEffect, useState } from 'react';
import { EyeIcon, XIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiRequest } from '../lib/api';
import { useAdminAuth } from '../context/AdminAuthContext';

type ReportItem = {
  id: number;
  reportedUser: string;
  reason: string;
  reporter: string;
  date: string;
  status: string;
  evidence: string;
  reportedUserId: number;
  relatedMediaUrl: string | null;
  relatedProgressUrl: string | null;
};

type ReportsResponse = {
  data: {
    items: ReportItem[];
  };
};

export function SafetyReports() {
  const { token } = useAdminAuth();
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionId, setActionId] = useState<number | null>(null);

  const loadReports = async () => {
    if (!token) {
      return;
    }
    setLoading(true);
    try {
      const response = await apiRequest<ReportsResponse>('/admin/reports', { token });
      setReports(response.data.items);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [token]);

  const runAction = async (reportId: number, action: 'resolve' | 'dismiss', userAction: 'none' | 'ban' | 'suspend' = 'none') => {
    if (!token) {
      return;
    }
    setActionId(reportId);
    try {
      await apiRequest(`/admin/reports/${reportId}/${action}`, {
        method: 'POST',
        token,
        body: action === 'resolve'
          ? { note: `${action}d in admin panel`, userAction }
          : { note: `${action}d in admin panel` },
      });
      await loadReports();
      setSelectedReport(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${action} report`);
    } finally {
      setActionId(null);
    }
  };

  const getReasonColor = (reason: string) => {
    switch (reason.toLowerCase()) {
      case 'abuse':
        return 'bg-red-100 text-red-700';
      case 'fake':
        return 'bg-yellow-100 text-yellow-700';
      case 'inappropriate':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Safety & Reports</h1>
      </div>

      {error ? <div className="mb-6 rounded-xl bg-rose-50 text-rose-700 px-4 py-3">{error}</div> : null}

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Reported User</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Reason</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Reporter</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="py-6 px-4 text-gray-500" colSpan={6}>Loading reports...</td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td className="py-6 px-4 text-gray-500" colSpan={6}>No reports found.</td>
                </tr>
              ) : reports.map((report) =>
                <tr
                  key={report.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-medium text-gray-900">{report.reportedUser}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getReasonColor(report.reason)}`}>
                      {report.reason}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{report.reporter}</td>
                  <td className="py-3 px-4 text-gray-600">{new Date(report.date).toLocaleDateString()}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${report.status === 'Open' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => setSelectedReport(report)}
                      className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors">
                      <EyeIcon size={16} />
                      View Evidence
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {selectedReport &&
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedReport(null)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-8 max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Report Evidence</h2>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg">
                  <XIcon size={24} />
                </button>
              </div>

              <div className="space-y-4 mb-8">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Reported User</div>
                  <div className="font-semibold text-gray-900">{selectedReport.reportedUser}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Reason</div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getReasonColor(selectedReport.reason)}`}>
                    {selectedReport.reason}
                  </span>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Evidence</div>
                  <div className="p-4 bg-gray-50 rounded-lg text-gray-900">{selectedReport.evidence}</div>
                </div>
                {selectedReport.relatedMediaUrl ? (
                  <img src={selectedReport.relatedMediaUrl} alt="Related media" className="w-40 h-40 rounded-lg object-cover" />
                ) : null}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  disabled={actionId === selectedReport.id}
                  onClick={() => runAction(selectedReport.id, 'resolve', 'ban')}
                  className="bg-red-500 text-white py-3 px-6 rounded-lg hover:bg-red-600 transition-colors font-semibold disabled:opacity-60">
                  Ban User
                </button>
                <button
                  disabled={actionId === selectedReport.id}
                  onClick={() => runAction(selectedReport.id, 'resolve', 'suspend')}
                  className="bg-orange-500 text-white py-3 px-6 rounded-lg hover:bg-orange-600 transition-colors font-semibold disabled:opacity-60">
                  Suspend User
                </button>
                <button
                  disabled={actionId === selectedReport.id}
                  onClick={() => runAction(selectedReport.id, 'dismiss')}
                  className="bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors font-semibold disabled:opacity-60">
                  Dismiss Report
                </button>
              </div>
            </motion.div>
          </motion.div>
        }
      </AnimatePresence>
    </div>);
}
