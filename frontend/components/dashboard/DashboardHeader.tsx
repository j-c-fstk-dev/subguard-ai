'use client';
import { Bell, Search, Menu, User } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import SettingsDropdown from './SettingsDropdown';

interface DashboardHeaderProps {
  user: {
    email: string;
  };
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  return (
    <header className="bg-white border-b border-neutral-200 sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
              SubGuard AI
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search subscriptions..."
                className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-2">
            {/* Notifications */}
            <NotificationDropdown />

            {/* Settings */}
            <SettingsDropdown />

            {/* User Menu */}
            <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-neutral-100 transition-colors">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="hidden md:block text-sm font-medium text-neutral-700">
                {user.email}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
