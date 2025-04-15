import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { setupWebSocketServer, getWebSocketStatus } from './controllers/websocketController';
import { getTraders, getAnalytics, getPerpetuals, progressStream } from './controllers/tradersController';

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 5000;

// CORS configuration with WebSocket support
const corsOptions = {
  origin: ['http://localhost:3000', 'http://192.168.1.100:3000'],
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.get('/api/traders', getTraders);
app.get('/api/traders/analytics', getAnalytics);
app.get('/api/traders/perpetuals', getPerpetuals);
app.get('/api/traders/progress/:clientId', progressStream);
app.get('/api/websocket/status', getWebSocketStatus);

// Initialize WebSocket server
setupWebSocketServer(server);

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app; 