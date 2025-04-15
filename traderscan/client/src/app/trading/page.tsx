export const metadata = {
  title: 'Trading | TraderScan Quant Bot',
  description: 'Algorithmic trading platform for cryptocurrency markets',
};

export default function TradingPage() {
  return (
    <main className="min-h-screen dark:text-gray-100 relative z-10 pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-6">Algorithmic Trading</h1>
        <p className="text-xl mb-8">Execute trades using our advanced algorithmic trading engine.</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-gray-900/70 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-800 mb-8">
              <h2 className="text-2xl font-bold mb-4">Trading Chart</h2>
              <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center">
                <p className="text-gray-400">Trading chart will be displayed here</p>
              </div>
            </div>
            
            <div className="bg-gray-900/70 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-800">
              <h2 className="text-2xl font-bold mb-4">Order Book</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-green-500">Bids</h3>
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <span className="font-medium">${(40000 - i * 100).toLocaleString()}</span>
                        <span className="text-sm">{(Math.random() * 2).toFixed(4)} BTC</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-red-500">Asks</h3>
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <span className="font-medium">${(40100 + i * 100).toLocaleString()}</span>
                        <span className="text-sm">{(Math.random() * 2).toFixed(4)} BTC</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <div className="bg-gray-900/70 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-800 mb-8">
              <h2 className="text-2xl font-bold mb-4">Place Order</h2>
              <form className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-2">Asset</label>
                  <select className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-2.5">
                    <option>BTC</option>
                    <option>ETH</option>
                    <option>SOL</option>
                    <option>AVAX</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-2">Order Type</label>
                  <select className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-2.5">
                    <option>Market</option>
                    <option>Limit</option>
                    <option>Stop</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-2">Side</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button type="button" className="py-2.5 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700">Buy</button>
                    <button type="button" className="py-2.5 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700">Sell</button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-2">Amount</label>
                  <input type="text" className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-2.5" placeholder="0.00" />
                </div>
                
                <button type="button" className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Place Order</button>
              </form>
            </div>
            
            <div className="bg-gray-900/70 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-800">
              <h2 className="text-2xl font-bold mb-4">Algo Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-2">Strategy</label>
                  <select className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-2.5">
                    <option>VWAP</option>
                    <option>Momentum</option>
                    <option>Mean Reversion</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-2">Risk Level</label>
                  <input type="range" className="w-full" />
                </div>
                
                <button type="button" className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700">Enable Algo Trading</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 