import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { AlertItem } from "@/lib/types";

const mockAlerts: AlertItem[] = [
  {
    id: "1",
    type: "error",
    title: "Equipment Offline",
    description: "CB-2024-089 at Diamond Club Timisoara has been offline for 2 hours",
    timestamp: new Date(),
    actionLabel: "Investigate",
    actionUrl: "/cabinets/89"
  },
  {
    id: "2", 
    type: "warning",
    title: "Maintenance Due",
    description: "5 machines require scheduled maintenance within 48 hours",
    timestamp: new Date(),
    actionLabel: "Schedule",
    actionUrl: "/cabinets?filter=maintenance-due"
  },
  {
    id: "3",
    type: "info",
    title: "ONJN Report Due", 
    description: "Monthly compliance report due in 3 days",
    timestamp: new Date(),
    actionLabel: "Prepare",
    actionUrl: "/onjn/reports"
  }
];

const getAlertStyle = (type: AlertItem['type']) => {
  switch (type) {
    case 'error':
      return {
        container: "bg-red-500/10 border border-red-500/20",
        icon: "⚠️",
        iconBg: "bg-red-500/20 text-red-500",
        actionColor: "text-red-400 hover:text-red-300"
      };
    case 'warning':
      return {
        container: "bg-amber-500/10 border border-amber-500/20", 
        icon: "⏰",
        iconBg: "bg-amber-500/20 text-amber-500",
        actionColor: "text-amber-400 hover:text-amber-300"
      };
    case 'info':
      return {
        container: "bg-blue-500/10 border border-blue-500/20",
        icon: "📄",
        iconBg: "bg-blue-500/20 text-blue-500", 
        actionColor: "text-blue-400 hover:text-blue-300"
      };
    default:
      return {
        container: "bg-slate-500/10 border border-slate-500/20",
        icon: "ℹ️",
        iconBg: "bg-slate-500/20 text-slate-400",
        actionColor: "text-slate-400 hover:text-slate-300"
      };
  }
};

export default function SystemAlerts() {
  const activeAlertsCount = mockAlerts.filter(alert => alert.type === 'error' || alert.type === 'warning').length;

  return (
    <Card className="glass-card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">System Alerts</h3>
        <Badge variant="destructive" className="bg-red-500/20 text-red-400">
          {activeAlertsCount} Active
        </Badge>
      </div>
      
      <div className="space-y-4">
        {mockAlerts.map((alert) => {
          const alertStyle = getAlertStyle(alert.type);
          
          return (
            <div
              key={alert.id}
              className={`flex items-start space-x-4 p-3 rounded-xl ${alertStyle.container}`}
            >
              <div className={`w-8 h-8 ${alertStyle.iconBg} rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}>
                <span className="text-sm">{alertStyle.icon}</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{alert.title}</p>
                <p className="text-xs text-slate-400 mt-1">{alert.description}</p>
                {alert.actionLabel && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`text-xs ${alertStyle.actionColor} mt-2 h-auto p-0 hover:bg-transparent`}
                  >
                    {alert.actionLabel} →
                  </Button>
                )}
              </div>
            </div>
          );
        })}
        
        {mockAlerts.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            <span className="text-2xl mb-2 block">✅</span>
            No active alerts
          </div>
        )}
      </div>
    </Card>
  );
}
