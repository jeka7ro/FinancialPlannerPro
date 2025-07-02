import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";

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
      return '💻';
    case 'maintenance':
      return '🔧';
    case 'inactive':
      return '⚠️';
    default:
      return '❓';
  }
};

export default function EquipmentTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 4;

  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/cabinets', currentPage, limit, searchTerm],
    queryFn: async () => {
      const response = await fetch(`/api/cabinets?page=${currentPage}&limit=${limit}&search=${searchTerm}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch cabinets');
      return response.json();
    },
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  return (
    <>
      <Card className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white">Gaming Equipment Status</h3>
            <p className="text-sm text-slate-400">Real-time cabinet and slot machine monitoring</p>
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
              <span className="absolute left-3 top-3 text-slate-400 text-sm">��</span>
            </div>
            <Button className="floating-action text-white hover:shadow-lg">
              <span className="mr-2">➕</span>
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
          <div className="text-center py-8 text-slate-400">
            <span className="text-2xl mb-2 block">⚠️</span>
            Failed to load equipment data
          </div>
        ) : !data?.cabinets?.length ? (
          <div className="text-center py-8 text-slate-400">
            <span className="text-2xl mb-2 block">📦</span>
            No equipment found
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Equipment ID</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Type</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Location</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Revenue (24h)</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Last Maintenance</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.cabinets.map((cabinet: any) => (
                    <tr key={cabinet.id} className="table-row transition-colors border-b border-white/5 hover:bg-blue-500/10">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <span className="text-sm">{getStatusIcon(cabinet.status)}</span>
                          </div>
                          <span className="text-sm font-medium text-white">{cabinet.serialNumber}</span>
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
                        €{cabinet.dailyRevenue ? Number(cabinet.dailyRevenue).toLocaleString() : '0'}
                      </td>
                      <td className="py-4 px-4 text-sm text-slate-400">
                        {cabinet.lastMaintenanceDate ? 
                          new Date(cabinet.lastMaintenanceDate).toLocaleDateString() : 
                          'Never'
                        }
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-400">
                            👁️
                          </Button>
                          <Button variant="ghost" size="sm" className="text-amber-500 hover:text-amber-400">
                            ✏️
                          </Button>
                          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                            ⋯
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

      {/* Pagination and entries info - SUB tabel */}
      {data?.cabinets?.length > 0 && (
        <div className="flex items-center justify-between mt-2 px-2 text-sm text-slate-400">
          <span>
            Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, data.total)} of {data.total} entries
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="h-8 min-w-[40px] px-3"
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
              className="h-8 min-w-[40px] px-3"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
