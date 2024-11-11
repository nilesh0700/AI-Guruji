import React from 'react';
import { Bell, Lock, User, Globe } from 'lucide-react';

export default function Settings() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-gray-600">
          Manage your account preferences and notifications
        </p>
      </div>

      <div className="bg-white shadow-sm rounded-lg divide-y divide-gray-200">
        {/* Profile Settings */}
        <div className="p-6">
          <div className="flex items-center">
            <User className="h-5 w-5 text-gray-400" />
            <h2 className="ml-3 text-lg font-medium text-gray-900">
              Profile Settings
            </h2>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Full Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                defaultValue="John Doe"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                defaultValue="john@example.com"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="p-6">
          <div className="flex items-center">
            <Bell className="h-5 w-5 text-gray-400" />
            <h2 className="ml-3 text-lg font-medium text-gray-900">
              Notification Settings
            </h2>
          </div>
          <div className="mt-6 space-y-4">
            {['Assessment reminders', 'Progress updates', 'Career opportunities'].map(
              (item) => (
                <div key={item} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{item}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              )
            )}
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="p-6">
          <div className="flex items-center">
            <Lock className="h-5 w-5 text-gray-400" />
            <h2 className="ml-3 text-lg font-medium text-gray-900">
              Privacy Settings
            </h2>
          </div>
          <div className="mt-6 space-y-4">
            {[
              'Share assessment results with counselors',
              'Allow career recommendations',
              'Participate in research studies',
            ].map((item) => (
              <div key={item} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{item}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Language Settings */}
        <div className="p-6">
          <div className="flex items-center">
            <Globe className="h-5 w-5 text-gray-400" />
            <h2 className="ml-3 text-lg font-medium text-gray-900">
              Language Settings
            </h2>
          </div>
          <div className="mt-6">
            <label
              htmlFor="language"
              className="block text-sm font-medium text-gray-700"
            >
              Preferred Language
            </label>
            <select
              id="language"
              name="language"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option>English</option>
              <option>Hindi</option>
              <option>Spanish</option>
              <option>French</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end space-x-4">
        <button
          type="button"
          className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}