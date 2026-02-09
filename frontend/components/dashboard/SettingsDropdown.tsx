'use client';
import { useState, useRef, useEffect } from 'react';
import { Settings, User, Mail, Bell, CreditCard, Lock, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { logout } from '@/lib/auth';

export default function SettingsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuItems = [
    { icon: User, label: 'Profile Settings', href: '/dashboard/settings?tab=profile' },
    { icon: Mail, label: 'Connected Emails', href: '/dashboard/settings?tab=emails' },
    { icon: Bell, label: 'Notifications', href: '/dashboard/settings?tab=notifications' },
    { icon: CreditCard, label: 'Billing', href: '/dashboard/settings?tab=billing', badge: 'Soon' },
    { icon: Lock, label: 'Privacy & Security', href: '/dashboard/settings?tab=privacy' },
  ];

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-neutral-100 transition-colors group"
      >
        <Settings className="w-5 h-5 text-neutral-600 group-hover:text-neutral-900 transition-colors" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-neutral-200 py-2 z-50">
          <div className="px-4 py-2 border-b border-neutral-200">
            <p className="text-sm font-semibold text-neutral-900">Settings</p>
          </div>

          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                router.push(item.href);
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 flex items-center gap-3 hover:bg-neutral-50 transition-colors text-left"
            >
              <item.icon className="w-4 h-4 text-neutral-600" />
              <span className="text-sm text-neutral-700 flex-1">{item.label}</span>
              {item.badge && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          ))}

          <div className="border-t border-neutral-200 mt-2 pt-2">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 flex items-center gap-3 hover:bg-red-50 transition-colors text-left text-red-600"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
