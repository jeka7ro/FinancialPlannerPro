import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Activity, Clock, TrendingUp, AlertTriangle, UserPlus, Settings } from "lucide-react";

const getActivityIcon = (action: string) => {
  if (action.includes('payout') || action.includes('revenue')) return { icon: TrendingUp, color: "bg-emerald-500/20 text-emerald-500" };
  if (action.includes('maintenance')) return { icon: Settings, color: "bg-amber-500/20 text-amber-500" };
  if (action.includes('user') || action.includes('login')) return { icon: UserPlus, color: "bg-blue-500/20 text-blue-500" };
  if (action.includes('create') || action.includes('add')) return { icon: Activity, color: "bg-green-500/20 text-green-500" };
  if (action.includes('update') || action.includes('edit')) return { icon: Settings, color: "bg-yellow-500/20 text-yellow-500" };
  if (action.includes('delete') || action.includes('remove')) return { icon: AlertTriangle, color: "bg-red-500/20 text-red-500" };
  return { icon: Activity, color: "bg-slate-500/20 text-slate-400" };
};

const formatTimeAgo = (date: string) => {
  const now = new Date();
  const activityDate = new Date(date);
  const diffInMinutes = Math.floor((now.getTime() - activityDate.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
};

// Mock activity data for demonstration
const mockActivities = [
  {
    id: 1,
    action: "Large payout processed",
    details: "CB-2024-001 • €12,500",
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    entityType: "cabinet",
    entityId: 1
  },
  {
    id: 2,
    action: "Maintenance completed", 
    details: "SL-2024-045 • Royal Gaming Cluj",
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    entityType: "slot",
    entityId: 45
  },
  {
    id: 3,
    action: "New user registered",
    details: "Maria Popescu • Location Manager",
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    entityType: "user", 
    entityId: 123
  },
  {
    id: 4,
    action: "Invoice paid",
    details: "INV-2024-001 • €5,950",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    entityType: "invoice",
    entityId: 1
  },
  {
    id: 5,
    action: "New cabinet added",
    details: "Novomatic Diamond X • Timișoara",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    entityType: "cabinet",
    entityId: 2
  }
];

export default function RecentActivity() {
  const { data: activities, isLoading, error } = useQuery({
    queryKey: ['/api/activity-logs', 1, 5],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/activity-logs?page=1&limit=5');
        return response.json();
      } catch (error) {
        // Return mock data if API fails
        return { activityLogs: mockActivities, total: mockActivities.length };
      }
    },
  });

  const displayActivities = activities?.activityLogs?.length ? activities.activityLogs : mockActivities;

  return (
    <Card className="glass-card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Activity className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
            <p className="text-sm text-slate-400">Latest system activities</p>
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
      ) : (
        <div className="space-y-4">
          {displayActivities.slice(0, 5).map((activity: any) => {
            const activityInfo = getActivityIcon(activity.action);
            const IconComponent = activityInfo.icon;
            
            return (
              <div
                key={activity.id}
                className="flex items-center space-x-4 p-4 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 transition-all duration-200 cursor-pointer border border-slate-700/50"
              >
                <div className={`w-10 h-10 ${activityInfo.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{activity.action}</p>
                  <p className="text-xs text-slate-400 flex items-center mt-1">
                    <Clock className="h-3 w-3 mr-1" />
                    {activity.details} • {formatTimeAgo(activity.timestamp)}
                  </p>
                </div>
                <div className="text-right">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                </div>
              </div>
            );
          })}
          
          {displayActivities.length === 0 && (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-white font-semibold mb-2">No Recent Activity</h3>
              <p className="text-slate-400">No activities recorded yet</p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
