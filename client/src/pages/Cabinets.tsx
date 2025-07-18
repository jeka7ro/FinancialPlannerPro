import { useState, useEffect } from "react";
import { ImportExportDialog } from "../components/ui/import-export-dialog";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "../lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "../components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Checkbox } from "../components/ui/checkbox";
import { BulkOperations } from "../components/ui/bulk-operations";
import { AttachmentButton } from "../components/ui/attachment-button";
import { CabinetLogo } from "../components/ui/cabinet-logo";
import { ProviderLogo } from "../components/ui/provider-logo";
import { useForm } from "react-hook-form";
import { useToast } from "../hooks/use-toast";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import type { InsertCabinet } from "@/shared/schema";

export default function Cabinets() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCabinets, setSelectedCabinets] = useState<number[]>([]);
  const [editingCabinet, setEditingCabinet] = useState<any>(null);
  const { toast } = useToast();

  const form = useForm<InsertCabinet>({
    defaultValues: {
      model: "",
      status: "active",
      providerId: undefined,
      webLink: "",
      technicalInfo: "",
    },
  });

  const editForm = useForm<InsertCabinet>({
    defaultValues: {
      model: "",
      status: "active",
      providerId: undefined,
      webLink: "",
      technicalInfo: "",
    },
  });

  // Fetch cabinets with search and pagination
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/cabinets', { page: currentPage, limit, search: searchTerm }],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/cabinets?page=${currentPage}&limit=${limit}&search=${encodeURIComponent(searchTerm)}`);
      return response.json();
    },
  });

  // Fetch providers for dropdown
  const { data: providers } = useQuery({
    queryKey: ['/api/providers'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/providers');
      return response.json();
    },
  });

  // Create cabinet mutation
  const createMutation = useMutation({
    mutationFn: async (newCabinet: InsertCabinet) => {
      return await apiRequest("POST", "/api/cabinets", newCabinet);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cabinets'] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Cabinet created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create cabinet",
        variant: "destructive",
      });
    },
  });

  // Update cabinet mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & InsertCabinet) => {
      return await apiRequest("PUT", `/api/cabinets/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cabinets'] });
      setIsEditDialogOpen(false);
      editForm.reset();
      toast({
        title: "Success",
        description: "Cabinet updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update cabinet",
        variant: "destructive",
      });
    },
  });

  // Delete cabinet mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/cabinets/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cabinets'] });
      toast({
        title: "Success",
        description: "Cabinet deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete cabinet",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertCabinet) => {
    createMutation.mutate(data);
  };

  const onEditSubmit = (data: InsertCabinet) => {
    if (editingCabinet) {
      updateMutation.mutate({ id: editingCabinet.id, ...data });
    }
  };

  const handleEdit = (cabinet: any) => {
    setEditingCabinet(cabinet);
    editForm.reset({
      model: cabinet.model || "",
      status: cabinet.status || "active",
      providerId: cabinet.providerId || undefined,
      webLink: cabinet.webLink || "",
      technicalInfo: cabinet.technicalInfo || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this cabinet?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleLimitChange = (newLimit: number) => {
    console.log('handleLimitChange called with:', newLimit);
    setLimit(newLimit);
    setCurrentPage(1);
    // Force a refetch with the new limit
    queryClient.invalidateQueries({ 
      queryKey: ['/api/cabinets'], 
      exact: false 
    });
  };

  const handleSelectAll = () => {
    if (selectedCabinets.length === data?.data?.length) {
      setSelectedCabinets([]);
    } else {
      setSelectedCabinets(data?.data?.map((cabinet: any) => cabinet.id) || []);
    }
  };

  const handleSelectCabinet = (cabinetId: number) => {
    setSelectedCabinets(prev => 
      prev.includes(cabinetId) 
        ? prev.filter(id => id !== cabinetId)
        : [...prev, cabinetId]
    );
  };

  const handleBulkEdit = () => {
    toast({
      title: "Bulk Edit",
      description: `Editing ${selectedCabinets.length} cabinets`,
    });
  };

  const handleBulkDelete = () => {
    toast({
      title: "Bulk Delete", 
      description: `Deleting ${selectedCabinets.length} cabinets`,
      variant: "destructive",
    });
  };

  const getProviderName = (providerId: number) => {
    const provider = Array.isArray(providers?.providers) ? providers.providers.find((p: any) => p.id === providerId) : undefined;
    return provider ? provider.name : "Unknown Provider";
  };

  const totalPages = data ? Math.ceil(data.pagination?.total / limit) : 0;
  console.log('totalPages calculation:', { total: data?.pagination?.total, limit, totalPages });

  // Force refetch when limit changes
  useEffect(() => {
    console.log('Limit changed to:', limit);
    queryClient.invalidateQueries({ queryKey: ['/api/cabinets'] });
  }, [limit, queryClient]);

  return (
    <div className="space-y-4 w-full max-w-none">
      {/* Actions */}
      <div className="flex items-center justify-between">
        <BulkOperations 
          selectedCount={selectedCabinets.length}
          onBulkEdit={handleBulkEdit}
          onBulkDelete={handleBulkDelete}
        />
        <div className="text-sm text-slate-400">
          {selectedCabinets.length > 0 && (
            <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full">
              {selectedCabinets.length} selected
            </span>
          )}
        </div>
      </div>

      {/* Search Bar and Actions */}
      <div className="search-card">
        <div className="flex items-center justify-between w-full">
          <div className="relative" style={{ width: '10cm' }}>
            <Input
              type="text"
              placeholder="Search cabinets..."
              value={searchTerm}
              onChange={handleSearch}
              className="enhanced-input pl-12 pr-4 py-2 text-base text-right"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400 h-5 w-5" />
          </div>
          <div className="flex items-center gap-4">
            <Button
              className="px-4 py-2 rounded-lg h-10 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Cabinet
            </Button>
            <ImportExportDialog module="cabinets" moduleName="Cabinets">
              <Button className="px-4 py-2 rounded-lg h-10 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0">
                Import/Export
              </Button>
            </ImportExportDialog>
          </div>
        </div>
      </div>

      {/* Enhanced Cabinets Table */}
      <div className="search-card">

        {/* Table Content */}
        {isLoading ? (
          <div className="loading-container">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="loading-shimmer h-20"></div>
            ))}
          </div>
        ) : error ? (
          <div className="error-state-container">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-white mb-2">Failed to load cabinets</h3>
            <p>Please try refreshing the page or check your connection.</p>
          </div>
        ) : !data?.data?.length ? (
          <div className="empty-state-container">
            <div className="text-6xl mb-4">🎰</div>
            <h3 className="text-xl font-semibold text-white mb-2">No cabinets found</h3>
            <p>Get started by creating your first gaming cabinet.</p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="enhanced-table w-full">
              <thead>
                <tr>
                  <th className="w-12">
                    <Checkbox
                      checked={selectedCabinets.length === data?.data?.length && data?.data?.length > 0}
                      onCheckedChange={handleSelectAll}
                      className="border-white/30"
                    />
                  </th>
                  <th className="w-16">#</th>
                  <th>Logo</th>
                  <th>Cabinet</th>
                  <th>Provider</th>
                  <th>Status</th>
                  <th>Attachments</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((cabinet: any, index: number) => (
                  <tr key={cabinet.id}>
                    <td>
                      <Checkbox
                        checked={selectedCabinets.includes(cabinet.id)}
                        onCheckedChange={() => handleSelectCabinet(cabinet.id)}
                        className="border-white/30"
                      />
                    </td>
                    <td>
                      <div className="table-cell-primary font-medium">
                        {(currentPage - 1) * limit + index + 1}
                      </div>
                    </td>
                    <td>
                      <CabinetLogo 
                        cabinetId={cabinet.id} 
                        size="lg"
                      />
                    </td>
                    <td>
                      <div>
                        <div className="table-cell-primary">{cabinet.model || 'Unnamed Cabinet'}</div>
                        <div className="table-cell-secondary">Cabinet #{cabinet.id}</div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        {cabinet.providerId && (
                          <ProviderLogo providerId={cabinet.providerId} size="lg" />
                        )}
                        <div>
                          <div className="table-cell-primary">
                            {cabinet.providerId ? getProviderName(cabinet.providerId) : 'No provider'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${cabinet.status === 'active' ? 'status-active' : 'status-inactive'}`}>
                        {cabinet.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <AttachmentButton 
                        entityType="cabinets" 
                        entityId={cabinet.id}
                      />
                    </td>
                    <td>
                      <div className="action-button-group justify-end">
                        <button 
                          className="action-button text-amber-500 hover:text-amber-400"
                          onClick={() => handleEdit(cabinet)}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          className="action-button text-red-500 hover:text-red-400"
                          onClick={() => handleDelete(cabinet.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Advanced Pagination for Large Datasets */}
      {data && data.data && data.data.length > 0 && (
        <div className="space-y-3 mt-4">
          {/* Pagination Info and Controls */}
          <div className="flex items-center justify-between px-4 py-2 bg-slate-800/30 rounded-lg">
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <span>
                Showing {Math.min((currentPage - 1) * limit + 1, data.pagination.total)} to {Math.min(currentPage * limit, data.pagination.total)} of {data.pagination.total} entries
              </span>
              <div className="flex items-center gap-2">
                <span>Show:</span>
                <select 
                  value={limit} 
                  onChange={(e) => {
                    setLimit(parseInt(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white text-sm"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>
            
            {/* Jump to Page Input */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-400">Go to page:</span>
              <input
                type="number"
                min="1"
                max={totalPages}
                value={currentPage}
                onChange={(e) => {
                  const page = parseInt(e.target.value);
                  if (page >= 1 && page <= totalPages) {
                    setCurrentPage(page);
                  }
                }}
                className="w-16 px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm text-center"
              />
              <span className="text-sm text-slate-400">of {totalPages}</span>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(1)}
              className="h-8 px-3 text-sm text-slate-400 hover:text-white"
            >
              ≪ First
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(Math.max(1, currentPage - 5))}
              className="h-8 px-3 text-sm text-slate-400 hover:text-white"
            >
              -5
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="h-8 px-3 text-sm text-slate-400 hover:text-white"
            >
              ← Prev
            </Button>
            
            <span className="px-4 py-1 bg-blue-600 text-white rounded text-sm font-bold">
              {currentPage}
            </span>
            
            <Button
              variant="ghost"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="h-8 px-3 text-sm text-slate-400 hover:text-white"
            >
              Next →
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 5))}
              className="h-8 px-3 text-sm text-slate-400 hover:text-white"
            >
              +5
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(totalPages)}
              className="h-8 px-3 text-sm text-slate-400 hover:text-white"
            >
              Last ≫
            </Button>
          </div>
        </div>
      )}

      {/* Create Cabinet Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="glass-dialog dialog-lg">
          <DialogHeader>
            <DialogTitle className="text-white">Create New Cabinet</DialogTitle>
            <DialogDescription className="text-slate-400">
              Add a new gaming cabinet with provider assignment and technical details.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Model *</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} className="form-input" placeholder="Enter cabinet model" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? ""}>
                        <FormControl>
                          <SelectTrigger className="form-input">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="glass-card border-white/10">
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="providerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Provider</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString() ?? ""}>
                      <FormControl>
                        <SelectTrigger className="form-input">
                          <SelectValue placeholder="Select provider" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="glass-card border-white/10">
                        {providers?.providers?.map((provider: any) => (
                          <SelectItem key={provider.id} value={provider.id.toString()}>
                            {provider.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="webLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Web Link</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} className="form-input" placeholder="https://provider-website.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="technicalInfo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Technical Information</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value || ""} className="form-input min-h-[100px]" placeholder="Enter technical specifications and details" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="btn-gaming"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? "Creating..." : "Create Cabinet"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Cabinet Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="glass-dialog dialog-lg">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Cabinet</DialogTitle>
            <DialogDescription className="text-slate-400">
              Update cabinet information and technical details.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Model *</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} className="form-input" placeholder="Enter cabinet model" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? ""}>
                        <FormControl>
                          <SelectTrigger className="form-input">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="glass-card border-white/10">
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={editForm.control}
                name="providerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Provider</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString() ?? ""}>
                      <FormControl>
                        <SelectTrigger className="form-input">
                          <SelectValue placeholder="Select provider" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="glass-card border-white/10">
                        {providers?.providers?.map((provider: any) => (
                          <SelectItem key={provider.id} value={provider.id.toString()}>
                            {provider.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="webLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Web Link</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} className="form-input" placeholder="https://provider-website.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="technicalInfo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Technical Information</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value || ""} className="form-input min-h-[100px]" placeholder="Enter technical specifications and details" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setIsEditDialogOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="btn-gaming"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? "Updating..." : "Update Cabinet"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}