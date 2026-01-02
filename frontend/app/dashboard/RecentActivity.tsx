'use client';

import { CheckCircle, XCircle, Clock, TrendingDown } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Activity {
  id: string;
  type: 'optimization' | 'subscription' | 'alert';
  action: string;
  description: string;
  date: string;
  amount?: number;
  status: 'success' | 'pending' | 'failed';
}

export default function RecentActivity({ userId }: { userId: string }) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data
    const mockActivities: Activity[] = [
      {
        id: '1',
        type: 'optimization',
        action: 'Netflix downgraded',
        description: 'Premium → Basic plan',
        date: '10 min ago',
        amount: 22.00,
        status: 'success'
      },
      {
        id: '2',
        type: 'subscription',
        action: 'Spotify detected',
        description: 'From email invoice',
        date: '1 hour ago',
        amount: 21.90,
        status: 'success'
      },
      {
        id: '3',
        type: 'alert',
        action: 'Price increase',
        description: 'Amazon Prime +R$ 5.00',
        date: '2 days ago',
        status: 'pending'
      },
      {
        id: '4',
        type: 'optimization',
        action: 'GymPass cancelled',
        description: 'Not used in 45 days',
        date: '1 week ago',
        amount: 99.90,
        status: 'success'
      }
    ];

    setActivities(mockActivities);
    setLoading(false);
  }, [userId]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <CheckCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'optimization':
        return <TrendingDown className="w-4 h-4 text-blue-500" />;
      case 'subscription':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'alert':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Recent Activity
        </h2>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 border rounded-lg animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
                <div>
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Recent Activity
        </h2>
        <button className="text-sm text-blue-600 hover:text-blue-800">
          View all
        </button>
      </div>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                {getTypeIcon(activity.type)}
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  {activity.action}
                </div>
                <div className="text-sm text-gray-500">
                  {activity.description}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {activity.amount && (
                <div className={`font-semibold ${activity.type === 'optimization' ? 'text-green-600' : 'text-gray-900'}`}>
                  {activity.type === 'optimization' ? 'Saved ' : '+ '}
                  R$ {activity.amount.toFixed(2)}
                </div>
              )}
              <div className="flex items-center space-x-2">
                {getStatusIcon(activity.status)}
                <span className="text-sm text-gray-500">{activity.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {activities.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No recent activity
        </div>
      )}
    </div>
  );
}