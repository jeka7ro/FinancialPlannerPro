import { useState } from "react";
import { ImportExportDialog } from "../components/ui/import-export-dialog";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "../lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertRentAgreementSchema, type InsertRentAgreement } from "@/shared/schema";
import { useToast } from "../hooks/use-toast";
import { Badge } from "../components/ui/badge";
import { Upload, Edit, Trash2, Plus, Search } from "lucide-react";
import { AttachmentButton } from "../components/ui/attachment-button";
import { BulkOperations } from "../components/ui/bulk-operations";
import { Checkbox } from "../components/ui/checkbox";

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'active':
      return 'status-active';
    case 'pending':
      return 'status-maintenance';
    case 'terminated':
      return 'status-inactive';
    case 'expired':
      return 'bg-gray-500/20 text-gray-400';
    default:
      return 'bg-gray-500/20 text-gray-400';
  }
};

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
      const searchParam = searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : '';
      const response = await apiRequest('GET', `/api/rent-agreements?page=${currentPage}&limit=${limit}${searchParam}`);
      return response.json();
    },
  });

  const { data: companies } = useQuery({
    queryKey: ['/api/companies', 1, 100],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/companies?page=1&limit=100');
      return response.json();
    },
  });

  const { data: locations } = useQuery({
    queryKey: ['/api/locations', 1, 100],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/locations?page=1&limit=100');
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
    mutationFn: ({ id, data }: { id: number; data: InsertRentAgreement }) =>
      apiRequest("PUT", `/api/rent-agreements/${id}`, data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Rent agreement updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/rent-agreements"] });
      setIsEditDialogOpen(false);
      setEditingAgreement(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
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
      status: "pending",
      monthlyRent: "0",
      securityDeposit: "0",
    },
  });

  const editForm = useForm<InsertRentAgreement>({
    resolver: zodResolver(insertRentAgreementSchema),
    defaultValues: {
      agreementNumber: "",
      status: "pending",
      monthlyRent: "0",
      securityDeposit: "0",
    },
  });

  const onSubmit = (data: InsertRentAgreement) => {
    const transformedData = {
      ...data,
      monthlyRent: data.monthlyRent?.toString() || "0",
      securityDeposit: data.securityDeposit?.toString() || "0",
    };
    createMutation.mutate(transformedData);
  };

  const onEditSubmit = (data: InsertRentAgreement) => {
    if (editingAgreement) {
      const transformedData = {
        ...data,
        monthlyRent: data.monthlyRent?.toString() || "0",
        securityDeposit: data.securityDeposit?.toString() || "0",
      };
      updateMutation.mutate({ id: editingAgreement.id, data: transformedData });
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this rent agreement?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (agreement: any) => {
    setEditingAgreement(agreement);
    editForm.reset({
      agreementNumber: agreement.agreementNumber || "",
      companyId: agreement.companyId,
      locationId: agreement.locationId,
      startDate: agreement.startDate ? new Date(agreement.startDate) : new Date(),
      endDate: agreement.endDate ? new Date(agreement.endDate) : new Date(),
      monthlyRent: agreement.monthlyRent || "0",
      securityDeposit: agreement.securityDeposit || "0",
      status: agreement.status || "pending",
      terms: agreement.terms || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleSelectAll = () => {
    if (selectedAgreements.length === data?.data?.length) {
      setSelectedAgreements([]);
    } else {
      setSelectedAgreements(data?.data?.map((item: any) => item.id) || []);
    }
  };

  const handleSelectAgreement = (id: number) => {
    setSelectedAgreements(prev => 
      prev.includes(id) 
        ? prev.filter(agreementId => agreementId !== id)
        : [...prev, id]
    );
  };

  const handleBulkEdit = () => {
    toast({
      title: "Bulk Edit",
      description: `Editing ${selectedAgreements.length} rent agreements`,
    });
  };

  const handleBulkDelete = () => {
    if (selectedAgreements.length === 0) return;
    
    toast({
      title: "Bulk Delete",
      description: `Deleting ${selectedAgreements.length} rent agreements`,
      variant: "destructive",
    });
  };

  const totalPages = data ? Math.ceil(data.pagination.total / limit) : 0;

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BulkOperations 
            selectedCount={selectedAgreements.length}
            onBulkEdit={handleBulkEdit}
            onBulkDelete={handleBulkDelete}
          />
        </div>
        <div className="flex items-center gap-2">
          {/* Table Header - Search & Actions */}
          <div className="search-card mb-4">
            <div className="flex items-center justify-between w-full">
              <div className="relative" style={{ width: '10cm' }}>
                <Input
                  type="text"
                  placeholder="Search agreements by number, status, or company..."
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
                  Add Agreement
                </Button>
                <ImportExportDialog module="rent-agreements" moduleName="Rent Agreements">
                  <Button className="px-4 py-2 rounded-lg h-10 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0">
                    Import/Export
                  </Button>
                </ImportExportDialog>
              </div>
            </div>
          </div>

          {/* Edit Agreement Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="glass-dialog dialog-lg">
              <DialogHeader>
                <DialogTitle className="text-white">Edit Rent Agreement</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Update the rent agreement information and details.
                </DialogDescription>
              </DialogHeader>
              <Form {...editForm}>
                <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
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
                          <Select value={field.value ?? ""} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="form-input">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="glass-card border-white/10">
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="terminated">Terminated</SelectItem>
                              <SelectItem value="expired">Expired</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
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
                      control={editForm.control}
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

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)} className="border-white/20 text-white hover:bg-white/10">
                      Cancel
                    </Button>
                    <Button type="submit" className="floating-action text-white" disabled={updateMutation.isPending}>
                      {updateMutation.isPending ? "Updating..." : "Update Agreement"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="glass-dialog dialog-lg">
          <DialogHeader>
            <DialogTitle className="text-white">Create New Rent Agreement</DialogTitle>
            <DialogDescription className="text-slate-400">
              Generate a new rental agreement for gaming equipment and services.
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
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="form-input">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
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

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="border-white/20 text-white hover:bg-white/10">
                  Cancel
                </Button>
                <Button type="submit" className="floating-action text-white" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create Agreement"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Enhanced Rent Agreements Table */}
      <div className="search-card">
        {isLoading ? (
          <div className="loading-container">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="loading-shimmer h-20"></div>
            ))}
          </div>
        ) : error ? (
          <div className="error-state-container">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-white mb-2">Failed to load rent agreements</h3>
            <p>Please try refreshing the page or check your connection.</p>
          </div>
        ) : !data?.data?.length ? (
          <div className="empty-state-container">
            <div className="text-6xl mb-4">🏠</div>
            <h3 className="text-xl font-semibold text-white mb-2">No rent agreements found</h3>
            <p>Get started by creating your first rent agreement.</p>
          </div>
        ) : (
          <>
            <div className="enhanced-table-wrapper">
              <table className="enhanced-table">
                <thead>
                  <tr>
                    <th className="w-12">
                      <Checkbox
                        checked={selectedAgreements.length === data?.data?.length && data?.data?.length > 0}
                        onCheckedChange={handleSelectAll}
                        className="border-white/30"
                      />
                    </th>
                    <th className="w-16">#</th>
                    <th>Agreement</th>
                    <th>Company</th>
                    <th>Location</th>
                    <th>Monthly Rent</th>
                    <th>Status</th>
                    <th>Attachments</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((agreement: any, index: number) => (
                    <tr key={agreement.id}>
                      <td>
                        <Checkbox
                          checked={selectedAgreements.includes(agreement.id)}
                          onCheckedChange={() => handleSelectAgreement(agreement.id)}
                          className="border-white/30"
                        />
                      </td>
                      <td>
                        <div className="table-cell-primary font-medium">
                          {(currentPage - 1) * limit + index + 1}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <span className="text-blue-400 text-lg">🏠</span>
                          </div>
                          <div>
                            <div className="table-cell-primary">{agreement.agreementNumber}</div>
                            <div className="table-cell-secondary">
                              {agreement.startDate ? new Date(agreement.startDate).toLocaleDateString() : 'No start date'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="table-cell-primary">
                          {Array.isArray(companies?.companies) ? companies.companies.find((c: any) => c.id === agreement.companyId)?.name || 'No company' : 'No company'}
                        </div>
                      </td>
                      <td>
                        <div className="table-cell-primary">
                          {Array.isArray(locations?.locations) ? locations.locations.find((l: any) => l.id === agreement.locationId)?.name || 'No location' : 'No location'}
                        </div>
                      </td>
                      <td>
                        <div className="table-cell-primary">
                          €{agreement.monthlyRent || '0.00'}
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${getStatusColor(agreement.status)}`}>
                          {agreement.status}
                        </span>
                      </td>
                      <td>
                        <AttachmentButton 
                          entityType="rent-agreements" 
                          entityId={agreement.id}
                        />
                      </td>
                      <td>
                        <div className="action-button-group justify-end">
                          <button 
                            className="action-button text-amber-500 hover:text-amber-400"
                            onClick={() => handleEdit(agreement)}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            className="action-button text-red-500 hover:text-red-400"
                            onClick={() => handleDelete(agreement.id)}
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
          </>
        )}
      </div>

      {/* Pagination and entries info - SUB tabel */}
      {data?.data?.length > 0 && (
        <div className="flex items-center justify-between mt-2 px-2 text-sm text-slate-400">
          <span>
            Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, data.pagination.total)} of {data.pagination.total} entries
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
    </div>
  );
}
