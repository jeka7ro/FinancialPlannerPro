import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, Upload, Search, Mail, Phone } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCompanySchema, type InsertCompany } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { BulkOperations } from "@/components/ui/bulk-operations";
import { ImportExportDialog } from "@/components/ui/import-export-dialog";
import { AttachmentButton } from "@/components/ui/attachment-button";

export default function Companies() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<any>(null);
  const [selectedCompanies, setSelectedCompanies] = useState<number[]>([]);
  const { toast } = useToast();
  const limit = 10;

  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/companies', currentPage, limit, searchTerm],
    queryFn: async () => {
      const searchParam = searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : '';
      const response = await apiRequest('GET', `/api/companies?page=${currentPage}&limit=${limit}${searchParam}`);
      return response.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertCompany) => {
      return await apiRequest("POST", "/api/companies", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/companies'] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Company created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create company. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertCompany> }) => {
      return await apiRequest("PUT", `/api/companies/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/companies'] });
      setIsEditDialogOpen(false);
      setEditingCompany(null);
      editForm.reset();
      toast({
        title: "Success",
        description: "Company updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update company. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/companies/${id}`),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Company deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete company",
        variant: "destructive",
      });
    },
  });

  const form = useForm<InsertCompany>({
    resolver: zodResolver(insertCompanySchema),
    defaultValues: {
      name: "",
      registrationNumber: "",
      taxId: "",
      address: "",
      city: "",
      country: "",
      phone: "",
      email: "",
      website: "",
      isActive: true,
    },
  });

  const editForm = useForm<InsertCompany>({
    resolver: zodResolver(insertCompanySchema),
    defaultValues: {
      name: "",
      registrationNumber: "",
      taxId: "",
      address: "",
      city: "",
      country: "",
      phone: "",
      email: "",
      website: "",
      isActive: true,
    },
  });

  const onSubmit = (data: InsertCompany) => {
    createMutation.mutate(data);
  };

  const onEditSubmit = (data: InsertCompany) => {
    if (editingCompany) {
      updateMutation.mutate({ id: editingCompany.id, data });
    }
  };

  const handleEdit = (company: any) => {
    setEditingCompany(company);
    editForm.reset({
      name: company.name || "",
      registrationNumber: company.registrationNumber || "",
      taxId: company.taxId || "",
      address: company.address || "",
      city: company.city || "",
      country: company.country || "",
      phone: company.phone || "",
      email: company.email || "",
      website: company.website || "",
      isActive: company.isActive ?? true,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this company?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleSelectAll = () => {
    if (selectedCompanies.length === data?.companies.length) {
      setSelectedCompanies([]);
    } else {
      setSelectedCompanies(data?.companies.map((c: any) => c.id) || []);
    }
  };

  const handleSelectCompany = (companyId: number) => {
    setSelectedCompanies(prev => 
      prev.includes(companyId) 
        ? prev.filter(id => id !== companyId)
        : [...prev, companyId]
    );
  };

  const handleBulkEdit = () => {
    toast({
      title: "Bulk Edit",
      description: `Editing ${selectedCompanies.length} companies`,
    });
  };

  const handleBulkDelete = () => {
    if (selectedCompanies.length === 0) return;
    
    toast({
      title: "Bulk Delete",
      description: `Deleting ${selectedCompanies.length} companies`,
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
            selectedCount={selectedCompanies.length}
            onBulkEdit={handleBulkEdit}
            onBulkDelete={handleBulkDelete}
          />
        </div>
        <div className="text-sm text-slate-400">
          {selectedCompanies.length > 0 && (
            <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full">
              {selectedCompanies.length} selected
            </span>
          )}
        </div>
      </div>

      {/* Title and Total - SUS */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold heading-gradient">Companies</h2>
          <p className="text-slate-400 mt-1">Company and legal entity management</p>
        </div>
        <div className="text-sm text-slate-400">
          {data?.total || 0} total companies
        </div>
      </div>

      {/* Search Bar and Actions - SUS */}
      <div className="search-card">
        <div className="flex items-center justify-between w-full">
          <div className="relative" style={{ width: '10cm' }}>
            <Input
              type="text"
              placeholder="Search companies by name, CUI, or address..."
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
              Add Company
            </Button>
            <ImportExportDialog module="companies" moduleName="Companies">
              <Button className="px-4 py-2 rounded-lg h-10 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0">
                Import/Export
              </Button>
            </ImportExportDialog>
          </div>
        </div>
      </div>

      {/* Enhanced Companies Table */}
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
            <h3 className="text-xl font-semibold text-white mb-2">Failed to load companies</h3>
            <p>Please try refreshing the page or check your connection.</p>
          </div>
        ) : !data?.companies?.length ? (
          <div className="empty-state-container">
            <div className="text-6xl mb-4">🏢</div>
            <h3 className="text-xl font-semibold text-white mb-2">No companies found</h3>
            <p>Get started by creating your first company.</p>
          </div>
        ) : (
          <>
            <div className="enhanced-table-wrapper">
              <table className="enhanced-table">
                <thead>
                  <tr>
                    <th className="w-12">
                      <Checkbox
                        checked={selectedCompanies.length === data?.companies.length && data?.companies.length > 0}
                        onCheckedChange={handleSelectAll}
                        className="border-white/30"
                      />
                    </th>
                    <th className="w-16">#</th>
                    <th>Company</th>
                    <th>Registration</th>
                    <th>Location</th>
                    <th>Contact</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.companies.map((company: any, index: number) => (
                    <tr key={company.id}>
                      <td>
                        <Checkbox
                          checked={selectedCompanies.includes(company.id)}
                          onCheckedChange={() => handleSelectCompany(company.id)}
                          className="border-white/30"
                        />
                      </td>
                      <td>
                        <div className="table-cell-primary font-medium">
                          {(currentPage - 1) * limit + index + 1}
                        </div>
                      </td>
                      <td>
                        <div>
                          <div className="table-cell-primary">{company.name}</div>
                          <div className="table-cell-secondary">{company.taxId || 'No tax ID'}</div>
                        </div>
                      </td>
                      <td>
                        <span className="table-cell-accent">
                          {company.registrationNumber || 'N/A'}
                        </span>
                      </td>
                      <td>
                        <div className="table-cell-primary">
                          {company.city && company.country ? `${company.city}, ${company.country}` : 'Not specified'}
                        </div>
                      </td>
                      <td>
                        <div className="space-y-1">
                          {company.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-blue-400" />
                              <span className="table-cell-primary">{company.email}</span>
                            </div>
                          )}
                          {company.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-green-400" />
                              <span className="table-cell-secondary">{company.phone}</span>
                            </div>
                          )}
                          {!company.email && !company.phone && (
                            <span className="text-slate-500 text-sm">No contact info</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${company.isActive ? 'status-active' : 'status-inactive'}`}>
                          {company.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="action-button-group justify-end">
                          <AttachmentButton 
                            entityType="companies" 
                            entityId={company.id} 
                            entityName={company.name} 
                          />
                          <button 
                            className="action-button text-amber-500 hover:text-amber-400"
                            onClick={() => handleEdit(company)}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            className="action-button text-red-500 hover:text-red-400"
                            onClick={() => handleDelete(company.id)}
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
      {data?.companies?.length > 0 && (
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

      {/* Create Company Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="glass-dialog dialog-lg">
          <DialogHeader>
            <DialogTitle className="text-white">Create New Company</DialogTitle>
            <DialogDescription className="text-slate-400">
              Add a new company to the system with business information and contact details.
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
                      <FormLabel className="text-white">Company Name *</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} className="form-input" placeholder="Company name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="registrationNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Registration Number</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} className="form-input" placeholder="Registration number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="taxId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Tax ID</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} className="form-input" placeholder="Tax ID number" />
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
                      <FormLabel className="text-white flex items-center gap-2">
                        <Mail className="h-4 w-4 text-blue-400" />
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} type="email" className="form-input" placeholder="company@email.com" />
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
                      <Textarea {...field} value={field.value || ""} className="form-input" placeholder="Company address" />
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
                      <FormLabel className="text-white flex items-center gap-2">
                        <Phone className="h-4 w-4 text-green-400" />
                        Phone
                      </FormLabel>
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
                      <Input {...field} value={field.value || ""} className="form-input" placeholder="https://company-website.com" />
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
                  {createMutation.isPending ? "Creating..." : "Create Company"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="glass-dialog dialog-lg">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Company</DialogTitle>
            <DialogDescription className="text-slate-400">
              Update the company information and business details.
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
                      <FormLabel className="text-white">Company Name</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} className="form-input" placeholder="Company name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="registrationNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Registration Number</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} className="form-input" placeholder="Registration number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="taxId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Tax ID</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} className="form-input" placeholder="Tax ID number" />
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
                      <FormLabel className="text-white flex items-center gap-2">
                        <Mail className="h-4 w-4 text-blue-400" />
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} type="email" className="form-input" placeholder="company@email.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={editForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Address</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value || ""} className="form-input" placeholder="Company address" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={editForm.control}
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
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white flex items-center gap-2">
                        <Phone className="h-4 w-4 text-green-400" />
                        Phone
                      </FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} className="form-input" placeholder="Phone number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={editForm.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Website</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} className="form-input" placeholder="https://company-website.com" />
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
                  {updateMutation.isPending ? "Updating..." : "Update Company"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}