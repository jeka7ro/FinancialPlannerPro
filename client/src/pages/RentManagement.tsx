import { useState } from "react";
import { ImportExportDialog } from "@/components/ui/import-export-dialog";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertRentAgreementSchema, type InsertRentAgreement } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Upload, Search, Plus, Home, Edit, Trash2, Euro, Calendar } from "lucide-react";
import { BulkOperations } from "@/components/ui/bulk-operations";
import { Checkbox } from "@/components/ui/checkbox";

export default function RentManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAgreement, setEditingAgreement] = useState<any>(null);
  const [selectedAgreements, setSelectedAgreements] = useState<number[]>([]);
  const { toast } = useToast();
  const limit = 10;

  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/rent-agreements', currentPage, limit, searchTerm],
    queryFn: async () => {
      const response = await fetch(`/api/rent-agreements?page=${currentPage}&limit=${limit}&search=${searchTerm}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch rent agreements');
      return response.json();
    },
  });

  const { data: companies } = useQuery({
    queryKey: ['/api/companies', 1, 100],
    queryFn: async () => {
      const response = await fetch('/api/companies?page=1&limit=100', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch companies');
      return response.json();
    },
  });

  const { data: locations } = useQuery({
    queryKey: ['/api/locations', 1, 100],
    queryFn: async () => {
      const response = await fetch('/api/locations?page=1&limit=100', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch locations');
      return response.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertRentAgreement) => {
      return await apiRequest("POST", "/api/rent-agreements", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/rent-agreements'] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Rent agreement created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create rent agreement. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertRentAgreement> }) => {
      return await apiRequest("PUT", `/api/rent-agreements/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/rent-agreements'] });
      setIsEditDialogOpen(false);
      setEditingAgreement(null);
      editForm.reset();
      toast({
        title: "Success",
        description: "Rent agreement updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update rent agreement. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/rent-agreements/${id}`),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Rent agreement deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/rent-agreements"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete rent agreement",
        variant: "destructive",
      });
    },
  });

  const form = useForm<InsertRentAgreement>({
    resolver: zodResolver(insertRentAgreementSchema),
    defaultValues: {
      agreementNumber: "",
      startDate: new Date(),
      endDate: new Date(),
      monthlyRent: "0",
      securityDeposit: "0",
      status: "active",
    },
  });

  const editForm = useForm<InsertRentAgreement>({
    resolver: zodResolver(insertRentAgreementSchema),
    defaultValues: {
      agreementNumber: "",
      startDate: new Date(),
      endDate: new Date(),
      monthlyRent: "0",
      securityDeposit: "0",
      status: "active",
    },
  });

  const onSubmit = (data: InsertRentAgreement) => {
    createMutation.mutate(data);
  };

  const onEditSubmit = (data: InsertRentAgreement) => {
    if (editingAgreement) {
      updateMutation.mutate({ id: editingAgreement.id, data });
    }
  };

  const handleEdit = (rentAgreement: any) => {
    setEditingAgreement(rentAgreement);
    editForm.reset({
      agreementNumber: rentAgreement.agreementNumber || "",
      companyId: rentAgreement.companyId,
      locationId: rentAgreement.locationId,
      startDate: rentAgreement.startDate ? new Date(rentAgreement.startDate) : new Date(),
      endDate: rentAgreement.endDate ? new Date(rentAgreement.endDate) : new Date(),
      monthlyRent: rentAgreement.monthlyRent || "0",
      securityDeposit: rentAgreement.securityDeposit || "0",
      status: rentAgreement.status || "active",
      terms: rentAgreement.terms || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this rent agreement?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleSelectAll = () => {
    if (selectedAgreements.length === data?.rentAgreements?.length) {
      setSelectedAgreements([]);
    } else {
      setSelectedAgreements(data?.rentAgreements?.map((a: any) => a.id) || []);
    }
  };

  const handleSelectAgreement = (agreementId: number) => {
    setSelectedAgreements(prev => 
      prev.includes(agreementId) 
        ? prev.filter(id => id !== agreementId)
        : [...prev, agreementId]
    );
  };

  const handleBulkEdit = () => {
    toast({
      title: "Bulk Edit",
      description: `Editing ${selectedAgreements.length} agreements`,
    });
  };

  const handleBulkDelete = () => {
    if (selectedAgreements.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedAgreements.length} agreements?`)) {
      selectedAgreements.forEach(id => deleteMutation.mutate(id));
      setSelectedAgreements([]);
    }
  };

  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'status-active';
      case 'expired':
        return 'status-maintenance';
      case 'terminated':
        return 'status-inactive';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Search Interface */}
      <Card className="search-card">
        <CardContent className="p-6">
          <div className="search-header">
            <div className="search-icon-section">
              <div className="search-icon-wrapper">
                <span className="search-icon">🏠</span>
              </div>
              <div>
                <h3 className="search-title">Rent Management</h3>
                <p className="search-subtitle">Rental agreements and property leasing</p>
              </div>
            </div>
          </div>
          <div className="search-input-wrapper">
            <Search className="search-input-icon" />
            <Input
              type="text"
              placeholder="Search agreements by number, company, location, or status..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions and Bulk Operations */}
      <div className="flex items-center justify-between">
        {selectedAgreements.length > 0 ? (
          <BulkOperations 
            selectedCount={selectedAgreements.length}
            onBulkEdit={handleBulkEdit}
            onBulkDelete={handleBulkDelete}
          />
        ) : (
          <div></div>
        )}
        <div className="flex items-center gap-2">
          <ImportExportDialog module="rent-agreements" moduleName="Rent Agreements">
            <Button className="btn-secondary">
              <Upload className="h-4 w-4 mr-2" />
              Import/Export
            </Button>
          </ImportExportDialog>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-primary">
                <Plus className="h-4 w-4 mr-2" />
                Create Agreement
              </Button>
            </DialogTrigger>
          <DialogContent className="glass-card border-white/10 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <span className="text-xl">🏠</span>
                Create New Rent Agreement
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Create a new rental agreement for a location with specified terms and conditions.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="agreementNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Agreement Number</FormLabel>
                        <FormControl>
                          <Input {...field} className="form-input" placeholder="RENT-2024-001" />
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
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="form-input">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="glass-card border-white/10">
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="expired">Expired</SelectItem>
                            <SelectItem value="terminated">Terminated</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="companyId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Company</FormLabel>
                        <Select value={field.value?.toString()} onValueChange={(value) => field.onChange(parseInt(value))}>
                          <FormControl>
                            <SelectTrigger className="form-input">
                              <SelectValue placeholder="Select company" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="glass-card border-white/10">
                            {companies?.companies?.map((company: any) => (
                              <SelectItem key={company.id} value={company.id.toString()}>
                                {company.name}
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
                    name="locationId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Location</FormLabel>
                        <Select value={field.value?.toString()} onValueChange={(value) => field.onChange(parseInt(value))}>
                          <FormControl>
                            <SelectTrigger className="form-input">
                              <SelectValue placeholder="Select location" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="glass-card border-white/10">
                            {locations?.locations?.map((location: any) => (
                              <SelectItem key={location.id} value={location.id.toString()}>
                                {location.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Start Date</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="date" 
                            className="form-input"
                            value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                            onChange={(e) => field.onChange(new Date(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">End Date</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="date" 
                            className="form-input"
                            value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                            onChange={(e) => field.onChange(new Date(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="monthlyRent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Monthly Rent (€)</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            value={field.value?.toString() || ""}
                            type="number" 
                            step="0.01"
                            className="form-input" 
                            placeholder="0.00"
                            onChange={(e) => field.onChange(e.target.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="securityDeposit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Security Deposit (€)</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            value={field.value?.toString() || ""}
                            type="number" 
                            step="0.01"
                            className="form-input" 
                            placeholder="0.00"
                            onChange={(e) => field.onChange(e.target.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="terms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Terms & Conditions</FormLabel>
                      <FormControl>
                        <Textarea {...field} value={field.value || ""} className="form-input" placeholder="Agreement terms and conditions..." />
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
                    className="btn-primary"
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? "Creating..." : "Create Agreement"}
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
        <DialogContent className="glass-card border-white/10 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <span className="text-xl">🏠</span>
              Edit Rent Agreement
            </DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              {/* Same form structure as create */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="agreementNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Agreement Number</FormLabel>
                      <FormControl>
                        <Input {...field} className="form-input" placeholder="RENT-2024-001" />
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
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="form-input">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="glass-card border-white/10">
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="expired">Expired</SelectItem>
                          <SelectItem value="terminated">Terminated</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
                  {updateMutation.isPending ? "Updating..." : "Update Agreement"}
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
            <span>🏠</span>
            Rent Agreements
            {data?.total && <span className="count-badge">{data.total}</span>}
          </CardTitle>
        </CardHeader>
        <CardContent className="data-table-content">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="loading-shimmer h-16 rounded-lg"></div>
              ))}
            </div>
          ) : error ? (
            <div className="empty-state">
              <span className="empty-state-icon">⚠️</span>
              <p className="empty-state-title">Failed to load rent agreements</p>
              <p className="empty-state-description">There was an error loading the rent agreements</p>
            </div>
          ) : !data?.rentAgreements?.length ? (
            <div className="empty-state">
              <span className="empty-state-icon">🏠</span>
              <p className="empty-state-title">No rent agreements found</p>
              <p className="empty-state-description">Create your first rental agreement to get started</p>
            </div>
          ) : (
            <>
              <div className="table-container">
                <table className="enhanced-table">
                  <thead>
                    <tr>
                      <th className="w-12">
                        <Checkbox
                          checked={selectedAgreements.length === data?.rentAgreements?.length && data?.rentAgreements?.length > 0}
                          onCheckedChange={handleSelectAll}
                          className="checkbox-custom"
                        />
                      </th>
                      <th>Agreement</th>
                      <th>Company</th>
                      <th>Location</th>
                      <th>Monthly Rent</th>
                      <th>Period</th>
                      <th>Status</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.rentAgreements.map((agreement: any) => (
                      <tr key={agreement.id} className="table-row">
                        <td>
                          <Checkbox
                            checked={selectedAgreements.includes(agreement.id)}
                            onCheckedChange={() => handleSelectAgreement(agreement.id)}
                            className="checkbox-custom"
                          />
                        </td>
                        <td>
                          <div className="flex items-center space-x-3">
                            <div className="entity-avatar bg-orange-500/20">
                              <span className="text-orange-400">🏠</span>
                            </div>
                            <div>
                              <p className="entity-title">{agreement.agreementNumber}</p>
                              <p className="entity-subtitle">Agreement #{agreement.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="text-slate-300 text-sm">
                          {companies?.companies?.find((c: any) => c.id === agreement.companyId)?.name || 'No company'}
                        </td>
                        <td className="text-slate-300 text-sm">
                          {locations?.locations?.find((l: any) => l.id === agreement.locationId)?.name || 'No location'}
                        </td>
                        <td>
                          <div className="flex items-center gap-1">
                            <Euro className="w-4 h-4 text-emerald-400" />
                            <span className="text-emerald-400 font-semibold">
                              {Number(agreement.monthlyRent).toLocaleString()}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-1 text-slate-300 text-sm">
                            <Calendar className="w-3 h-3" />
                            <div>
                              <p>{new Date(agreement.startDate).toLocaleDateString()}</p>
                              <p className="text-xs text-slate-400">to {new Date(agreement.endDate).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <Badge className={getStatusColor(agreement.status)}>
                            {agreement.status}
                          </Badge>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleEdit(agreement)}
                              className="action-button action-button-edit"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleDelete(agreement.id)}
                              className="action-button action-button-delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
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
                    Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, data.total)} of {data.total} agreements
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
