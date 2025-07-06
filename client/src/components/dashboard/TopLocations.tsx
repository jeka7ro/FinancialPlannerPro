import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../../lib/queryClient";
import { MapPin, TrendingUp } from "lucide-react";

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return { icon: "🥇", color: "text-emerald-500 bg-emerald-500/20" };
    case 2:
      return { icon: "🥈", color: "text-blue-500 bg-blue-500/20" };
    case 3:
      return { icon: "🥉", color: "text-amber-500 bg-amber-500/20" };
    default:
      return { icon: rank.toString(), color: "text-slate-400 bg-slate-500/20" };
  }
};

export default function TopLocations() {
  const { data: locationsData, isLoading, error } = useQuery({
    queryKey: ['/api/locations', 1, 3],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/locations?page=1&limit=3');
      return response.json();
    },
  });

  const { data: cabinetsData } = useQuery({
    queryKey: ['/api/cabinets'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/cabinets');
      return response.json();
    },
  });

  // Extract data from new structure
  const locations = locationsData?.locations || [];
  const cabinets = cabinetsData?.cabinets || [];

  // Calculate revenue for each location based on cabinets
  const getLocationRevenue = (locationId: number) => {
    const locationCabinets = cabinets.filter((cabinet: any) => 
      cabinet.locationId === locationId && cabinet.status === 'active'
    );
    
    return locationCabinets.reduce((sum: number, cabinet: any) => 
      sum + (parseFloat(cabinet.dailyRevenue) || 0), 0
    ) * 7; // Weekly revenue
  };

  // Sort locations by revenue
  const sortedLocations = locations
    .map((location: any) => ({
      ...location,
      revenue: getLocationRevenue(location.id)
    }))
    .sort((a: any, b: any) => b.revenue - a.revenue)
    .slice(0, 3);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Card className="glass-card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <MapPin className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Top Locations</h3>
            <p className="text-sm text-slate-400">Highest revenue locations</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-400 action-button">
          View All
        </Button>
      </div>
      
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="loading-shimmer h-16 rounded-xl"></div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <MapPin className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-white font-semibold mb-2">Error Loading Data</h3>
          <p className="text-slate-400">Unable to load locations</p>
        </div>
      ) : !sortedLocations.length ? (
        <div className="text-center py-8">
          <MapPin className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-white font-semibold mb-2">No Locations</h3>
          <p className="text-slate-400">No locations found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedLocations.map((location: any, index: number) => {
            const rank = index + 1;
            const rankInfo = getRankIcon(rank);
            
            return (
              <div
                key={location.id}
                className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 transition-all duration-200 cursor-pointer border border-slate-700/50"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 ${rankInfo.color} rounded-lg flex items-center justify-center`}>
                    <span className="font-bold text-sm">{rankInfo.icon}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{location.name}</p>
                    <p className="text-xs text-slate-400 flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {location.city}, {location.country}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-400" />
                    <p className={`text-sm font-semibold ${
                      rank === 1 ? 'text-emerald-500' : 
                      rank === 2 ? 'text-blue-500' : 'text-amber-500'
                    }`}>
                      {formatCurrency(location.revenue)}
                    </p>
                  </div>
                  <p className="text-xs text-slate-400">Weekly Revenue</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
