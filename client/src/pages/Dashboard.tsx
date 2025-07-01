import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
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
  User2
} from "lucide-react";
import LocationsMap from "@/components/dashboard/LocationsMap";
import { ProviderLogo } from "@/components/ui/provider-logo";

// Import logo using public path
const cashpotLogo = "/cashpot-logo.png";

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
  status: string;
}

interface Cabinet {
  id: number;
  model: string;
  status: string;
  locationId: number | null;
}

interface GameMix {
  id: number;
  name: string;
  description: string;
  status: string;
}

interface Invoice {
  id: number;
  invoiceNumber: string;
  totalAmount: number;
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

  // Fetch dashboard statistics
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/stats', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch dashboard stats');
      return response.json();
    },
  });
  const { data: providers, isLoading: providersLoading } = useQuery({
    queryKey: ['providers'],
    queryFn: async () => {
      const response = await fetch('/api/providers', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch providers');
      return response.json();
    },
  });
  const { data: cabinets, isLoading: cabinetsLoading } = useQuery({
    queryKey: ['cabinets'],
    queryFn: async () => {
      const response = await fetch('/api/cabinets', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch cabinets');
      return response.json();
    },
  });
  const { data: gameMixes, isLoading: gameMixesLoading } = useQuery({
    queryKey: ['game-mixes'],
    queryFn: async () => {
      const response = await fetch('/api/game-mixes', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch game mixes');
      return response.json();
    },
  });
  const { data: invoices, isLoading: invoicesLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const response = await fetch('/api/invoices', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch invoices');
      return response.json();
    },
  });
  const { data: legalDocuments, isLoading: legalLoading } = useQuery({
    queryKey: ['legal-documents'],
    queryFn: async () => {
      const response = await fetch('/api/legal-documents', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch legal documents');
      return response.json();
    },
  });

  const mockStats: DashboardStats = {
    totalRevenue: 2847394,
    activeCabinets: 1247,
    totalLocations: 89,
    avgDailyPlay: 18943,
    totalProviders: 15,
    totalGameMixes: 8,
    paidInvoices: 156,
    unpaidInvoices: 23,
    legalIssues: 5,
    activeProviders: 10,
    activeLocations: 50,
    activeUsers: 1000
  };
  const displayStats = stats || mockStats;

  const toggleWidget = (widget: keyof typeof visibleWidgets) => {
    setVisibleWidgets(prev => ({ ...prev, [widget]: !prev[widget] }));
  };
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(amount);
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();
  const getStatusColor = (status: string | undefined | null) => {
    switch ((status || '').toLowerCase()) {
      case 'active': case 'paid': case 'approved': return 'bg-green-100 text-green-800';
      case 'inactive': case 'unpaid': case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'expired': case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 p-6 -mt-12">

      {/* Filters Row - now below the title */}
      <div className="flex space-x-2 mt-4">
        {Object.keys(visibleWidgets).map((key) => (
          <Button key={key} variant="outline" size="sm" onClick={() => toggleWidget(key as any)} className="flex items-center space-x-2">
            {visibleWidgets[key as keyof typeof visibleWidgets] ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            <span>{key}</span>
          </Button>
        ))}
      </div>
      {/* Stats Grid - Remove Total Revenue Card */}
      {visibleWidgets.stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Active Cabinets Card */}
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">Active Cabinets</CardTitle>
              <Gamepad2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">{displayStats.activeCabinets}</div>
              <Progress value={85} className="mt-2" />
            </CardContent>
          </Card>
          {/* Active Providers Card */}
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">Active Providers</CardTitle>
              <Users2 className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{displayStats.activeProviders}</div>
              <Progress value={90} className="mt-2" />
            </CardContent>
          </Card>
          {/* Active Locations Card */}
          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-700">Active Locations</CardTitle>
              <MapPin className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-900">{displayStats.activeLocations}</div>
              <Progress value={75} className="mt-2" />
            </CardContent>
          </Card>
          {/* Active Users Card */}
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700">Active Users</CardTitle>
              <User2 className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">{displayStats.activeUsers}</div>
              <Progress value={60} className="mt-2" />
            </CardContent>
          </Card>
        </div>
      )}
      {/* Map Widget - positioned first and MUCH WIDER */}
      {visibleWidgets.map && (
        <div className="mb-8">
          <LocationsMap />
        </div>
      )}
      
      {/* Providers and Cabinets Cards in 2 columns below map */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Providers Card */}
        {visibleWidgets.providers && (
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users2 className="h-5 w-5 text-blue-600" /> Providers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {providers?.providers?.slice(0, 5).map((provider: Provider) => (
                <div key={provider.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <div className="flex items-center gap-3">
                    <ProviderLogo providerId={provider.id} providerName={provider.name} size="md" />
                    <div>
                      <p className="font-medium">{provider.name}</p>
                      <p className="text-sm text-gray-600">{provider.companyName}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(provider.status)}>{provider.status}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
        
        {/* Cabinets Card */}
        {visibleWidgets.cabinets && (
          <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-cyan-700">
                <Gamepad2 className="h-5 w-5" />
                <span>Cabinets ({cabinets?.cabinets?.length || 0})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {cabinetsLoading ? (
                  <div className="text-center py-4">Loading cabinets...</div>
                ) : (
                  cabinets?.cabinets?.slice(0, 5).map((cabinet: Cabinet) => (
                    <div key={cabinet.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <div>
                        <p className="font-medium">{cabinet.model}</p>
                        <p className="text-sm text-gray-600">ID: {cabinet.id}</p>
                      </div>
                      <Badge className={getStatusColor(cabinet.status)}>{cabinet.status}</Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="legal">Legal & Compliance</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Overview content can be added here */}
          </div>
        </TabsContent>
        <TabsContent value="financial" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {visibleWidgets.invoices && (
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-blue-700">
                    <CreditCard className="h-5 w-5" />
                    <span>Invoices Overview</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-4 bg-green-100 rounded-lg">
                      <div className="text-2xl font-bold text-green-700">{displayStats.paidInvoices}</div>
                      <div className="text-sm text-green-600">Paid</div>
                    </div>
                    <div className="text-center p-4 bg-red-100 rounded-lg">
                      <div className="text-2xl font-bold text-red-700">{displayStats.unpaidInvoices}</div>
                      <div className="text-sm text-red-600">Unpaid</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {invoicesLoading ? (
                      <div className="text-center py-4">Loading invoices...</div>
                    ) : (
                      invoices?.invoices?.slice(0, 3).map((invoice: Invoice) => (
                        <div key={invoice.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                          <div>
                            <p className="font-medium">{invoice.invoiceNumber}</p>
                            <p className="text-sm text-gray-600">{formatCurrency(invoice.totalAmount)}</p>
                          </div>
                          <Badge className={getStatusColor(invoice.status)}>{invoice.status}</Badge>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
            {visibleWidgets.gameMixes && (
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-purple-700">
                    <Gamepad2 className="h-5 w-5" />
                    <span>Game Mixes ({gameMixes?.gameMixes?.length || 0})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {gameMixesLoading ? (
                      <div className="text-center py-4">Loading game mixes...</div>
                    ) : (
                      gameMixes?.gameMixes?.slice(0, 5).map((mix: GameMix) => (
                        <div key={mix.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium">{mix.name}</p>
                            <p className="text-sm text-gray-600 truncate">{mix.description}</p>
                          </div>
                          <Badge className={getStatusColor(mix.status)}>{mix.status}</Badge>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
        <TabsContent value="operations" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {visibleWidgets.cabinets && (
              <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-cyan-700">
                    <Gamepad2 className="h-5 w-5" />
                    <span>Cabinets Management</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Model</TableHead>
                        <TableHead>ID</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cabinetsLoading ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center">Loading...</TableCell>
                        </TableRow>
                      ) : (
                        cabinets?.cabinets?.slice(0, 5).map((cabinet: Cabinet) => (
                          <TableRow key={cabinet.id}>
                            <TableCell className="font-medium">{cabinet.model}</TableCell>
                            <TableCell>{cabinet.id}</TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(cabinet.status)}>{cabinet.status}</Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
        <TabsContent value="legal" className="space-y-4">
          {visibleWidgets.legalIssues && (
            <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-red-700">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Legal & Compliance Issues ({displayStats.legalIssues})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>5 documents</strong> require attention before expiry
                    </AlertDescription>
                  </Alert>
                  <div className="space-y-3">
                    {legalLoading ? (
                      <div className="text-center py-4">Loading legal documents...</div>
                    ) : (
                      legalDocuments?.legalDocuments?.slice(0, 5).map((doc: LegalDocument) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                          <div>
                            <p className="font-medium">{doc.title}</p>
                            <p className="text-sm text-gray-600">Expires: {formatDate(doc.expiryDate)}</p>
                          </div>
                          <Badge className={getStatusColor(doc.status)}>{doc.status}</Badge>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
