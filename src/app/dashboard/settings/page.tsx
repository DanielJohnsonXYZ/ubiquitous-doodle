'use client';

import { useState } from 'react';
import { Save, Bell, Mail, Clock, Shield } from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    emailDigest: true,
    digestTime: '08:00',
    digestEmail: '',
    slackNotifications: false,
    riskThreshold: 40,
    opportunityAlerts: true,
    weeklyReport: false,
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // TODO: Save settings to Supabase
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  return (
    <div className="p-4 pt-16 lg:p-8 lg:pt-8 max-w-3xl">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1 text-sm lg:text-base">Configure your relationship intelligence preferences</p>
      </div>

      <div className="space-y-8">
        {/* Notifications */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-blue-100">
              <Bell className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
              <p className="text-sm text-gray-500">How you want to be notified about insights</p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Email Digest</p>
                <p className="text-sm text-gray-500">Receive a daily summary via email</p>
              </div>
              <input
                type="checkbox"
                checked={settings.emailDigest}
                onChange={(e) => setSettings({ ...settings, emailDigest: e.target.checked })}
                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </label>

            {settings.emailDigest && (
              <div className="pl-4 border-l-2 border-gray-100 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={settings.digestEmail}
                    onChange={(e) => setSettings({ ...settings, digestEmail: e.target.value })}
                    placeholder="your@email.com"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Time
                  </label>
                  <input
                    type="time"
                    value={settings.digestTime}
                    onChange={(e) => setSettings({ ...settings, digestTime: e.target.value })}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            <label className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Opportunity Alerts</p>
                <p className="text-sm text-gray-500">Get notified when opportunities are detected</p>
              </div>
              <input
                type="checkbox"
                checked={settings.opportunityAlerts}
                onChange={(e) => setSettings({ ...settings, opportunityAlerts: e.target.checked })}
                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Weekly Report</p>
                <p className="text-sm text-gray-500">Receive a weekly summary every Monday</p>
              </div>
              <input
                type="checkbox"
                checked={settings.weeklyReport}
                onChange={(e) => setSettings({ ...settings, weeklyReport: e.target.checked })}
                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </label>
          </div>
        </div>

        {/* Risk Settings */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-red-100">
              <Shield className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Risk Detection</h2>
              <p className="text-sm text-gray-500">Configure when clients are flagged as at-risk</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Health Score Threshold
            </label>
            <p className="text-sm text-gray-500 mb-4">
              Clients with a health score below this value will be marked as "at risk"
            </p>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="10"
                max="70"
                value={settings.riskThreshold}
                onChange={(e) => setSettings({ ...settings, riskThreshold: parseInt(e.target.value) })}
                className="flex-1"
              />
              <span className="text-lg font-semibold text-gray-900 w-12">
                {settings.riskThreshold}%
              </span>
            </div>
          </div>
        </div>

        {/* Analysis Settings */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-purple-100">
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Analysis</h2>
              <p className="text-sm text-gray-500">Configure how communications are analyzed</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Analysis Frequency
              </label>
              <select className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="realtime">Real-time (as messages arrive)</option>
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lookback Period
              </label>
              <select className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="7">Last 7 days</option>
                <option value="14">Last 14 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </select>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
