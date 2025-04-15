import React, { useState, useEffect } from 'react';
import { TRACKED_WALLETS } from '../utils/api';

const WalletManager: React.FC = () => {
  const [wallets, setWallets] = useState<string[]>([]);
  const [newWallet, setNewWallet] = useState('');
  const [walletFile, setWalletFile] = useState<File | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'info' | 'success' | 'error' } | null>(null);

  // Load wallets from localStorage on component mount
  useEffect(() => {
    try {
      const storedWallets = localStorage.getItem('trackedWallets');
      if (storedWallets) {
        const parsedWallets = JSON.parse(storedWallets);
        if (Array.isArray(parsedWallets) && parsedWallets.length > 0) {
          setWallets(parsedWallets);
          setMessage({
            text: `Loaded ${parsedWallets.length} wallets from storage`,
            type: 'info'
          });
        }
      } else {
        // If no wallets in localStorage, use the current TRACKED_WALLETS array
        setWallets([...TRACKED_WALLETS]);
      }
    } catch (error) {
      console.error('Error loading wallets:', error);
      setMessage({
        text: 'Error loading wallets from storage',
        type: 'error'
      });
    }
  }, []);

  // Update localStorage whenever wallets change
  useEffect(() => {
    if (wallets.length > 0) {
      try {
        localStorage.setItem('trackedWallets', JSON.stringify(wallets));
      } catch (error) {
        console.error('Error saving wallets to localStorage:', error);
        setMessage({
          text: 'Error saving wallets to storage',
          type: 'error'
        });
      }
    }
  }, [wallets]);

  // Handler for adding a new wallet
  const handleAddWallet = () => {
    if (!newWallet.trim()) {
      setMessage({
        text: 'Please enter a wallet address',
        type: 'error'
      });
      return;
    }

    // Basic validation for Ethereum address
    if (!newWallet.startsWith('0x') || newWallet.length !== 42) {
      setMessage({
        text: 'Invalid Ethereum address format',
        type: 'error'
      });
      return;
    }

    // Check if wallet already exists
    if (wallets.includes(newWallet.toLowerCase())) {
      setMessage({
        text: 'Wallet already exists in the list',
        type: 'error'
      });
      return;
    }

    // Add the new wallet
    const updatedWallets = [...wallets, newWallet.toLowerCase()];
    setWallets(updatedWallets);
    setNewWallet('');
    setMessage({
      text: 'Wallet added successfully',
      type: 'success'
    });
  };

  // Handler for removing a wallet
  const handleRemoveWallet = (walletToRemove: string) => {
    const updatedWallets = wallets.filter(wallet => wallet !== walletToRemove);
    setWallets(updatedWallets);
    setMessage({
      text: 'Wallet removed',
      type: 'info'
    });
  };

  // Handler for uploading wallets from file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setWalletFile(file);
    setMessage({
      text: `File selected: ${file.name}`,
      type: 'info'
    });
  };

  // Process the uploaded file
  const processWalletFile = () => {
    if (!walletFile) {
      setMessage({
        text: 'Please select a file first',
        type: 'error'
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        
        // Handle CSV, TXT or JSON file formats
        let newWallets: string[] = [];
        
        if (walletFile.name.endsWith('.json')) {
          // Parse JSON
          const data = JSON.parse(text);
          if (Array.isArray(data)) {
            newWallets = data.filter(item => 
              typeof item === 'string' && 
              item.startsWith('0x') && 
              item.length === 42
            ).map(wallet => wallet.toLowerCase());
          } else if (typeof data === 'object') {
            // Try to extract wallets from any objects
            newWallets = Object.values(data)
              .filter(item => 
                typeof item === 'string' && 
                item.startsWith('0x') && 
                item.length === 42
              ).map(wallet => wallet.toLowerCase());
          }
        } else {
          // Parse as text (CSV, TXT)
          // Split by common delimiters and filter valid addresses
          const possibleWallets = text.split(/[\s,;:\n]+/);
          newWallets = possibleWallets
            .filter(item => item.startsWith('0x') && item.length === 42)
            .map(wallet => wallet.toLowerCase());
        }

        if (newWallets.length === 0) {
          setMessage({
            text: 'No valid wallet addresses found in the file',
            type: 'error'
          });
          return;
        }

        // Remove duplicates
        const uniqueWallets = [...new Set(newWallets)];
        
        // Update the wallet list
        setWallets(uniqueWallets);
        setMessage({
          text: `Loaded ${uniqueWallets.length} unique wallets from file`,
          type: 'success'
        });
        
        // Reset the file input
        setWalletFile(null);
        
        // Update TRACKED_WALLETS globally
        TRACKED_WALLETS.length = 0;
        uniqueWallets.forEach(wallet => TRACKED_WALLETS.push(wallet));
        
        // A page reload would be needed to reconnect WebSocket with new wallets
        setMessage({
          text: `Loaded ${uniqueWallets.length} wallets. Please refresh the page to apply changes.`,
          type: 'success'
        });
      } catch (error) {
        console.error('Error processing wallet file:', error);
        setMessage({
          text: 'Error processing the file. Ensure it contains valid wallet addresses.',
          type: 'error'
        });
      }
    };

    reader.readAsText(walletFile);
  };

  // Get a shortened version of a wallet address for display
  const shortenAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="bg-gray-900 rounded-lg shadow-md p-6 my-4">
      <h2 className="text-xl font-semibold text-white mb-4">Wallet Manager</h2>
      
      {message && (
        <div 
          className={`mb-4 p-3 rounded ${
            message.type === 'success' ? 'bg-green-800 text-green-100' :
            message.type === 'error' ? 'bg-red-800 text-red-100' :
            'bg-blue-800 text-blue-100'
          }`}
        >
          {message.text}
        </div>
      )}
      
      <div className="mb-6">
        <h3 className="text-lg text-gray-300 mb-2">Upload Wallet File</h3>
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
          <input
            type="file"
            onChange={handleFileUpload}
            accept=".txt,.csv,.json"
            className="p-2 bg-gray-800 text-gray-200 rounded"
          />
          <button
            onClick={processWalletFile}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            Upload & Process
          </button>
        </div>
        <p className="text-gray-400 text-sm mt-1">
          Supports TXT, CSV or JSON files with Ethereum addresses
        </p>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg text-gray-300 mb-2">Add Single Wallet</h3>
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
          <input
            type="text"
            value={newWallet}
            onChange={(e) => setNewWallet(e.target.value)}
            placeholder="0x..."
            className="p-2 bg-gray-800 text-gray-200 rounded flex-grow"
          />
          <button
            onClick={handleAddWallet}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
          >
            Add Wallet
          </button>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg text-gray-300 mb-2">
          Tracked Wallets ({wallets.length})
        </h3>
        
        {wallets.length === 0 ? (
          <p className="text-gray-400">No wallets added yet.</p>
        ) : (
          <div className="max-h-60 overflow-y-auto">
            <table className="w-full">
              <thead className="bg-gray-800 text-gray-400 text-xs">
                <tr>
                  <th className="p-2 text-left">#</th>
                  <th className="p-2 text-left">Address</th>
                  <th className="p-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {wallets.map((wallet, index) => (
                  <tr key={wallet} className="hover:bg-gray-800">
                    <td className="p-2 text-gray-300">{index + 1}</td>
                    <td className="p-2 text-gray-300 font-mono">
                      {shortenAddress(wallet)}
                      <span className="ml-2 text-gray-500 text-xs cursor-pointer" 
                        onClick={() => {
                          navigator.clipboard.writeText(wallet);
                          setMessage({
                            text: 'Address copied to clipboard',
                            type: 'info'
                          });
                        }}
                      >
                        copy
                      </span>
                    </td>
                    <td className="p-2 text-right">
                      <button
                        onClick={() => handleRemoveWallet(wallet)}
                        className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletManager; 