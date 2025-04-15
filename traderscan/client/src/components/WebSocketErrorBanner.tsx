import React from 'react';

interface WebSocketErrorBannerProps {
  error: string | null;
  loading: boolean;
  connected: boolean;
  onRetry: () => void;
}

const WebSocketErrorBanner: React.FC<WebSocketErrorBannerProps> = ({
  error,
  loading,
  connected,
  onRetry
}) => {
  if (error) {
    return (
      <div className="bg-red-900/50 border border-red-700 text-red-100 px-4 py-3 rounded mb-6 text-center">
        <p className="font-bold">WebSocket Connection Error</p>
        <p className="text-sm">{error}</p>
        <button 
          onClick={onRetry}
          className="mt-2 bg-red-700 hover:bg-red-800 text-white py-1 px-3 rounded text-sm"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  if (!connected && loading) {
    return (
      <div className="bg-blue-900/50 border border-blue-700 text-blue-100 px-4 py-3 rounded mb-6 text-center">
        <p>Connecting to Hyperliquid WebSocket...</p>
        <div className="mt-2 w-full bg-blue-800 rounded-full h-2.5">
          <div className="bg-blue-500 h-2.5 rounded-full animate-pulse w-1/3"></div>
        </div>
      </div>
    );
  }

  if (connected) {
    return (
      <div className="bg-green-900/50 border border-green-700 text-green-100 px-4 py-3 rounded mb-6 text-center">
        <p>Connected to Hyperliquid WebSocket</p>
        <div className="mt-2 w-full bg-green-800 rounded-full h-1.5">
          <div className="bg-green-500 h-1.5 rounded-full w-full"></div>
        </div>
      </div>
    );
  }

  // No message if not connected but not loading or error
  return null;
};

export default WebSocketErrorBanner; 