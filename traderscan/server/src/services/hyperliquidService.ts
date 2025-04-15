import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { Perpetual, Position, Trader } from '../types';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { EventEmitter } from 'events';

const API_BASE_URL = 'https://api.hyperliquid.xyz';

// Create a global event emitter for tracking processing progress
export const progressEmitter = new EventEmitter();

// Interface for the API response types
interface UserFillsResponse {
  time: number;
  coin: string;
  dir: string;
  // Add other relevant fields as needed
  [key: string]: any;
}

interface ClearinghouseStateResponse {
  marginSummary?: {
    accountValue: string;
    totalNtlPos: string;
    totalRawUsd: string;
    totalMarginUsed: string;
  };
  assetPositions?: Array<{
    position: {
      coin: string;
      szi: string;
      entryPx: string;
      entryTime?: string;
      leverage: { value: string };
      liquidationPx?: string;
      marginUsed?: string;
      positionValue?: string;
      unrealizedPnl?: string;
      returnOnEquity?: string;
      [key: string]: any;
    };
    [key: string]: any;
  }>;
  [key: string]: any;
}

/**
 * Attempts to acquire a lock to prevent multiple instances from processing simultaneously
 * @returns true if lock was acquired, false otherwise
 */
const acquireLock = async (): Promise<boolean> => {
  try {
    const lockFile = path.join(os.tmpdir(), 'traderscan-hyperliquid-processing.lock');
    
    // Check if lock file exists
    if (fs.existsSync(lockFile)) {
      // Check if lock is stale (older than 5 minutes - reduced from 15 minutes)
      const stats = fs.statSync(lockFile);
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      
      if (stats.mtime < fiveMinutesAgo) {
        // Lock is stale, override it
        console.log(`Found stale lock file (older than 5 minutes). Overriding.`);
        fs.writeFileSync(lockFile, `PID: ${process.pid}, Time: ${new Date().toISOString()}`);
        return true;
      }
      
      try {
        // Try to read the lock file to get the PID
        const lockData = fs.readFileSync(lockFile, 'utf8');
        const pidMatch = lockData.match(/PID: (\d+)/);
        
        if (pidMatch && pidMatch[1]) {
          const pid = parseInt(pidMatch[1], 10);
          
          // On Windows, check if the process is still running (this is a best effort check)
          try {
            // Use 'tasklist' on Windows to check if PID exists
            const { exec } = require('child_process');
            exec(`tasklist /FI "PID eq ${pid}" /NH`, (error: any, stdout: string) => {
              if (error) {
                // Can't check, assume process is dead
                console.log(`Error checking PID ${pid}: ${error}. Assuming stale lock.`);
                fs.unlinkSync(lockFile);
                fs.writeFileSync(lockFile, `PID: ${process.pid}, Time: ${new Date().toISOString()}`);
              } else if (!stdout.includes(pid.toString())) {
                // Process is not running, lock is stale
                console.log(`Process ${pid} from lock file is not running. Overriding lock.`);
                fs.unlinkSync(lockFile);
                fs.writeFileSync(lockFile, `PID: ${process.pid}, Time: ${new Date().toISOString()}`);
              }
            });
          } catch (checkError) {
            console.log(`Error checking process: ${checkError}`);
          }
        }
      } catch (readError) {
        console.log(`Error reading lock file: ${readError}`);
      }
      
      console.log(`Another instance is already processing (lock created at ${stats.mtime.toISOString()}). Skipping.`);
      return false; // Lock exists and is fresh
    }
    
    // No lock, create one
    console.log(`Acquiring processing lock at ${new Date().toISOString()}`);
    fs.writeFileSync(lockFile, `PID: ${process.pid}, Time: ${new Date().toISOString()}`);
    return true;
  } catch (error) {
    console.error('Error acquiring lock:', error);
    return false;
  }
};

/**
 * Release the lock after processing is complete
 */
const releaseLock = (): void => {
  try {
    const lockFile = path.join(os.tmpdir(), 'traderscan-hyperliquid-processing.lock');
    if (fs.existsSync(lockFile)) {
      fs.unlinkSync(lockFile);
      console.log(`Released processing lock at ${new Date().toISOString()}`);
    }
  } catch (error) {
    console.error('Error releasing lock:', error);
  }
};

/**
 * Rate limiter based on Hyperliquid API documentation.
 * The API has the following limits:
 * - 1200 weight per minute per IP
 * - Different endpoints have different weights:
 *   - Most info endpoints: weight 20
 *   - l2Book, allMids, clearinghouseState, orderStatus, etc: weight 2
 *   - userRole: weight 60
 */
class RateLimiter {
  private tokens: number = 1200; // Start with full bucket (1200 weight per minute)
  private lastRefill: number = Date.now();
  private readonly maxTokens: number = 1200;
  private readonly refillRate: number = 1200 / 60000; // tokens per ms (1200 per minute)
  private queue: Array<{ resolve: () => void, weight: number }> = [];
  private processing: boolean = false;

  /**
   * Get API request weight based on endpoint and request type
   */
  getRequestWeight(endpoint: string, type?: string): number {
    if (endpoint.includes('/exchange')) {
      return 1; // Base weight for exchange endpoints (not batched)
    }
    
    if (endpoint.includes('/info')) {
      if (!type) return 20; // Default for info endpoints
      
      // Special cases based on documentation
      const lowWeightTypes = ['l2Book', 'allMids', 'clearinghouseState', 'orderStatus', 
        'spotClearinghouseState', 'exchangeStatus'];
      if (lowWeightTypes.includes(type)) return 2;
      
      if (type === 'userRole') return 60;
      
      return 20; // Default for other info types
    }
    
    if (endpoint.includes('/explorer')) {
      return 40;
    }
    
    return 20; // Default weight for unknown endpoints
  }

  /**
   * Refill the token bucket based on time elapsed
   */
  private refill() {
    const now = Date.now();
    const timeElapsed = now - this.lastRefill;
    const tokensToAdd = timeElapsed * this.refillRate;
    
    this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }

  /**
   * Process the queue of waiting requests
   */
  private async processQueue() {
    if (this.processing) return;
    this.processing = true;
    
    while (this.queue.length > 0) {
      this.refill();
      const next = this.queue[0];
      
      if (this.tokens >= next.weight) {
        // We have enough tokens for this request
        this.tokens -= next.weight;
        this.queue.shift();
        next.resolve();
      } else {
        // Not enough tokens, wait until we have enough
        const timeToWait = ((next.weight - this.tokens) / this.refillRate);
        await new Promise(resolve => setTimeout(resolve, timeToWait));
        this.refill();
      }
    }
    
    this.processing = false;
  }

  /**
   * Request permission to make an API call
   * @param endpoint API endpoint
   * @param type Request type (for info endpoint)
   * @returns Promise that resolves when the request can proceed
   */
  async acquire(endpoint: string, type?: string): Promise<void> {
    const weight = this.getRequestWeight(endpoint, type);
    console.log(`Acquiring rate limit tokens for ${endpoint} ${type ? `(${type})` : ''}, weight: ${weight}`);
    
    // Fast path - if we have enough tokens, return immediately
    this.refill();
    if (this.tokens >= weight && this.queue.length === 0) {
      this.tokens -= weight;
      return;
    }
    
    // Slow path - add to queue and wait
    return new Promise<void>(resolve => {
      this.queue.push({ resolve, weight });
      this.processQueue();
    });
  }
}

// Create a single rate limiter instance for the module
const rateLimiter = new RateLimiter();

/**
 * Makes an API request with retry logic and respects rate limits
 * @param config Axios request configuration
 * @param maxRetries Maximum number of retries before failing
 * @returns API response
 */
async function makeApiRequest<T>(
  config: AxiosRequestConfig,
  requestType?: string,
  maxRetries: number = 3
): Promise<AxiosResponse<T>> {
  const url = config.url || '';
  let retries = 0;
  let lastError: any;

  while (retries <= maxRetries) {
    try {
      // Wait for rate limiter to allow the request
      await rateLimiter.acquire(url, requestType);
      
      // If not the first attempt, add a delay before retry
      if (retries > 0) {
        const retryDelay = Math.pow(2, retries) * 1000; // Exponential backoff: 2s, 4s, 8s
        console.log(`Retry attempt ${retries}/${maxRetries}, waiting ${retryDelay}ms`);
        await delay(retryDelay);
      }

      // Make the request
      const response = await axios(config);
      return response;
    } catch (error: any) {
      lastError = error;
      
      // Check if it's a rate limit error (429)
      if (error.response && error.response.status === 429) {
        retries++;
        
        // Check if API provides a Retry-After header
        const retryAfter = error.response.headers['retry-after'];
        if (retryAfter) {
          const retryMs = parseInt(retryAfter) * 1000;
          console.log(`Rate limited with Retry-After: ${retryMs}ms`);
          await delay(retryMs);
        } else {
          // Default backoff for rate limit: 10 seconds as per documentation
          console.log(`Rate limited (429). Using default backoff of 10 seconds.`);
          await delay(10000);
        }
        
        // Continue to next retry attempt
        if (retries <= maxRetries) {
          continue;
        }
      }
      
      // For non-retry errors or if max retries exceeded
      console.error(`Request failed after ${retries} retries:`, error.message);
      throw error;
    }
  }
  
  // If we get here, we've exceeded max retries
  throw lastError;
}

/**
 * Fetches perpetuals information from HyperLiquid API
 */
export const fetchPerpetuals = async (): Promise<Perpetual[]> => {
  try {
    // Updated to use the correct API endpoint and request format
    const response = await makeApiRequest<any>({
      method: 'post',
      url: `${API_BASE_URL}/info`,
      data: {
        type: "meta"
      },
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // The response format is different, we need to extract the universe array
    if (response.data && response.data.universe && Array.isArray(response.data.universe)) {
      return response.data.universe;
    }
    
    console.error('Unexpected response format from HyperLiquid API:', response.data);
    return [];
  } catch (error) {
    console.error('Error fetching perpetuals:', error);
    throw new Error('Failed to fetch perpetuals from HyperLiquid API');
  }
};

/**
 * Fetches position opening times using the userFillsByTime endpoint
 * Returns a map of coin -> timestamp of when the position was opened
 */
export const fetchPositionEntryTimes = async (address: string): Promise<Record<string, number>> => {
  try {
    // Get fills from the last 30 days (30 * 24 * 60 * 60 * 1000 ms)
    const startTime = Date.now() - 30 * 24 * 60 * 60 * 1000;
    
    console.log(`Fetching position entry times for ${address}, startTime: ${startTime} (${new Date(startTime).toISOString()})`);
    
    const response = await makeApiRequest<UserFillsResponse[]>({
      method: 'post',
      url: `${API_BASE_URL}/info`,
      data: {
        type: "userFillsByTime",
        user: address,
        startTime: startTime
      }
    }, "userFillsByTime");
    
    if (!response.data || !Array.isArray(response.data)) {
      console.log(`No fill data found for ${address.substring(0, 8)}...`);
      return {};
    }
    
    console.log(`Got ${response.data.length} fills for ${address.substring(0, 8)}...`);
    
    // Process the fills and extract the most recent opening time for each coin
    const entryTimes: Record<string, number> = {};
    
    // Sort by time descending to get the most recent entries first
    const fills = response.data.sort((a: UserFillsResponse, b: UserFillsResponse) => b.time - a.time);
    
    // DEBUG: Log the first few fills to see what we're working with
    if (fills.length > 0) {
      console.log(`Sample fill data for ${address.substring(0, 8)}:`, 
        JSON.stringify(fills[0]).substring(0, 200));
    }
    
    let openPositionCount = 0;
    
    // Scan the fills for position openings
    fills.forEach((fill: UserFillsResponse) => {
      if (fill.dir && (fill.dir === 'Open Long' || fill.dir === 'Open Short') && fill.coin && fill.time) {
        // Only record the time if we haven't seen this coin yet (most recent comes first due to sorting)
        if (!entryTimes[fill.coin]) {
          openPositionCount++;
          entryTimes[fill.coin] = fill.time;
          // DEBUG: Log the timestamps we're recording
          console.log(`Found ${fill.dir} for ${fill.coin} at time ${fill.time} (${new Date(fill.time).toISOString()})`);
        }
      }
    });
    
    console.log(`Found entry times for ${Object.keys(entryTimes).length}/${openPositionCount} assets for ${address.substring(0, 8)}...`);
    
    // Log the timestamps to debug
    for (const [coin, time] of Object.entries(entryTimes)) {
      console.log(`Entry time for ${coin}: ${time} (${new Date(time).toISOString()}), hours ago: ${Math.round((Date.now() - time) / (1000 * 60 * 60))}`);
    }
    
    return entryTimes;
  } catch (error) {
    console.error(`Error fetching position entry times for ${address}:`, error);
    return {};
  }
};

/**
 * Fetches positions for a specific wallet address
 */
export const fetchTraderPositions = async (address: string): Promise<Position[]> => {
  try {
    // Fetch position entry times
    const entryTimes = await fetchPositionEntryTimes(address);
    
    // Updated endpoint URL and request type based on documentation
    const response = await makeApiRequest<ClearinghouseStateResponse>({
      method: 'post',
      url: `${API_BASE_URL}/info`,
      data: {
        type: "clearinghouseState",
        user: address
      }
    }, "clearinghouseState");
    
    console.log(`Raw response for ${address.substring(0, 8)}...: ${JSON.stringify(response.data).substring(0, 200)}...`);
    
    // Make sure we got a valid response
    if (!response.data || !response.data.assetPositions) {
      console.log(`Invalid response format for ${address.substring(0, 8)}...`);
      return [];
    }
    
    // Extract positions from the response
    const positions = response.data.assetPositions || [];
    
    if (positions.length === 0) {
      console.log(`No positions found for ${address.substring(0, 8)}...`);
      return [];
    }
    
    console.log(`Found ${positions.length} positions for ${address.substring(0, 8)}...`);
    
    // Filter and map positions to our format
    const validPositions = positions
      .filter((pos: any) => {
        // Check if we have all the required fields in the correct nesting
        const isValid = 
          pos.position && 
          pos.position.coin &&
          pos.position.szi !== undefined && 
          pos.position.entryPx !== undefined &&
          pos.position.leverage && pos.position.leverage.value !== undefined;
        
        if (!isValid) {
          console.log(`Skipping position with missing data for ${address.substring(0, 8)}...: ${JSON.stringify(pos).substring(0, 200)}...`);
        }
        
        return isValid;
      })
      .map((pos: any) => {
        // Extract values with proper nesting
        const position = pos.position;
        const szi = Number(position.szi);
        // No need to apply szDecimals - szi is already in human-readable format
        const entryPx = Number(position.entryPx);
        // Leverage is a complex object with a value property
        const leverage = Number(position.leverage.value);
        const liquidationPx = Number(position.liquidationPx || 0);
        const marginUsed = Number(position.marginUsed || 0);
        const positionValue = Number(position.positionValue || 0);
        const unrealizedPnl = Number(position.unrealizedPnl || 0);
        // Use returnOnEquity as the PNL percentage (convert from decimal to percentage)
        const unrealizedPnlPercent = position.returnOnEquity ? 
          Number(position.returnOnEquity) * 100 : 0;
        
        // Use the entry time from fills data if available
        // This provides accurate position opening time
        const coin = position.coin;
        // Important: Make sure we're getting the right entry time. If we don't have data,
        // use a timestamp from 24 hours ago (not current time) to ensure hours ago shows a value
        const now = Date.now();
        const oneDayAgo = now - (24 * 60 * 60 * 1000);
        const entryTime = entryTimes[coin] || (position.entryTime ? parseInt(position.entryTime, 10) : oneDayAgo);
        
        // Debug entry time calculation
        console.log(`Position ${coin} entry time: ${entryTime} (${new Date(entryTime).toISOString()}), ` + 
                    `hours ago: ${Math.round((now - entryTime) / (1000 * 60 * 60))}`);
        
        return {
          coin: position.coin,
          entryPx: entryPx,
          entryTime: entryTime,
          size: szi,
          leverage: leverage,
          liquidationPx: liquidationPx,
          marginUsed: marginUsed,
          isLong: szi > 0,
          user: address,
          positionValue: positionValue,
          unrealizedPnl: unrealizedPnl,
          unrealizedPnlPercent: unrealizedPnlPercent
        };
      });
    
    console.log(`Valid positions for ${address.substring(0, 8)}...: ${validPositions.length}/${positions.length}`);
    return validPositions;
  } catch (error) {
    console.error(`Error fetching positions for ${address}:`, error);
    return [];
  }
};

/**
 * Helper function to add delay between API calls
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetches positions for multiple wallet addresses
 */
export const fetchMultipleTraderPositions = async (addresses: string[]): Promise<Trader[]> => {
  // Try to acquire the lock
  if (!await acquireLock()) {
    console.log('Another instance is already processing addresses. Skipping to prevent duplicate processing.');
    return [];
  }
  
  try {
    const traders: Trader[] = [];
    
    // Process addresses sequentially to respect rate limits
    console.log(`Processing ${addresses.length} addresses sequentially...`);
    
    // Start progress tracking - estimate total work units
    // Each address requires 2 API calls, and we'll add a bit of buffer
    const totalWorkUnits = addresses.length * 2;
    let completedWorkUnits = 0;
    
    // Emit initial progress event
    progressEmitter.emit('progress', {
      requestId: Date.now().toString(), // Use timestamp as request ID
      completed: completedWorkUnits,
      total: totalWorkUnits,
      percentage: 0
    });
    
    // Process each address
    for (let i = 0; i < addresses.length; i++) {
      const address = addresses[i];
      console.log(`Processing address ${i+1}/${addresses.length}: ${address.substring(0, 8)}...`);
      
      try {
        // First API call completed (fetchPositionEntryTimes inside fetchTraderPositions)
        await fetchPositionEntryTimes(address);
        completedWorkUnits += 1;
        
        // Emit progress event after first API call
        progressEmitter.emit('progress', {
          requestId: Date.now().toString(),
          completed: completedWorkUnits,
          total: totalWorkUnits,
          percentage: Math.round((completedWorkUnits / totalWorkUnits) * 100)
        });
        
        // Second API call for this address
        const positions = await fetchTraderPositions(address);
        completedWorkUnits += 1;
        
        // Emit progress event after second API call
        progressEmitter.emit('progress', {
          requestId: Date.now().toString(),
          completed: completedWorkUnits,
          total: totalWorkUnits,
          percentage: Math.round((completedWorkUnits / totalWorkUnits) * 100)
        });
        
        // Only add traders with active positions
        if (positions.length > 0) {
          traders.push({
            address: address,
            positions,
            lastUpdated: new Date().toISOString() // Convert Date to ISO string for proper serialization
          });
        }
      } catch (error) {
        console.error(`Error processing address ${address}:`, error);
        // Still count this as work completed even if it failed
        completedWorkUnits += 2;
        
        // Emit progress event with error
        progressEmitter.emit('progress', {
          requestId: Date.now().toString(),
          completed: completedWorkUnits,
          total: totalWorkUnits, 
          percentage: Math.round((completedWorkUnits / totalWorkUnits) * 100),
          error: `Error processing address ${address.substring(0, 8)}`
        });
        
        // Continue with the next address rather than failing the entire batch
      }
    }
    
    // Emit final progress event - 100% complete
    progressEmitter.emit('progress', {
      requestId: Date.now().toString(),
      completed: totalWorkUnits,
      total: totalWorkUnits,
      percentage: 100
    });
    
    console.log(`Finished processing all addresses. Found ${traders.length} traders with active positions.`);
    return traders;
  } catch (error) {
    console.error('Error fetching multiple trader positions:', error);
    throw new Error('Failed to fetch trader positions');
  } finally {
    // Always release the lock, even if there was an error
    releaseLock();
  }
};

export default {
  fetchPerpetuals,
  fetchPositionEntryTimes,
  fetchTraderPositions,
  fetchMultipleTraderPositions,
  progressEmitter  // Export the emitter so it can be used elsewhere
}; 