import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Bell, User, Settings } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <GraduationCap className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">AI Guruji</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
              <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
            <Link to="/dashboard/settings" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
              <Settings className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </Link>
            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
              <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}