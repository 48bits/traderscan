# TraderScan - HyperLiquid Trader Sentiment Analysis

A real-time analytics dashboard for tracking trader sentiment and positions on the HyperLiquid exchange.

## Features

- 🔄 Real-time data from HyperLiquid API
- 📊 Sentiment analysis of trader positions
- 📈 Visualization of popular assets and top traders
- 🚀 Modern UI with animations
- ⚡ Fast data loading with caching

## Project Structure

- `client/`: Next.js frontend application
- `server/`: Node.js/Express backend API
- `hyperliquid_traders_clean_20250316_134657.csv`: Trader wallet addresses

## Setup and Running

### Backend Server

1. Navigate to the server directory:
   ```
   cd server
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Parse wallet addresses (only needed once):
   ```
   npx ts-node src/scripts/parseWallets.ts
   ```

4. Start the server:
   ```
   npx ts-node src/index.ts
   ```

The server will run on `http://localhost:5000`.

### Frontend Client

1. Navigate to the client directory:
   ```
   cd client
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

The application will be available at `http://localhost:3000`.

## API Endpoints

- `GET /api/traders/analytics`: Get trader sentiment analytics
- `GET /api/traders`: Get all trader positions with analytics
- `GET /api/traders/perpetuals`: Get perpetuals information
- `POST /api/traders/wallets`: Submit wallet addresses

## Environment Variables

### Client

Create a `.env.local` file in the client directory with:

```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Server

Create a `.env` file in the server directory with:

```
PORT=5000
```

## Acknowledgements

- Data provided by [HyperLiquid API](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api) 