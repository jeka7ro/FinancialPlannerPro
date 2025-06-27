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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProviderSchema, type InsertProvider } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Upload, Edit, Trash2, Plus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { BulkOperations } from "@/components/ui/bulk-operations";
import { AttachmentButton } from "@/components/ui/attachment-button";
import { ProviderLogo } from "@/components/ui/provider-logo";

export default function Providers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<any>(null);
  const [selectedProviders, setSelectedProviders] = useState<number[]>([]);
  const { toast } = useToast();
  const limit = 10;

  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/providers', currentPage, limit, searchTerm],
    queryFn: async () => {
      const searchParam = searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : '';
      const response = await fetch(`/api/providers?page=${currentPage}&limit=${limit}${searchParam}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch providers');
      return response.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertProvider) => {
      return await apiRequest("POST", "/api/providers", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/providers'] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Provider created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create provider. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: InsertProvider }) =>
      apiRequest("PUT", `/api/providers/${id}`, data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Provider updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/providers"] });
      setIsEditDialogOpen(false);
      setEditingProvider(null);
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
    mutationFn: (id: number) => apiRequest("DELETE", `/api/providers/${id}`),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Provider deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/providers"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete provider",
        variant: "destructive",
      });
    },
  });

  const form = useForm<InsertProvider>({
    resolver: zodResolver(insertProviderSchema),
    defaultValues: {
      name: "",
      companyName: "",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      country: "",
      website: "",
      isActive: true,
    },
  });

  const editForm = useForm<InsertProvider>({
    resolver: zodResolver(insertProviderSchema),
    defaultValues: {
      name: "",
      companyName: "",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      country: "",
      website: "",
      isActive: true,
    },
  });

  const onSubmit = (data: InsertProvider) => {
    createMutation.mutate(data);
  };

  const onEditSubmit = (data: InsertProvider) => {
    if (editingProvider) {
      updateMutation.mutate({ id: editingProvider.id, data });
    }
  };

  const handleEdit = (provider: any) => {
    setEditingProvider(provider);
    editForm.reset({
      name: provider.name || "",
      companyName: provider.companyName || "",
      contactPerson: provider.contactPerson || "",
      email: provider.email || "",
      phone: provider.phone || "",
      address: provider.address || "",
      city: provider.city || "",
      country: provider.country || "",
      website: provider.website || "",
      isActive: provider.isActive ?? true,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this provider?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleSelectAll = () => {
    if (selectedProviders.length === data?.providers.length) {
      setSelectedProviders([]);
    } else {
      setSelectedProviders(data?.providers.map((p: any) => p.id) || []);
    }
  };

  const handleSelectProvider = (providerId: number) => {
    setSelectedProviders(prev => 
      prev.includes(providerId) 
        ? prev.filter(id => id !== providerId)
        : [...prev, providerId]
    );
  };

  const handleBulkEdit = () => {
    toast({
      title: "Bulk Edit",
      description: `Editing ${selectedProviders.length} providers`,
    });
  };

  const handleBulkDelete = () => {
    if (selectedProviders.length === 0) return;
    
    toast({
      title: "Bulk Delete",
      description: `Deleting ${selectedProviders.length} providers`,
      variant: "destructive",
    });
  };

  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BulkOperations 
            selectedCount={selectedProviders.length}
            onBulkEdit={handleBulkEdit}
            onBulkDelete={handleBulkDelete}
          />
        </div>
        <div className="flex items-center gap-2">
          <ImportExportDialog module="providers" moduleName="Providers">
            <Button className="bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-500 text-white font-medium px-4 py-2 rounded-lg">
              <Upload className="h-4 w-4 mr-2" />
              Import/Export
            </Button>
          </ImportExportDialog>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                      <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-500 text-white font-medium px-4 py-2 rounded-lg">
              <Plus className="h-4 w-4 mr-2" />
              Add new
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-dialog dialog-lg">
            <DialogHeader>
              <DialogTitle className="text-white">Create New Provider</DialogTitle>
              <DialogDescription className="text-slate-400">
                Add a new gaming provider to the system with contact information and details.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Provider Name</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} className="form-input" placeholder="Enter provider name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Company Name</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} className="form-input" placeholder="Company name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contactPerson"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Contact Person</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} className="form-input" placeholder="Contact person name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Email</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} type="email" className="form-input" placeholder="provider@email.com" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Address</FormLabel>
                      <FormControl>
                        <Textarea {...field} value={field.value || ""} className="form-input" placeholder="Provider address" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">City</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} className="form-input" placeholder="City" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Country</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} className="form-input" placeholder="Country" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Phone</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} className="form-input" placeholder="Phone number" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Website</FormLabel>
                      <FormControl>
                        <Input {...field} className="form-input" placeholder="https://provider-website.com" />
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
                    {createMutation.isPending ? "Creating..." : "Create Provider"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Edit Provider Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="glass-dialog dialog-lg">
            <DialogHeader>
              <DialogTitle className="text-white">Edit Provider</DialogTitle>
              <DialogDescription className="text-slate-400">
                Update the provider information and contact details.
              </DialogDescription>
            </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Provider Name</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} className="form-input" placeholder="Enter provider name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Company Name</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} className="form-input" placeholder="Enter company name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="contactPerson"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Contact Person</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} className="form-input" placeholder="Enter contact person" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Email</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} className="form-input" placeholder="Enter email address" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Phone</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} className="form-input" placeholder="Enter phone number" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Website</FormLabel>
                        <FormControl>
                          <Input {...field} className="form-input" placeholder="Enter website URL" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">City</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} className="form-input" placeholder="Enter city" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Country</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} className="form-input" placeholder="Country" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel className="text-white">Address</FormLabel>
                        <FormControl>
                          <Textarea {...field} value={field.value || ""} className="form-input min-h-[80px]" placeholder="Enter full address" />
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
                    {updateMutation.isPending ? "Updating..." : "Update Provider"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Enhanced Search */}
      <div className="search-card">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search providers by name, company, or location..."
            value={searchTerm}
            onChange={handleSearch}
            className="enhanced-input pl-12 pr-4 py-4 text-base"
          />
          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400 text-lg">🚚</span>
        </div>
      </div>

      {/* Enhanced Providers Table */}
      <div className="content-card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold heading-gradient">Providers</h2>
            <p className="text-slate-400 mt-1">Equipment and service providers management</p>
          </div>
          <div className="text-sm text-slate-400">
            {data?.total || 0} total providers
          </div>
        </div>

        {isLoading ? (
          <div className="loading-container">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="loading-shimmer h-20"></div>
            ))}
          </div>
        ) : error ? (
          <div className="error-state-container">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-white mb-2">Failed to load providers</h3>
            <p>Please try refreshing the page or check your connection.</p>
          </div>
        ) : !data?.providers?.length ? (
          <div className="empty-state-container">
            <div className="text-6xl mb-4">🚚</div>
            <h3 className="text-xl font-semibold text-white mb-2">No providers found</h3>
            <p>Get started by adding your first service provider.</p>
          </div>
        ) : (
          <>
            <div className="enhanced-table-wrapper">
              <table className="enhanced-table">
                <thead>
                  <tr>
                    <th className="w-12">
                      <Checkbox
                        checked={selectedProviders.length === data?.providers.length && data?.providers.length > 0}
                        onCheckedChange={handleSelectAll}
                        className="border-white/30"
                      />
                    </th>
                    <th>Provider</th>
                    <th>Company</th>
                    <th>Location</th>
                    <th>Contact</th>
                    <th>Status</th>
                    <th>Logo</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.providers.map((provider: any) => (
                    <tr key={provider.id}>
                      <td>
                        <Checkbox
                          checked={selectedProviders.includes(provider.id)}
                          onCheckedChange={() => handleSelectProvider(provider.id)}
                          className="border-white/30"
                        />
                      </td>
                      <td>
                        <div className="flex items-center gap-3">
                          <ProviderLogo providerId={provider.id} size="md" />
                          <div>
                            <div className="table-cell-primary">{provider.name}</div>
                            <div className="table-cell-secondary">{provider.contactPerson || 'No contact person'}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="table-cell-accent">
                          {provider.companyName || 'N/A'}
                        </span>
                      </td>
                      <td>
                        <div className="table-cell-primary">
                          {provider.city && provider.country ? `${provider.city}, ${provider.country}` : 'Not specified'}
                        </div>
                      </td>
                      <td>
                        <div>
                          {provider.email && (
                            <div className="table-cell-primary">{provider.email}</div>
                          )}
                          {provider.phone && (
                            <div className="table-cell-secondary">{provider.phone}</div>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${provider.isActive ? 'status-active' : 'status-inactive'}`}>
                          {provider.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <AttachmentButton 
                          entityType="provider" 
                          entityId={provider.id}
                        />
                      </td>
                      <td>
                        <div className="action-button-group justify-end">
                          <button 
                            className="action-button text-amber-500 hover:text-amber-400"
                            onClick={() => handleEdit(provider)}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            className="action-button text-red-500 hover:text-red-400"
                            onClick={() => handleDelete(provider.id)}
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

            {/* Enhanced Pagination */}
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/10">
              <div className="text-sm text-slate-400">
                Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, data.total)} of {data.total} entries
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="ghost"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="action-button text-slate-400 hover:text-white"
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
                      className={currentPage === page 
                        ? "bg-blue-500 text-white px-3 py-1 rounded-lg" 
                        : "action-button text-slate-400 hover:text-white"
                      }
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
                  className="action-button text-slate-400 hover:text-white"
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
