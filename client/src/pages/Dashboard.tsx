import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Building2, 
  Gamepad2, 
  CreditCard, 
  AlertTriangle, 
  MapPin, 
  DollarSign,
  Eye,
  EyeOff,
  Users2,
  User2,
  TrendingUp,
  Activity
} from "lucide-react";
import LocationsMap from "@/components/dashboard/LocationsMap";
import FinancialMetrics from "@/components/dashboard/FinancialMetrics";
import { ProviderLogo } from "@/components/ui/provider-logo";

import cashpotLogo from '@/assets/cashpot-logo.png';

interface DashboardStats {
  totalRevenue: number;
  activeCabinets: number;
  totalLocations: number;
  avgDailyPlay: number;
  totalProviders: number;
  totalGameMixes: number;
  paidInvoices: number;
  unpaidInvoices: number;
  legalIssues: number;
  activeProviders: number;
  activeLocations: number;
  activeUsers: number;
}

interface Provider {
  id: number;
  name: string;
  companyName: string;
  isActive: boolean;
}

interface Cabinet {
  id: number;
  model: string;
  status: string;
  providerId: number;
}

interface GameMix {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  gameCount: number;
}

interface Invoice {
  id: number;
  invoiceNumber: string;
  totalAmount: string;
  status: string;
  dueDate: string;
}

interface LegalDocument {
  id: number;
  title: string;
  status: string;
  expiryDate: string;
}

export default function Dashboard() {
  const [visibleWidgets, setVisibleWidgets] = useState({
    providers: true,
    cabinets: true,
    gameMixes: true,
    invoices: true,
    legalIssues: true,
    map: true,
    stats: true
  });

  // Fetch dashboard data using new mock structure
  const { data: providersData, isLoading: providersLoading } = useQuery({
    queryKey: ['providers'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/providers');
      return response.json();
    },
  });

  const { data: cabinetsData, isLoading: cabinetsLoading } = useQuery({
    queryKey: ['cabinets'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/cabinets');
      return response.json();
    },
  });

  const { data: gameMixesData, isLoading: gameMixesLoading } = useQuery({
    queryKey: ['game-mixes'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/game-mixes');
      return response.json();
    },
  });

  const { data: invoicesData, isLoading: invoicesLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/invoices');
      return response.json();
    },
  });

  const { data: legalDocumentsData, isLoading: legalLoading } = useQuery({
    queryKey: ['legal-documents'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/legal-documents');
      return response.json();
    },
  });

  const { data: slotsData, isLoading: slotsLoading } = useQuery({
    queryKey: ['slots'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/slots');
      return response.json();
    },
  });

  // Extract data from new structure
  const providers = providersData?.providers || [];
  const cabinets = cabinetsData?.cabinets || [];
  const gameMixes = gameMixesData?.gameMixes || [];
  const invoices = invoicesData?.invoices || [];
  const legalDocuments = legalDocumentsData?.legalDocuments || [];
  const slots = slotsData?.slots || [];

  // Calculate stats from actual data
  const activeCabinets = cabinets.filter((cabinet: Cabinet) => cabinet.status === 'active').length;
  const activeProviders = providers.filter((provider: Provider) => provider.isActive).length;
  const activeGameMixes = gameMixes.filter((mix: GameMix) => mix.isActive).length;
  const paidInvoices = invoices.filter((invoice: Invoice) => invoice.status === 'paid').length;
  const unpaidInvoices = invoices.filter((invoice: Invoice) => invoice.status === 'pending').length;
  const overdueInvoices = invoices.filter((invoice: Invoice) => invoice.status === 'overdue').length;
  const totalRevenue = invoices
    .filter((invoice: Invoice) => invoice.status === 'paid')
    .reduce((sum: number, invoice: Invoice) => sum + parseFloat(invoice.totalAmount), 0);
  
  // Calculate daily revenue from slots
  const totalDailyRevenue = slots.reduce((sum: number, slot: any) => 
    sum + parseFloat(slot.dailyRevenue || '0'), 0
  );

  const mockStats: DashboardStats = {
    totalRevenue,
    activeCabinets,
    totalLocations: 6, // Updated from mock data
    avgDailyPlay: Math.round(totalDailyRevenue * 100), // Convert to play amount
    totalProviders: providers.length,
    totalGameMixes: gameMixes.length,
    paidInvoices,
    unpaidInvoices,
    legalIssues: overdueInvoices,
    activeProviders,
    activeLocations: 6,
    activeUsers: 6
  };

  const toggleWidget = (widget: keyof typeof visibleWidgets) => {
    setVisibleWidgets(prev => ({ ...prev, [widget]: !prev[widget] }));
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(amount);
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();
  
  const getStatusColor = (status: string | undefined | null) => {
    switch ((status || '').toLowerCase()) {
      case 'active': case 'paid': case 'approved': return 'status-active';
      case 'inactive': case 'unpaid': case 'pending': return 'status-pending';
      case 'expired': case 'overdue': case 'maintenance': return 'status-overdue';
      default: return 'status-badge';
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header with Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Financial Planner Pro</h1>
          <p className="text-slate-400 text-lg">Comprehensive Gaming Management Dashboard</p>
        </div>
        <div className="flex items-center space-x-4">
          <Activity className="h-8 w-8 text-blue-400" />
          <TrendingUp className="h-8 w-8 text-green-400" />
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap gap-2">
        {Object.keys(visibleWidgets).map((key) => (
          <Button 
            key={key} 
            variant="outline" 
            size="sm" 
            onClick={() => toggleWidget(key as any)} 
            className="glass-card border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            {visibleWidgets[key as keyof typeof visibleWidgets] ? 
              <Eye className="h-4 w-4 mr-2" /> : 
              <EyeOff className="h-4 w-4 mr-2" />
            }
            <span className="capitalize">{key}</span>
          </Button>
        ))}
      </div>

      {/* Stats Grid */}
      {visibleWidgets.stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Active Cabinets Card */}
          <Card className="glass-card metric-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Active Cabinets</CardTitle>
              <Gamepad2 className="h-6 w-6 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{mockStats.activeCabinets}</div>
              <Progress value={85} className="mt-2 bg-slate-700" />
              <p className="text-xs text-slate-400 mt-2">85% operational</p>
            </CardContent>
          </Card>

          {/* Active Providers Card */}
          <Card className="glass-card metric-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Active Providers</CardTitle>
              <Building2 className="h-6 w-6 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{mockStats.activeProviders}</div>
              <Progress value={67} className="mt-2 bg-slate-700" />
              <p className="text-xs text-slate-400 mt-2">67% of total</p>
            </CardContent>
          </Card>

          {/* Total Revenue Card */}
          <Card className="glass-card metric-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Total Revenue</CardTitle>
              <DollarSign className="h-6 w-6 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{formatCurrency(mockStats.totalRevenue)}</div>
              <Progress value={92} className="mt-2 bg-slate-700" />
              <p className="text-xs text-slate-400 mt-2">92% target achieved</p>
            </CardContent>
          </Card>

          {/* Active Locations Card */}
          <Card className="glass-card metric-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Active Locations</CardTitle>
              <MapPin className="h-6 w-6 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{mockStats.activeLocations}</div>
              <Progress value={100} className="mt-2 bg-slate-700" />
              <p className="text-xs text-slate-400 mt-2">All locations active</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Financial Metrics */}
      <FinancialMetrics
        totalRevenue={mockStats.totalRevenue}
        paidInvoices={mockStats.paidInvoices}
        unpaidInvoices={mockStats.unpaidInvoices}
        overdueInvoices={mockStats.legalIssues}
        totalInvoices={mockStats.paidInvoices + mockStats.unpaidInvoices + mockStats.legalIssues}
        avgDailyRevenue={Math.round(totalDailyRevenue)}
      />

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="glass-card bg-slate-800/50">
          <TabsTrigger value="overview" className="text-slate-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            Overview
          </TabsTrigger>
          <TabsTrigger value="providers" className="text-slate-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            Providers
          </TabsTrigger>
          <TabsTrigger value="cabinets" className="text-slate-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            Cabinets
          </TabsTrigger>
          <TabsTrigger value="game-mixes" className="text-slate-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            Game Mixes
          </TabsTrigger>
          <TabsTrigger value="invoices" className="text-slate-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            Invoices
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-white">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {invoices.slice(0, 5).map((invoice: Invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                      <div>
                        <p className="text-white font-medium">{invoice.invoiceNumber}</p>
                        <p className="text-slate-400 text-sm">{formatDate(invoice.dueDate)}</p>
                      </div>
                      <Badge className={getStatusColor(invoice.status)}>
                        {invoice.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* System Alerts */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2" />
                  System Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert className="bg-yellow-900/20 border-yellow-600/30">
                    <AlertTriangle className="h-4 w-4 text-yellow-400" />
                    <AlertDescription className="text-yellow-200">
                      2 invoices due this week
                    </AlertDescription>
                  </Alert>
                  <Alert className="bg-green-900/20 border-green-600/30">
                    <AlertTriangle className="h-4 w-4 text-green-400" />
                    <AlertDescription className="text-green-200">
                      All cabinets operational
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Map */}
          {visibleWidgets.map && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-white">Locations Map</CardTitle>
              </CardHeader>
              <CardContent>
                <LocationsMap />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="providers" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white">Gaming Providers</CardTitle>
            </CardHeader>
            <CardContent>
              <Table className="enhanced-table">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-slate-300">Provider</TableHead>
                    <TableHead className="text-slate-300">Company</TableHead>
                    <TableHead className="text-slate-300">Status</TableHead>
                    <TableHead className="text-slate-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {providers.map((provider: Provider) => (
                    <TableRow key={provider.id}>
                      <TableCell className="text-white font-medium">{provider.name}</TableCell>
                      <TableCell className="text-slate-300">{provider.companyName}</TableCell>
                      <TableCell>
                        <Badge className={provider.isActive ? 'status-active' : 'status-inactive'}>
                          {provider.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" className="action-button">
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cabinets" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white">Gaming Cabinets</CardTitle>
            </CardHeader>
            <CardContent>
              <Table className="enhanced-table">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-slate-300">Model</TableHead>
                    <TableHead className="text-slate-300">Status</TableHead>
                    <TableHead className="text-slate-300">Provider</TableHead>
                    <TableHead className="text-slate-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cabinets.map((cabinet: Cabinet) => (
                    <TableRow key={cabinet.id}>
                      <TableCell className="text-white font-medium">{cabinet.model}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(cabinet.status)}>
                          {cabinet.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-300">Provider {cabinet.providerId}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" className="action-button">
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="game-mixes" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white">Game Mixes</CardTitle>
            </CardHeader>
            <CardContent>
              <Table className="enhanced-table">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-slate-300">Name</TableHead>
                    <TableHead className="text-slate-300">Description</TableHead>
                    <TableHead className="text-slate-300">Games</TableHead>
                    <TableHead className="text-slate-300">Status</TableHead>
                    <TableHead className="text-slate-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gameMixes.map((mix: GameMix) => (
                    <TableRow key={mix.id}>
                      <TableCell className="text-white font-medium">{mix.name}</TableCell>
                      <TableCell className="text-slate-300">{mix.description}</TableCell>
                      <TableCell className="text-slate-300">{mix.gameCount} games</TableCell>
                      <TableCell>
                        <Badge className={mix.isActive ? 'status-active' : 'status-inactive'}>
                          {mix.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" className="action-button">
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white">Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <Table className="enhanced-table">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-slate-300">Invoice #</TableHead>
                    <TableHead className="text-slate-300">Amount</TableHead>
                    <TableHead className="text-slate-300">Due Date</TableHead>
                    <TableHead className="text-slate-300">Status</TableHead>
                    <TableHead className="text-slate-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice: Invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="text-white font-medium">{invoice.invoiceNumber}</TableCell>
                      <TableCell className="text-slate-300">{invoice.totalAmount} EUR</TableCell>
                      <TableCell className="text-slate-300">{formatDate(invoice.dueDate)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(invoice.status)}>
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" className="action-button">
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
