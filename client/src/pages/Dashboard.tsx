import { useQuery } from "@tanstack/react-query";
import MetricCard from "@/components/dashboard/MetricCard";
import RevenueChart from "@/components/dashboard/RevenueChart";
import EquipmentTable from "@/components/dashboard/EquipmentTable";
import TopLocations from "@/components/dashboard/TopLocations";
import RecentActivity from "@/components/dashboard/RecentActivity";
import SystemAlerts from "@/components/dashboard/SystemAlerts";
// Import logo using public path
const cashpotLogo = "/cashpot-logo.png";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/dashboard/stats'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/stats', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch dashboard stats');
      return response.json();
    },
  });

  // Mock data for metrics when API data is not available
  const mockStats = {
    totalRevenue: 2847394,
    activeCabinets: 1247,
    totalLocations: 89,
    avgDailyPlay: 18943
  };

  const displayStats = stats || mockStats;

  return (
    <div className="space-y-6">
      {/* Header with Logo */}
      <div className="flex items-center gap-4 mb-8">
        <img 
          src={cashpotLogo} 
          alt="CASHPOT" 
          className="h-12 w-auto"
        />
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-slate-400">CASHPOT - Gaming Operations Overview</p>
        </div>
      </div>
      {/* KPI Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={`€${displayStats.totalRevenue?.toLocaleString() || '0'}`}
          change={{ value: "+12.5%", trend: "up" }}
          icon="💰"
          className="metric-card"
        />
        
        <MetricCard
          title="Active Cabinets"
          value={displayStats.activeCabinets?.toLocaleString() || '0'}
          change={{ value: "+3.2%", trend: "up" }}
          icon="💻"
          className="metric-card"
        />
        
        <MetricCard
          title="Locations"
          value={displayStats.totalLocations?.toLocaleString() || '0'}
          change={{ value: "+2.1%", trend: "up" }}
          icon="📍"
          className="metric-card"
        />
        
        <MetricCard
          title="Avg. Daily Play"
          value={`€${displayStats.avgDailyPlay?.toLocaleString() || '0'}`}
          change={{ value: "-1.8%", trend: "down" }}
          icon="🎰"
          className="metric-card"
        />
      </div>

      {/* Charts and Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RevenueChart />
        <TopLocations />
      </div>

      {/* Gaming Equipment Status */}
      <EquipmentTable />

      {/* Recent Activity & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity />
        <SystemAlerts />
      </div>
    </div>
  );
}
