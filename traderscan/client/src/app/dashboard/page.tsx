import Link from 'next/link';

export const metadata = {
  title: 'Dashboard | TraderScan Quant Bot',
  description: 'Trading dashboard for the TraderScan Quant Bot',
};

export default function DashboardPage() {
  return (
    <main className="min-h-screen dark:text-gray-100 relative z-10 pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-6">Trading Dashboard</h1>
        <p className="text-xl mb-8">This is the trading dashboard for TraderScan Quant Bot.</p>
        
        <div className="bg-gray-900/70 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-800 mb-8">
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link 
              href="/analytics" 
              className="flex items-center justify-center p-6 bg-blue-900/30 rounded-lg border border-blue-800/50 hover:bg-blue-800/40 transition-colors"
            >
              <span className="text-xl font-medium">View Analytics</span>
            </Link>
            <div className="flex items-center justify-center p-6 bg-purple-900/30 rounded-lg border border-purple-800/50">
              <span className="text-xl font-medium">Place Trade</span>
            </div>
            <div className="flex items-center justify-center p-6 bg-amber-900/30 rounded-lg border border-amber-800/50">
              <span className="text-xl font-medium">Portfolio</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-900/70 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-800">
            <h2 className="text-2xl font-bold mb-4">Recent Trades</h2>
            <p className="text-gray-400">No recent trades to display.</p>
          </div>
          <div className="bg-gray-900/70 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-800">
            <h2 className="text-2xl font-bold mb-4">Performance</h2>
            <p className="text-gray-400">Performance data will be displayed here.</p>
          </div>
        </div>
      </div>
    </main>
  );
} 