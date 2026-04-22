import React, { useState } from 'react';
import { EyeIcon, XIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
interface Report {
  id: string;
  reportedUser: string;
  reason: 'Abuse' | 'Fake' | 'Inappropriate';
  reporter: string;
  date: string;
  status: 'Open' | 'Resolved';
  evidence: string;
}
const mockReports: Report[] = [
{
  id: '1',
  reportedUser: 'John Doe',
  reason: 'Inappropriate',
  reporter: 'Sarah Johnson',
  date: '2024-03-15',
  status: 'Open',
  evidence: 'Inappropriate messages sent in chat'
},
{
  id: '2',
  reportedUser: 'Jane Smith',
  reason: 'Fake',
  reporter: 'Mike Chen',
  date: '2024-03-14',
  status: 'Open',
  evidence: 'Profile photos appear to be stock images'
},
{
  id: '3',
  reportedUser: 'Bob Wilson',
  reason: 'Abuse',
  reporter: 'Emma Davis',
  date: '2024-03-14',
  status: 'Open',
  evidence: 'Harassment and threatening language'
},
{
  id: '4',
  reportedUser: 'Alice Brown',
  reason: 'Inappropriate',
  reporter: 'James Wilson',
  date: '2024-03-13',
  status: 'Resolved',
  evidence: 'Inappropriate content in profile'
},
{
  id: '5',
  reportedUser: 'Tom Green',
  reason: 'Fake',
  reporter: 'Lisa Anderson',
  date: '2024-03-13',
  status: 'Open',
  evidence: 'Suspicious profile information'
},
{
  id: '6',
  reportedUser: 'Mary White',
  reason: 'Abuse',
  reporter: 'David Martinez',
  date: '2024-03-12',
  status: 'Resolved',
  evidence: 'Verbal abuse in messages'
}];

export function SafetyReports() {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const getReasonColor = (reason: string) => {
    switch (reason) {
      case 'Abuse':
        return 'bg-red-100 text-red-700';
      case 'Fake':
        return 'bg-yellow-100 text-yellow-700';
      case 'Inappropriate':
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

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Reported User
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Reason
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Reporter
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Date
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {mockReports.map((report) =>
              <tr
                key={report.id}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                
                  <td className="py-3 px-4 font-medium text-gray-900">
                    {report.reportedUser}
                  </td>
                  <td className="py-3 px-4">
                    <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getReasonColor(report.reason)}`}>
                    
                      {report.reason}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{report.reporter}</td>
                  <td className="py-3 px-4 text-gray-600">{report.date}</td>
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
          initial={{
            opacity: 0
          }}
          animate={{
            opacity: 1
          }}
          exit={{
            opacity: 0
          }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedReport(null)}>
          
            <motion.div
            initial={{
              scale: 0.9,
              opacity: 0
            }}
            animate={{
              scale: 1,
              opacity: 1
            }}
            exit={{
              scale: 0.9,
              opacity: 0
            }}
            className="bg-white rounded-xl p-8 max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}>
            
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Report Evidence
                </h2>
                <button
                onClick={() => setSelectedReport(null)}
                className="p-2 hover:bg-gray-100 rounded-lg">
                
                  <XIcon size={24} />
                </button>
              </div>

              <div className="space-y-4 mb-8">
                <div>
                  <div className="text-sm text-gray-600 mb-1">
                    Reported User
                  </div>
                  <div className="font-semibold text-gray-900">
                    {selectedReport.reportedUser}
                  </div>
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
                  <div className="p-4 bg-gray-50 rounded-lg text-gray-900">
                    {selectedReport.evidence}
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button className="flex-1 bg-red-500 text-white py-3 px-6 rounded-lg hover:bg-red-600 transition-colors font-semibold">
                  Ban User
                </button>
                <button className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors font-semibold">
                  Dismiss Report
                </button>
              </div>
            </motion.div>
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}