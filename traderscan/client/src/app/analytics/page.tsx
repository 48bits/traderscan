import { Dashboard } from '@/components/Dashboard';

export const metadata = {
  title: 'Analytics | TraderScan Quant Bot',
  description: 'Real-time analysis of crypto trader positions and sentiment on HyperLiquid exchange',
};

export default function AnalyticsPage() {
  return (
    <div>
      <Dashboard />
    </div>
  );
} 