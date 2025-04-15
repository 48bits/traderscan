import fs from 'fs';
import path from 'path';
import readline from 'readline';

// File paths
const CSV_FILE_PATH = path.join(__dirname, '../../../hyperliquid_traders_clean_20250316_134657.csv');
const OUTPUT_PATH = path.join(__dirname, '../../data/wallets.json');
const OUTPUT_DIR = path.dirname(OUTPUT_PATH);

async function parseCSV() {
  // Create output directory if it doesn't exist
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`Created directory: ${OUTPUT_DIR}`);
  }

  // Create readable stream for CSV file
  const fileStream = fs.createReadStream(CSV_FILE_PATH);
  
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  
  const walletAddresses: string[] = [];
  let isFirstLine = true;
  
  // Process each line
  for await (const line of rl) {
    // Skip header row
    if (isFirstLine) {
      isFirstLine = false;
      continue;
    }
    
    // Split CSV row by comma
    const columns = line.split(',');
    
    // Extract full address (index 2 based on CSV format)
    if (columns.length >= 3) {
      const fullAddress = columns[2].trim();
      
      // Validate address format - basic check for Ethereum address
      if (/^0x[a-fA-F0-9]{40}$/.test(fullAddress)) {
        walletAddresses.push(fullAddress);
      }
    }
  }
  
  console.log(`Extracted ${walletAddresses.length} valid wallet addresses`);
  
  // Save addresses to wallets.json
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(walletAddresses, null, 2));
  console.log(`Wallet addresses saved to ${OUTPUT_PATH}`);
}

// Execute the function
parseCSV().catch(error => {
  console.error('Error parsing CSV:', error);
}); 