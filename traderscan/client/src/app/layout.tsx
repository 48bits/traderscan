import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GooeyNav } from "../components/GooeyNav";
import { BackgroundSquares } from '@/components/BackgroundSquares';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TraderScan | Hyperliquid Trader Analysis",
  description: "Track and analyze Hyperliquid traders and their performance.",
};

// Navigation items for GooeyNav
const navItems = [
  { label: "Home", href: "/" },
  { label: "Analytics", href: "/analytics" },
  { label: "TraderScan", href: "/traderscan" },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="description" content="TraderScan - HyperLiquid Trader Scanning Tool" />
      </head>
      <body 
        className={inter.className} 
        style={{ backgroundColor: '#000000' }}
        suppressHydrationWarning={true}
      >
        <BackgroundSquares>
          {/* Navigation Bar - Fixed at top with proper spacing */}
          <header className="fixed top-0 left-0 w-full z-40 py-3 bg-black bg-opacity-30 backdrop-blur-sm pointer-events-auto">
            <div className="w-full max-w-3xl mx-auto px-4">
              <GooeyNav items={navItems} />
            </div>
          </header>
          
          {/* Main Content - Adds padding to prevent overlap with fixed nav */}
          <main className="pt-24 text-white pointer-events-auto">
            {children}
          </main>
        </BackgroundSquares>
      </body>
    </html>
  );
}
