import { Request, Response } from 'express';
import { Server } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { websocketService } from '../services/websocketService';

// Store connected clients
const clients = new Set<WebSocket>();

export const setupWebSocketServer = (server: Server) => {
  // Create WebSocket server with no path restriction
  const wss = new WebSocketServer({ 
    server,
    clientTracking: true,
    perMessageDeflate: false
  });

  wss.on('connection', (ws: WebSocket, req) => {
    console.log(`Client connected to WebSocket from ${req.socket.remoteAddress}`);
    clients.add(ws);

    // Set up trade listener for this client
    const unsubscribe = websocketService.onTrades((trades) => {
      if (ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(JSON.stringify({
            type: 'trades',
            data: trades
          }));
        } catch (error) {
          console.error('Error sending trade data to client:', error);
        }
      }
    });

    // Handle client disconnect
    ws.on('close', () => {
      console.log(`Client disconnected from WebSocket`);
      clients.delete(ws);
      unsubscribe();
    });

    // Handle client errors
    ws.on('error', (error: Error) => {
      console.error('WebSocket client error:', error);
      clients.delete(ws);
      unsubscribe();
    });

    // Send initial connection success message
    try {
      ws.send(JSON.stringify({
        type: 'connection',
        status: 'connected'
      }));
    } catch (error) {
      console.error('Error sending initial connection message:', error);
    }
  });

  // Start the Hyperliquid WebSocket connection
  websocketService.connect().catch(error => {
    console.error('Failed to connect to Hyperliquid WebSocket:', error);
  });

  return wss;
};

// Endpoint to get WebSocket connection status
export const getWebSocketStatus = (req: Request, res: Response) => {
  res.json({
    connected: websocketService.getConnectionStatus(),
    clientCount: clients.size
  });
}; 