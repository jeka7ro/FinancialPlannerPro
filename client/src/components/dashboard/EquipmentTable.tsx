import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Eye, Edit, MoreHorizontal, Gamepad2, Activity } from "lucide-react";

interface Equipment {
  id: number;
  serialNumber: string;
  model: string;
  type: string;
  location: string;
  status: 'active' | 'maintenance' | 'inactive';
  dailyRevenue: number;
  lastMaintenance: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'status-active';
    case 'maintenance':
      return 'status-maintenance';
    case 'inactive':
      return 'status-inactive';
    default:
      return 'bg-gray-500/20 text-gray-400';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'active':
      return <Activity className="w-4 h-4 text-green-400" />;
    case 'maintenance':
      return <Edit className="w-4 h-4 text-yellow-400" />;
    case 'inactive':
      return <MoreHorizontal className="w-4 h-4 text-red-400" />;
    default:
      return <Gamepad2 className="w-4 h-4 text-gray-400" />;
  }
};

export default function EquipmentTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 4;

  const { data: cabinetsData, isLoading, error } = useQuery({
    queryKey: ['/api/cabinets', currentPage, limit, searchTerm],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/cabinets?page=${currentPage}&limit=${limit}&search=${searchTerm}`);
      return response.json();
    },
  });

  // Extract data from new structure
  const cabinets = cabinetsData?.cabinets || [];
  const total = cabinetsData?.total || 0;

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(total / limit);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <>
      <Card className="glass-card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Gamepad2 className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Gaming Equipment Status</h3>
              <p className="text-sm text-slate-400">Real-time cabinet and slot machine monitoring</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search equipment..."
                value={searchTerm}
                onChange={handleSearch}
                className="form-input w-64 pl-10"
              />
              <Search className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
            </div>
            <Button className="floating-action">
              <Plus className="w-4 h-4 mr-2" />
              Add Equipment
            </Button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="loading-shimmer h-16 rounded-xl"></div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <Gamepad2 className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-white font-semibold mb-2">Error Loading Data</h3>
            <p className="text-slate-400">Failed to load equipment data</p>
          </div>
        ) : !cabinets.length ? (
          <div className="text-center py-8">
            <Gamepad2 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-white font-semibold mb-2">No Equipment</h3>
            <p className="text-slate-400">No equipment found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="enhanced-table">
                <thead>
                  <tr>
                    <th className="text-slate-300">Equipment ID</th>
                    <th className="text-slate-300">Type</th>
                    <th className="text-slate-300">Location</th>
                    <th className="text-slate-300">Status</th>
                    <th className="text-slate-300">Revenue (24h)</th>
                    <th className="text-slate-300">Last Maintenance</th>
                    <th className="text-right text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cabinets.map((cabinet: any) => (
                    <tr key={cabinet.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            {getStatusIcon(cabinet.status)}
                          </div>
                          <span className="text-sm font-medium text-white">CB-{cabinet.id.toString().padStart(3, '0')}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-slate-300">{cabinet.model}</td>
                      <td className="py-4 px-4 text-sm text-slate-300">
                        {cabinet.locationId ? `Location ${cabinet.locationId}` : 'Unassigned'}
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={`${getStatusColor(cabinet.status)} border`}>
                          {cabinet.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-sm font-semibold text-emerald-500">
                        {formatCurrency(parseFloat(cabinet.dailyRevenue || '0'))}
                      </td>
                      <td className="py-4 px-4 text-sm text-slate-400">
                        {cabinet.lastMaintenanceDate ? 
                          new Date(cabinet.lastMaintenanceDate).toLocaleDateString() : 
                          'Never'
                        }
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="ghost" size="sm" className="action-button">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="action-button">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="action-button">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>

      {/* Pagination and entries info */}
      {cabinets.length > 0 && (
        <div className="flex items-center justify-between mt-4 px-2 text-sm text-slate-400">
          <span>
            Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, total)} of {total} entries
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="action-button"
            >
              Previous
            </Button>
            <button
              className="h-8 min-w-[40px] px-3 rounded-full bg-blue-500 text-white font-bold flex items-center justify-center"
              disabled
            >
              {currentPage}
            </button>
            <Button
              variant="ghost"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="action-button"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
