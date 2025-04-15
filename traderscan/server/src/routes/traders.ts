 import express from 'express';
import tradersController from '../controllers/tradersController';

const router = express.Router();

// GET /api/traders - Get all trader positions with analytics
router.get('/', tradersController.getTraders);

// GET /api/traders/analytics - Get analytics summary
router.get('/analytics', tradersController.getAnalytics);

// GET /api/traders/perpetuals - Get perpetuals information
router.get('/perpetuals', tradersController.getPerpetuals);

// GET /api/traders/progress/:clientId? - SSE endpoint for real-time progress updates
router.get('/progress/:clientId?', tradersController.progressStream);

// POST /api/traders/wallets - Submit wallet addresses
router.post('/wallets', tradersController.submitWallets);

export default router; 