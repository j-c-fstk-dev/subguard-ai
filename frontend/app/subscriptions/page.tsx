export default function SubscriptionsPage() {
  const subscriptions = [
    { id: 1, name: 'Netflix', plan: 'Premium', price: 45.90, status: 'active', lastUsed: '2024-01-10' },
    { id: 2, name: 'Spotify', plan: 'Individual', price: 21.90, status: 'active', lastUsed: '2024-01-28' },
    { id: 3, name: 'GymPass', plan: 'Platinum', price: 99.90, status: 'active', lastUsed: '2023-12-15' },
    { id: 4, name: 'Amazon Prime', plan: 'Monthly', price: 14.90, status: 'active', lastUsed: '2024-01-25' },
    { id: 5, name: 'YouTube Premium', plan: 'Family', price: 34.90, status: 'active', lastUsed: '2024-01-29' },
    { id: 6, name: 'Adobe Creative Cloud', plan: 'All Apps', price: 89.90, status: 'active', lastUsed: '2024-01-20' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Subscriptions</h1>
          <p className="text-gray-600 mt-2">Manage and optimize all your subscriptions in one place</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subscriptions.map((sub) => (
            <div key={sub.id} className="bg-white rounded-xl shadow p-6 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{sub.name}</h3>
                  <p className="text-gray-600 text-sm">{sub.plan}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  sub.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {sub.status}
                </span>
              </div>

              <div className="mb-6">
                <p className="text-2xl font-bold text-gray-900">R$ {sub.price.toFixed(2)}<span className="text-sm text-gray-600">/month</span></p>
                <p className="text-sm text-gray-500">Last used: {sub.lastUsed}</p>
              </div>

              <div className="flex space-x-3">
                <a 
                  href={`/subscriptions/${sub.id}`}
                  className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg text-center text-sm font-medium hover:bg-blue-100 transition"
                >
                  View Details
                </a>
                <button className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
                  Optimize
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Subscriptions</p>
              <p className="text-2xl font-bold text-gray-900">6</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Monthly Cost</p>
              <p className="text-2xl font-bold text-gray-900">R$ 307.40</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Potential Savings</p>
              <p className="text-2xl font-bold text-green-600">R$ 87.00</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Unused</p>
              <p className="text-2xl font-bold text-red-600">2</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}