'use client';
import { Bell, Search, Menu, User, Settings } from 'lucide-react';
import { useState } from 'react';
import Badge from '@/components/ui/Badge';
import NotificationDropdown from './NotificationDropdown';

interface UserType {
  id: string;
  email: string;
}

interface DashboardHeaderProps {
  user: UserType;
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  return (
    <header className="bg-white border-b border-neutral-200 sticky top-0 z-40 backdrop-blur-sm bg-white/95">
      <div className="container-custom py-4">
        <div className="flex items-center justify-between">
          {/* Left side */}
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 hover:bg-neutral-100 rounded-lg transition-colors">
              <Menu className="w-5 h-5 text-neutral-600" />
            </button>
            
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search subscriptions..."
                className="input pl-10 pr-4 py-2 w-72 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <NotificationDropdown />

            {/* Settings */}
            <button className="hidden sm:flex p-2 hover:bg-neutral-100 rounded-lg transition-colors group">
              <Settings className="w-5 h-5 text-neutral-600 group-hover:text-neutral-900 transition-colors" />
            </button>
            
            <div className="h-8 w-px bg-neutral-200"></div>
            
            {/* User Profile */}
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="hidden md:block text-right">
                <div className="text-sm font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors">
                  {user.email}
                </div>
                <Badge variant="neutral" size="sm" className="mt-1">
                  Free Plan
                </Badge>
              </div>
              
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-200">
                  <span className="text-white font-bold text-sm">
                    {getInitials(user.email)}
                  </span>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success-500 border-2 border-white rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile search */}
        <div className="mt-4 md:hidden animate-slide-down">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search subscriptions..."
              className="input w-full pl-10 pr-4 py-2 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
