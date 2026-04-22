import React, { useState } from 'react';
export function Settings() {
  const [minMediaUpload, setMinMediaUpload] = useState(4);
  const [maxVideoLength, setMaxVideoLength] = useState(7);
  const [faceVerificationRequired, setFaceVerificationRequired] = useState(true);
  const [autoRejectThreshold, setAutoRejectThreshold] = useState(3);
  const [reportAutoFlag, setReportAutoFlag] = useState(5);
  const [banAppealWindow, setBanAppealWindow] = useState(30);
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-sm font-bold text-gray-900 mb-6 uppercase tracking-wide">
            Media Requirements
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Media Upload Limit
              </label>
              <input
                type="number"
                value={minMediaUpload}
                onChange={(e) => setMinMediaUpload(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
              
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Video Length (seconds)
              </label>
              <input
                type="number"
                value={maxVideoLength}
                onChange={(e) => setMaxVideoLength(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
              
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-sm font-bold text-gray-900 mb-6 uppercase tracking-wide">
            Verification Settings
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">
                  Face Verification Required
                </div>
                <div className="text-sm text-gray-600">
                  Require all users to complete face verification
                </div>
              </div>
              <button
                onClick={() =>
                setFaceVerificationRequired(!faceVerificationRequired)
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${faceVerificationRequired ? 'bg-primary' : 'bg-gray-300'}`}>
                
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${faceVerificationRequired ? 'translate-x-6' : 'translate-x-1'}`} />
                
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Auto-reject Threshold
              </label>
              <input
                type="number"
                value={autoRejectThreshold}
                onChange={(e) => setAutoRejectThreshold(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
              
              <p className="text-sm text-gray-600 mt-1">
                Number of failed verification attempts before auto-rejection
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-sm font-bold text-gray-900 mb-6 uppercase tracking-wide">
            Safety Settings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Auto-flag Threshold
              </label>
              <input
                type="number"
                value={reportAutoFlag}
                onChange={(e) => setReportAutoFlag(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
              
              <p className="text-sm text-gray-600 mt-1">
                Number of reports before automatic flagging
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ban Appeal Window (days)
              </label>
              <input
                type="number"
                value={banAppealWindow}
                onChange={(e) => setBanAppealWindow(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
              
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-sm font-bold text-gray-900 mb-6 uppercase tracking-wide">
            Premium Features
          </h2>
          <div className="space-y-3">
            {[
            'Rewind',
            'Profile Boost',
            'Unlock Prompt',
            'Super Like',
            'Priority Queue'].
            map((feature) =>
            <div
              key={feature}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              
                <span className="font-medium text-gray-900">{feature}</span>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
                </button>
              </div>
            )}
          </div>
        </div>

        <button className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
          Save Changes
        </button>
      </div>
    </div>);

}