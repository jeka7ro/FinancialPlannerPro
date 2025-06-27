import { useState } from "react";
import { ImportExportDialog } from "@/components/ui/import-export-dialog";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCabinetSchema, type InsertCabinet, type Cabinet } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Upload, Edit, Trash2, Plus, Search } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { BulkOperations } from "@/components/ui/bulk-operations";
import { AttachmentButton } from "@/components/ui/attachment-button";

// Provider Logo Component
function ProviderLogo({ providerId, providerName }: { providerId: number; providerName: string }) {
  const { data: attachments } = useQuery({
    queryKey: [`/api/provider/${providerId}/attachments`],
    queryFn: async () => {
      const response = await fetch(`/api/provider/${providerId}/attachments`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch attachments');
      return response.json();
    },
  });

  const logoAttachment = attachments?.find((att: any) => 
    att.filename?.toLowerCase().includes('.png') || 
    att.filename?.toLowerCase().includes('.jpg') || 
    att.filename?.toLowerCase().includes('.jpeg') ||
    att.filename?.toLowerCase().includes('.svg')
  );

  if (logoAttachment) {
    return (
      <div className="w-8 h-8 rounded flex items-center justify-center overflow-hidden bg-white">
        <img 
          src={`/api/attachments/${logoAttachment.id}/download`}
          alt={providerName}
          className="w-full h-full object-contain"
        />
      </div>
    );
  }

  // Fallback to initials
  return (
    <div className="w-8 h-8 bg-slate-700 rounded flex items-center justify-center text-xs text-slate-300">
      {providerName?.substring(0, 2).toUpperCase() || 'PR'}
    </div>
  );
}

export default function Cabinets() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCabinet, setEditingCabinet] = useState<any>(null);
  const [selectedCabinets, setSelectedCabinets] = useState<number[]>([]);
  const { toast } = useToast();
  const limit = 10;

  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/cabinets', currentPage, limit, searchTerm],
    queryFn: async () => {
      const searchParam = searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : '';
      const response = await fetch(`/api/cabinets?page=${currentPage}&limit=${limit}${searchParam}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch cabinets');
      return response.json();
    },
  });

  const { data: providers } = useQuery({
    queryKey: ['/api/providers', 1, 100],
    queryFn: async () => {
      const response = await fetch('/api/providers?page=1&limit=100', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch providers');
      return response.json();
    },
  });

  const form = useForm<InsertCabinet>({
    resolver: zodResolver(insertCabinetSchema),
    defaultValues: {
      model: "",
      status: "inactive",
      providerId: undefined,
    },
  });

  const editForm = useForm<InsertCabinet>({
    resolver: zodResolver(insertCabinetSchema),
    defaultValues: {
      model: "",
      status: "inactive",
      providerId: undefined,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertCabinet) => {
      return apiRequest("POST", "/api/cabinets", data);
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
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: InsertCabinet) => {
      return apiRequest("PUT", `/api/cabinets/${editingCabinet.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cabinets'] });
      setIsEditDialogOpen(false);
      setEditingCabinet(null);
      editForm.reset();
      toast({
        title: "Success",
        description: "Cabinet updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/cabinets/${id}`),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Cabinet deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/cabinets"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete cabinet",
        variant: "destructive",
      });
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      return apiRequest("POST", "/api/cabinets/bulk-delete", { ids });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cabinets'] });
      setSelectedCabinets([]);
      toast({
        title: "Success",
        description: "Selected cabinets deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertCabinet) => {
    createMutation.mutate(data);
  };

  const onEditSubmit = (data: InsertCabinet) => {
    updateMutation.mutate(data);
  };

  const openEditDialog = (cabinet: Cabinet) => {
    setEditingCabinet(cabinet);
    editForm.reset({
      model: cabinet.model || "",
      status: cabinet.status || "inactive",
      providerId: cabinet.providerId || undefined,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this cabinet?")) {
      deleteMutation.mutate(id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'status-active';
      case 'maintenance': return 'status-maintenance';
      case 'inactive': return 'status-inactive';
      default: return 'status-inactive';
    }
  };

  const toggleCabinetSelection = (cabinetId: number) => {
    setSelectedCabinets(prev => 
      prev.includes(cabinetId) 
        ? prev.filter(id => id !== cabinetId)
        : [...prev, cabinetId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedCabinets.length === data?.cabinets?.length) {
      setSelectedCabinets([]);
    } else {
      setSelectedCabinets(data?.cabinets.map((c: Cabinet) => c.id) || []);
    }
  };

  const handleBulkDelete = () => {
    if (selectedCabinets.length === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedCabinets.length} cabinets?`)) {
      bulkDeleteMutation.mutate(selectedCabinets);
    }
  };

  const handleBulkEdit = () => {
    toast({
      title: "Bulk Edit",
      description: `Editing ${selectedCabinets.length} cabinets`,
    });
  };

  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="loading-shimmer h-32 rounded-xl"></div>
        <div className="loading-shimmer h-96 rounded-xl"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="empty-state">
        <span className="empty-state-icon">⚠️</span>
        <p className="empty-state-title">Failed to load cabinets</p>
        <p className="empty-state-description">Error loading cabinets: {(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Search Interface */}
      <Card className="search-card">
        <CardContent className="p-6">
          <div className="search-header">
            <div className="search-icon-section">
              <div className="search-icon-wrapper">
                <span className="search-icon">🗄️</span>
              </div>
              <div>
                <h3 className="search-title">Gaming Cabinets</h3>
                <p className="search-subtitle">Hardware and cabinet equipment management</p>
              </div>
            </div>
          </div>
          <div className="search-input-wrapper">
            <Search className="search-input-icon" />
            <Input
              type="text"
              placeholder="Search cabinets by model, provider, or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions and Bulk Operations */}
      <div className="flex items-center justify-between">
        {selectedCabinets.length > 0 ? (
          <BulkOperations
            selectedCount={selectedCabinets.length}
            onBulkEdit={handleBulkEdit}
            onBulkDelete={handleBulkDelete}
          />
        ) : (
          <div></div>
        )}
        <div className="flex gap-3">
          <ImportExportDialog 
            module="cabinets"
            moduleName="Cabinets"
          >
            <Button className="btn-secondary">
              <Upload className="h-4 w-4 mr-2" />
              Import/Export
            </Button>
          </ImportExportDialog>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-primary">
                <Plus className="h-4 w-4 mr-2" />
                Add Cabinet
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-white/10 max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-white flex items-center gap-2">
                  <span className="text-xl">🗄️</span>
                  Add New Cabinet
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="model"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Cabinet Model</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ""} className="form-input" placeholder="Enter cabinet model" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="providerId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Provider</FormLabel>
                          <Select value={field.value?.toString() || ""} onValueChange={(value) => field.onChange(value ? Number(value) : null)}>
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
                  </div>

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Status</FormLabel>
                        <Select value={field.value || ""} onValueChange={field.onChange}>
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
                      className="btn-primary"
                      disabled={createMutation.isPending}
                    >
                      {createMutation.isPending ? "Creating..." : "Create Cabinet"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="glass-card border-white/10 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <span className="text-xl">🗄️</span>
              Edit Cabinet
            </DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Cabinet Model</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} className="form-input" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="providerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Provider</FormLabel>
                      <Select value={field.value?.toString() || ""} onValueChange={(value) => field.onChange(value ? Number(value) : null)}>
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
              </div>

              <FormField
                control={editForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Status</FormLabel>
                    <Select value={field.value || ""} onValueChange={field.onChange}>
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
                  className="btn-primary"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? "Updating..." : "Update Cabinet"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Enhanced Table */}
      <Card className="data-table">
        <CardHeader className="data-table-header">
          <CardTitle className="text-white flex items-center gap-2">
            <span>🗄️</span>
            Gaming Cabinets
            {data?.total && <span className="count-badge">{data.total}</span>}
          </CardTitle>
        </CardHeader>
        <CardContent className="data-table-content">
          {data?.cabinets?.length === 0 ? (
            <div className="empty-state">
              <span className="empty-state-icon">🗄️</span>
              <p className="empty-state-title">No cabinets found</p>
              <p className="empty-state-description">Add your first cabinet to get started</p>
            </div>
          ) : (
            <>
              <div className="table-container">
                <table className="enhanced-table">
                  <thead>
                    <tr>
                      <th className="w-12">
                        <Checkbox
                          checked={selectedCabinets.length === data?.cabinets?.length && data?.cabinets?.length > 0}
                          onCheckedChange={toggleSelectAll}
                          className="checkbox-custom"
                        />
                      </th>
                      <th>Cabinet</th>
                      <th>Provider</th>
                      <th>Status</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.cabinets?.map((cabinet: Cabinet) => (
                      <tr key={cabinet.id} className="table-row">
                        <td>
                          <Checkbox
                            checked={selectedCabinets.includes(cabinet.id)}
                            onCheckedChange={() => toggleCabinetSelection(cabinet.id)}
                            className="checkbox-custom"
                          />
                        </td>
                        <td>
                          <div className="flex items-center space-x-3">
                            <div className="entity-avatar bg-amber-500/20">
                              <span className="text-amber-400">🗄️</span>
                            </div>
                            <div>
                              <p className="entity-title">{cabinet.model}</p>
                              <p className="entity-subtitle">Cabinet #{cabinet.id}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            {cabinet.providerId && (
                              <ProviderLogo 
                                providerId={cabinet.providerId} 
                                providerName={providers?.providers?.find((p: any) => p.id === cabinet.providerId)?.name || 'Unknown'} 
                              />
                            )}
                            <span className="text-slate-300 text-sm">
                              {providers?.providers?.find((p: any) => p.id === cabinet.providerId)?.name || 'No provider'}
                            </span>
                          </div>
                        </td>
                        <td>
                          <Badge className={getStatusColor(cabinet.status)}>
                            {cabinet.status}
                          </Badge>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => openEditDialog(cabinet)}
                              className="action-button action-button-edit"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleDelete(cabinet.id)}
                              className="action-button action-button-delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                            <AttachmentButton
                              entityType="cabinets"
                              entityId={cabinet.id}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Enhanced Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <div className="pagination-info">
                    Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, data.total)} of {data.total} cabinets
                  </div>
                  <div className="pagination-controls">
                    <Button 
                      variant="ghost"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                      className="pagination-button"
                    >
                      Previous
                    </Button>
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      const page = i + 1;
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className={currentPage === page ? "pagination-button-active" : "pagination-button"}
                        >
                          {page}
                        </Button>
                      );
                    })}
                    <Button 
                      variant="ghost"
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                      className="pagination-button"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}