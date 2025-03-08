

import Profile from '../components/Profile';

export default function Settings() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Settings</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Profile />
        </div>
        
        <div>
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Account</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Manage your account settings and preferences.
            </p>
            
            {/* Add more account settings as needed */}
          </div>
        </div>
      </div>
    </div>
  );
}