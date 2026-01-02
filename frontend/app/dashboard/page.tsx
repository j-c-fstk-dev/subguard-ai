import DashboardHeader from '@/components/dashboard/DashboardHeader';
import SummaryCards from '@/components/dashboard/SummaryCards';
import SubscriptionList from '@/components/dashboard/SubscriptionList';
import Recommendations from '@/components/dashboard/Recommendations';

// Mock user para teste
const mockUser = {
  id: 'user-123',
  email: 'demo@subguard.ai',
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader user={mockUser} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <SummaryCards userId={mockUser.id} />
            <SubscriptionList userId={mockUser.id} />
          </div>
          
          {/* Right Column */}
          <div className="space-y-6">
            <Recommendations userId={mockUser.id} />
            
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition">
                  Connect Email
                </button>
                <button className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition">
                  Add Subscription Manually
                </button>
                <button className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition">
                  Generate Monthly Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}