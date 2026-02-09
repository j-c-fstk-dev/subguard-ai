'use client';
import { useState, useEffect } from 'react';
import { fetchActivities } from '@/lib/activities';
import Card from '@/components/ui/Card';
import { Clock, Mail, Sparkles, Plus, Trash2, FileText } from 'lucide-react';

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, []);

  async function loadActivities() {
    try {
      const data = await fetchActivities();
      setActivities(data);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'email_connected': return <Mail className="w-5 h-5 text-blue-600" />;
      case 'ai_analysis': return <Sparkles className="w-5 h-5 text-purple-600" />;
      case 'subscription_added': return <Plus className="w-5 h-5 text-green-600" />;
      case 'subscription_deleted': return <Trash2 className="w-5 h-5 text-red-600" />;
      case 'report_generated': return <FileText className="w-5 h-5 text-orange-600" />;
      default: return <Clock className="w-5 h-5 text-neutral-600" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Activity Log</h1>
      
      {loading ? (
        <Card className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </Card>
      ) : (
        <div className="space-y-3">
          {activities.map((activity: any) => (
            <Card key={activity.id} className="p-4 hover:shadow-md transition">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-neutral-100 rounded-lg">
                  {getIcon(activity.activity_type)}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-neutral-900">{activity.title}</h3>
                  <p className="text-sm text-neutral-600 mt-1">{activity.description}</p>
                  <p className="text-xs text-neutral-500 mt-2">
                    {new Date(activity.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
