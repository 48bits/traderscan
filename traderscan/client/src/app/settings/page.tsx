export const metadata = {
  title: 'Settings | TraderScan Quant Bot',
  description: 'Configure your TraderScan Quant Bot settings',
};

export default function SettingsPage() {
  return (
    <main className="min-h-screen dark:text-gray-100 relative z-10 pt-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-6">Settings</h1>
        <p className="text-xl mb-8">Configure your TraderScan Quant Bot preferences and settings.</p>
        
        <div className="bg-gray-900/70 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-800 mb-8">
          <h2 className="text-2xl font-bold mb-6">Account Settings</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-gray-300 mb-2">API Key</label>
              <input type="password" className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-2.5" value="••••••••••••••••" readOnly />
            </div>
            
            <div>
              <label className="block text-gray-300 mb-2">Email Notifications</label>
              <div className="flex items-center mb-2">
                <input type="checkbox" id="trade-notifications" className="mr-2" />
                <label htmlFor="trade-notifications">Trade Executions</label>
              </div>
              <div className="flex items-center mb-2">
                <input type="checkbox" id="alert-notifications" className="mr-2" />
                <label htmlFor="alert-notifications">Price Alerts</label>
              </div>
              <div className="flex items-center">
                <input type="checkbox" id="report-notifications" className="mr-2" />
                <label htmlFor="report-notifications">Weekly Reports</label>
              </div>
            </div>
            
            <button type="button" className="py-2.5 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save Account Settings</button>
          </div>
        </div>
        
        <div className="bg-gray-900/70 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-800 mb-8">
          <h2 className="text-2xl font-bold mb-6">Trading Settings</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-gray-300 mb-2">Default Trading Pair</label>
              <select className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-2.5">
                <option>BTC/USDT</option>
                <option>ETH/USDT</option>
                <option>SOL/USDT</option>
              </select>
            </div>
            
            <div>
              <label className="block text-gray-300 mb-2">Risk Management</label>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Max Position Size (% of Portfolio)</label>
                  <input type="range" className="w-full" min="1" max="100" defaultValue="10" />
                  <div className="flex justify-between">
                    <span className="text-xs">1%</span>
                    <span className="text-xs">10%</span>
                    <span className="text-xs">100%</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Stop Loss (% from Entry)</label>
                  <input type="range" className="w-full" min="1" max="20" defaultValue="5" />
                  <div className="flex justify-between">
                    <span className="text-xs">1%</span>
                    <span className="text-xs">5%</span>
                    <span className="text-xs">20%</span>
                  </div>
                </div>
              </div>
            </div>
            
            <button type="button" className="py-2.5 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save Trading Settings</button>
          </div>
        </div>
        
        <div className="bg-gray-900/70 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-800">
          <h2 className="text-2xl font-bold mb-6">Algorithm Settings</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-gray-300 mb-2">Preferred Strategy</label>
              <select className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-2.5">
                <option>VWAP</option>
                <option>Momentum</option>
                <option>Mean Reversion</option>
                <option>Trend Following</option>
              </select>
            </div>
            
            <div>
              <label className="block text-gray-300 mb-2">Timeframe</label>
              <select className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-2.5">
                <option>1 minute</option>
                <option>5 minutes</option>
                <option>15 minutes</option>
                <option>1 hour</option>
                <option>4 hours</option>
                <option>1 day</option>
              </select>
            </div>
            
            <button type="button" className="py-2.5 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save Algorithm Settings</button>
          </div>
        </div>
      </div>
    </main>
  );
} 