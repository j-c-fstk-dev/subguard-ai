'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Check, X, Sparkles, Plus, Trash2, Mail, FileText } from 'lucide-react';
import { fetchActivities, getUnreadCount, markAsRead, Activity } from '@/lib/activities';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function NotificationDropdown() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (open) {
      loadActivities();
    }
  }, [open]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function loadUnreadCount() {
    try {
      const count = await getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  }

  async function loadActivities() {
    try {
      setLoading(true);
      const data = await fetchActivities(5);
      setActivities(data);
    } catch (error) {
      console.error('Failed to load activities:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkAsRead(activityId: string) {
    try {
      await markAsRead(activityId);
      await loadUnreadCount();
      await loadActivities();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'email_connected':
        return <Mail className="w-4 h-4 text-blue-600" />;
      case 'subscription_added':
        return <Plus className="w-4 h-4 text-green-600" />;
      case 'subscription_deleted':
        return <Trash2 className="w-4 h-4 text-red-600" />;
      case 'ai_analysis':
        return <Sparkles className="w-4 h-4 text-purple-600" />;
      case 'recommendation_applied':
        return <Check className="w-4 h-4 text-success-600" />;
      case 'report_generated':
        return <FileText className="w-4 h-4 text-orange-600" />;
      default:
        return <Bell className="w-4 h-4 text-neutral-600" />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 hover:bg-neutral-100 rounded-lg transition-colors group"
      >
        <Bell className="w-5 h-5 text-neutral-600 group-hover:text-neutral-900 transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-danger-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-96 animate-slide-down">
          <Card className="shadow-2xl" padding="none">
            {/* Header */}
            <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
              <h3 className="font-semibold text-neutral-900">Notifications</h3>
              <Badge variant="info" size="sm">{unreadCount} new</Badge>
            </div>

            {/* Activity List */}
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                </div>
              ) : activities.length === 0 ? (
                <div className="p-8 text-center text-neutral-500">
                  <Bell className="w-12 h-12 text-neutral-300 mx-auto mb-2" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                activities.map((activity) => {
                  const isNegotiationActivity = activity.activity_type === 'recommendation_applied' || activity.activity_type === 'negotiation_created';
                  const handleActivityClick = () => {
                    if (isNegotiationActivity) {
                      router.push('/dashboard/negotiations');
                      setOpen(false);
                    }
                  };
                  
                  return (
                  <div
                    key={activity.id}
                    onClick={handleActivityClick}
                    className={`p-4 border-b border-neutral-100 transition-colors cursor-pointer ${
                      activity.read === 0 ? 'bg-primary-50/30' : ''
                    } ${isNegotiationActivity ? 'hover:bg-primary-100/50' : 'hover:bg-neutral-50'}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-neutral-100 rounded-lg flex-shrink-0">
                        {getActivityIcon(activity.activity_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-900">
                          {activity.title}
                        </p>
                        {activity.description && (
                          <p className="text-xs text-neutral-600 mt-1">
                            {activity.description}
                          </p>
                        )}
                        <p className="text-xs text-neutral-500 mt-1">
                          {formatTime(activity.created_at)}
                        </p>
                        {isNegotiationActivity && (
                          <p className="text-xs text-primary-600 mt-1 font-medium">
                            Click to view negotiation →
                          </p>
                        )}
                      </div>
                      {activity.read === 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(activity.id);
                          }}
                          className="p-1 hover:bg-neutral-200 rounded transition-colors flex-shrink-0"
                          title="Mark as read"
                        >
                          <Check className="w-4 h-4 text-neutral-600" />
                        </button>
                      )}
                    </div>
                  </div>
                );
                })
              )}
            </div>

            {/* Footer */}
            {activities.length > 0 && (
              <div className="p-3 border-t border-neutral-200">
                <Button
                  variant="ghost"
                  size="sm"
                  fullWidth
                  onClick={() => {
                    setOpen(false);
                    router.push('/dashboard/activities');
                  }}
                >
                  View all activity
                </Button>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
