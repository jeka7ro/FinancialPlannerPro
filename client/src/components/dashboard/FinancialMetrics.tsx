import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard, 
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react";

interface FinancialMetricsProps {
  totalRevenue: number;
  paidInvoices: number;
  unpaidInvoices: number;
  overdueInvoices: number;
  totalInvoices: number;
  avgDailyRevenue: number;
}

export default function FinancialMetrics({
  totalRevenue,
  paidInvoices,
  unpaidInvoices,
  overdueInvoices,
  totalInvoices,
  avgDailyRevenue
}: FinancialMetricsProps) {
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);

  const paidPercentage = totalInvoices > 0 ? (paidInvoices / totalInvoices) * 100 : 0;
  const unpaidPercentage = totalInvoices > 0 ? (unpaidInvoices / totalInvoices) * 100 : 0;
  const overduePercentage = totalInvoices > 0 ? (overdueInvoices / totalInvoices) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Revenue */}
      <Card className="glass-card border-green-500/20 hover:border-green-500/40 transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-green-400">
            Total Revenue
          </CardTitle>
          <DollarSign className="h-4 w-4 text-green-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-300">
            {formatCurrency(totalRevenue)}
          </div>
          <p className="text-xs text-green-400/70 mt-1">
            From paid invoices
          </p>
        </CardContent>
      </Card>

      {/* Daily Revenue */}
      <Card className="glass-card border-blue-500/20 hover:border-blue-500/40 transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-400">
            Daily Revenue
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-blue-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-300">
            {formatCurrency(avgDailyRevenue)}
          </div>
          <p className="text-xs text-blue-400/70 mt-1">
            Average per day
          </p>
        </CardContent>
      </Card>

      {/* Invoice Status */}
      <Card className="glass-card border-purple-500/20 hover:border-purple-500/40 transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-purple-400">
            Invoice Status
          </CardTitle>
          <CreditCard className="h-4 w-4 text-purple-400" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-3 w-3 text-green-400" />
                <span className="text-sm text-green-300">Paid</span>
              </div>
              <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">
                {paidInvoices}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="h-3 w-3 text-yellow-400" />
                <span className="text-sm text-yellow-300">Pending</span>
              </div>
              <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                {unpaidInvoices}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-3 w-3 text-red-400" />
                <span className="text-sm text-red-300">Overdue</span>
              </div>
              <Badge variant="secondary" className="bg-red-500/20 text-red-300 border-red-500/30">
                {overdueInvoices}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Progress */}
      <Card className="glass-card border-orange-500/20 hover:border-orange-500/40 transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-orange-400">
            Payment Progress
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-orange-400" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-orange-300">Paid</span>
                <span className="text-orange-300">{paidPercentage.toFixed(1)}%</span>
              </div>
              <Progress value={paidPercentage} className="h-2 bg-orange-500/20">
                <div className="h-full bg-green-500 rounded-full transition-all duration-300" 
                     style={{ width: `${paidPercentage}%` }} />
              </Progress>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-orange-300">Pending</span>
                <span className="text-orange-300">{unpaidPercentage.toFixed(1)}%</span>
              </div>
              <Progress value={unpaidPercentage} className="h-2 bg-orange-500/20">
                <div className="h-full bg-yellow-500 rounded-full transition-all duration-300" 
                     style={{ width: `${unpaidPercentage}%` }} />
              </Progress>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-orange-300">Overdue</span>
                <span className="text-orange-300">{overduePercentage.toFixed(1)}%</span>
              </div>
              <Progress value={overduePercentage} className="h-2 bg-orange-500/20">
                <div className="h-full bg-red-500 rounded-full transition-all duration-300" 
                     style={{ width: `${overduePercentage}%` }} />
              </Progress>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 