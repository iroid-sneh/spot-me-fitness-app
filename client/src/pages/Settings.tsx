import React, { useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';
import { useAdminAuth } from '../context/AdminAuthContext';

type SettingsShape = {
  minMediaUpload: number;
  maxVideoLength: number;
  faceVerificationRequired: boolean;
  autoRejectThreshold: number;
  reportAutoFlag: number;
  banAppealWindow: number;
  premiumFeatures: {
    rewind: boolean;
    profileBoost: boolean;
    unlockPrompt: boolean;
    superLike: boolean;
    priorityQueue: boolean;
  };
};

type SettingsResponse = {
  data: {
    settings: SettingsShape;
  };
};

export function Settings() {
  const { token } = useAdminAuth();
  const [settings, setSettings] = useState<SettingsShape | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadSettings = async () => {
    if (!token) {
      return;
    }
    setLoading(true);
    try {
      const response = await apiRequest<SettingsResponse>('/admin/settings', { token });
      setSettings(response.data.settings);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, [token]);

  const saveSettings = async () => {
    if (!token || !settings) {
      return;
    }
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const response = await apiRequest<SettingsResponse>('/admin/settings', {
        method: 'PUT',
        token,
        body: settings,
      });
      setSettings(response.data.settings);
      setMessage('Settings saved.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const toggleFeature = (key: keyof SettingsShape['premiumFeatures']) => {
    if (!settings) return;
    setSettings({
      ...settings,
      premiumFeatures: {
        ...settings.premiumFeatures,
        [key]: !settings.premiumFeatures[key],
      },
    });
  };

  if (loading || !settings) {
    return <div className="p-8 text-gray-500">Loading settings...</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
      </div>

      {error ? <div className="mb-6 rounded-xl bg-rose-50 text-rose-700 px-4 py-3">{error}</div> : null}
      {message ? <div className="mb-6 rounded-xl bg-emerald-50 text-emerald-700 px-4 py-3">{message}</div> : null}

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
                value={settings.minMediaUpload}
                onChange={(e) => setSettings({ ...settings, minMediaUpload: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Video Length (seconds)
              </label>
              <input
                type="number"
                value={settings.maxVideoLength}
                onChange={(e) => setSettings({ ...settings, maxVideoLength: Number(e.target.value) })}
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
                  setSettings({ ...settings, faceVerificationRequired: !settings.faceVerificationRequired })
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.faceVerificationRequired ? 'bg-primary' : 'bg-gray-300'}`}>
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.faceVerificationRequired ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Auto-reject Threshold
              </label>
              <input
                type="number"
                value={settings.autoRejectThreshold}
                onChange={(e) => setSettings({ ...settings, autoRejectThreshold: Number(e.target.value) })}
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
                value={settings.reportAutoFlag}
                onChange={(e) => setSettings({ ...settings, reportAutoFlag: Number(e.target.value) })}
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
                value={settings.banAppealWindow}
                onChange={(e) => setSettings({ ...settings, banAppealWindow: Number(e.target.value) })}
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
              ['rewind', 'Rewind'],
              ['profileBoost', 'Profile Boost'],
              ['unlockPrompt', 'Unlock Prompt'],
              ['superLike', 'Super Like'],
              ['priorityQueue', 'Priority Queue'],
            ].map(([key, label]) =>
              <div
                key={key}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <span className="font-medium text-gray-900">{label}</span>
                <button
                  onClick={() => toggleFeature(key as keyof SettingsShape['premiumFeatures'])}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${settings.premiumFeatures[key as keyof SettingsShape['premiumFeatures']] ? 'bg-primary' : 'bg-gray-300'}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white ${settings.premiumFeatures[key as keyof SettingsShape['premiumFeatures']] ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={saveSettings}
          disabled={saving}
          className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>);
}
