import { useState } from "react";
import { ImportExportDialog } from "@/components/ui/import-export-dialog";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertInvoiceSchema, type InsertInvoice } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Upload, Edit, Trash2, ChevronDown, Plus, Search, Euro, Calendar } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AttachmentButton } from "@/components/ui/attachment-button";
import { GroupedSerialNumbers } from "@/components/GroupedSerialNumbers";
import { BulkOperations } from "@/components/ui/bulk-operations";
import { Checkbox } from "@/components/ui/checkbox";

// Utility function for property type colors
const getPropertyTypeColor = (propertyType: string) => {
  switch (propertyType?.toLowerCase()) {
    case 'property':
      return 'status-active';
    case 'rent':
      return 'status-maintenance';
    default:
      return 'bg-gray-500/20 text-gray-400';
  }
};

// Utility function for currency symbols
const getCurrencySymbol = (currency: string) => {
  switch (currency?.toUpperCase()) {
    case 'LEI':
      return '';
    case 'USD':
      return '$';
    case 'EUR':
      return '€';
    default:
      return '€';
  }
};

export default function Invoices() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<any>(null);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  const { toast } = useToast();
  const limit = 10;

  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/invoices', currentPage, limit, searchTerm],
    queryFn: async () => {
      const searchParam = searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : '';
      const response = await fetch(`/api/invoices?page=${currentPage}&limit=${limit}${searchParam}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch invoices');
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
    mutationFn: async (data: InsertInvoice) => {
      return await apiRequest("POST", "/api/invoices", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Invoice created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create invoice. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertInvoice> }) => {
      return await apiRequest("PUT", `/api/invoices/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      setIsEditDialogOpen(false);
      setEditingInvoice(null);
      editForm.reset();
      toast({
        title: "Success",
        description: "Invoice updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update invoice. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/invoices/${id}`),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Invoice deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete invoice",
        variant: "destructive",
      });
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      await Promise.all(ids.map(id => apiRequest("DELETE", `/api/invoices/${id}`)));
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `${selectedItems.size} invoices deleted successfully`,
      });
      setSelectedItems(new Set());
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete invoices",
        variant: "destructive",
      });
    },
  });

  const form = useForm<InsertInvoice>({
    resolver: zodResolver(insertInvoiceSchema),
    defaultValues: {
      invoiceNumber: "",
      invoiceDate: new Date(),
      dueDate: new Date(),
      subtotal: "0",
      taxAmount: "0",
      totalAmount: "0",
      status: "pending",
    },
  });

  const editForm = useForm<InsertInvoice>({
    resolver: zodResolver(insertInvoiceSchema),
    defaultValues: {
      invoiceNumber: "",
      invoiceDate: new Date(),
      dueDate: new Date(),
      subtotal: "0",
      taxAmount: "0",
      totalAmount: "0",
      status: "pending",
    },
  });

  const onSubmit = (data: InsertInvoice) => {
    // Transform string values to proper decimal format
    const transformedData = {
      ...data,
      subtotal: data.subtotal?.toString() || "0",
      taxAmount: data.taxAmount?.toString() || "0",
      totalAmount: data.totalAmount?.toString() || "0",
      amortizationMonths: data.amortizationMonths ? parseInt(data.amortizationMonths.toString()) : undefined,
    };
    createMutation.mutate(transformedData);
  };

  const onEditSubmit = (data: InsertInvoice) => {
    if (editingInvoice) {
      // Transform string values to proper decimal format
      const transformedData = {
        ...data,
        subtotal: data.subtotal?.toString() || "0",
        taxAmount: data.taxAmount?.toString() || "0",
        totalAmount: data.totalAmount?.toString() || "0",
        amortizationMonths: data.amortizationMonths ? parseInt(data.amortizationMonths.toString()) : undefined,
      };
      updateMutation.mutate({ id: editingInvoice.id, data: transformedData });
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (invoice: any) => {
    setEditingInvoice(invoice);
    editForm.reset({
      invoiceNumber: invoice.invoiceNumber || "",
      companyId: invoice.companyId,
      sellerCompanyId: invoice.sellerCompanyId,
      locationIds: invoice.locationIds ? (typeof invoice.locationIds === 'string' ? invoice.locationIds.split(',').map(Number) : invoice.locationIds) : [],
      invoiceDate: invoice.invoiceDate ? new Date(invoice.invoiceDate) : new Date(),
      dueDate: invoice.dueDate ? new Date(invoice.dueDate) : new Date(),
      subtotal: invoice.subtotal || "0",
      taxAmount: invoice.taxAmount || "0",
      totalAmount: invoice.totalAmount || "0",
      notes: invoice.notes || "",
      status: invoice.status || "pending",
      serialNumbers: invoice.serialNumbers || "",
      amortizationMonths: invoice.amortizationMonths,
      propertyType: invoice.propertyType || "property",
      currency: invoice.currency || "EUR",
    });
    setIsEditDialogOpen(true);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === data?.invoices?.length) {
      setSelectedItems(new Set());
    } else {
      const allIds = data?.invoices?.map((item: any) => item.id) || [];
      setSelectedItems(new Set(allIds.filter((id: any): id is number => typeof id === 'number')));
    }
  };

  const handleSelectItem = (id: number) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const handleBulkDelete = () => {
    if (selectedItems.size === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedItems.size} invoices?`)) {
      bulkDeleteMutation.mutate(Array.from(selectedItems));
    }
  };

  const handleBulkEdit = () => {
    toast({
      title: "Bulk Edit",
      description: "Bulk edit functionality will be implemented soon",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'status-active';
      case 'pending':
        return 'status-maintenance';
      case 'overdue':
        return 'status-inactive';
      case 'cancelled':
        return 'bg-gray-500/20 text-gray-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  return (
    <div className="space-y-6">
      {/* Enhanced Search Interface */}
      <Card className="search-card">
        <CardContent className="p-6">
          <div className="search-header">
            <div className="search-icon-section">
              <div className="search-icon-wrapper">
                <span className="search-icon">🧾</span>
              </div>
              <div>
                <h3 className="search-title">Invoices</h3>
                <p className="search-subtitle">Financial documentation and billing management</p>
              </div>
            </div>
          </div>
          <div className="search-input-wrapper">
            <Search className="search-input-icon" />
            <Input
              type="text"
              placeholder="Search invoices by number, company, amount, or status..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions and Bulk Operations */}
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-2">
          <ImportExportDialog module="invoices" moduleName="Invoices">
            <Button className="btn-secondary">
              <Upload className="h-4 w-4 mr-2" />
              Import/Export
            </Button>
          </ImportExportDialog>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-primary">
                <Plus className="h-4 w-4 mr-2" />
                Create Invoice
              </Button>
            </DialogTrigger>
          <DialogContent className="glass-dialog dialog-xl">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <span className="text-xl">🧾</span>
                Add New Invoice
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="invoiceNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Invoice Number</FormLabel>
                        <FormControl>
                          <Input {...field} className="form-input" placeholder="INV-2024-001" />
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
                        <Select value={field.value || ""} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="form-input">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="glass-card border-white/10">
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                            <SelectItem value="overdue">Overdue</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
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
                    name="sellerCompanyId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Seller Company</FormLabel>
                        <Select value={field.value?.toString()} onValueChange={(value) => field.onChange(parseInt(value))}>
                          <FormControl>
                            <SelectTrigger className="form-input">
                              <SelectValue placeholder="Select seller company" />
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
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="subtotal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Subtotal (€)</FormLabel>
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
                    name="taxAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Tax Amount (€)</FormLabel>
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
                    name="totalAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Total Amount (€)</FormLabel>
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
                    {createMutation.isPending ? "Creating..." : "Create Invoice"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Enhanced Table */}
      <Card className="data-table">
        <CardHeader className="data-table-header">
          <CardTitle className="text-white flex items-center gap-2">
            <span>🧾</span>
            Invoices
            {data?.total && <span className="count-badge">{data.total}</span>}
          </CardTitle>
        </CardHeader>
        <CardContent className="data-table-content">
          {selectedItems.size > 0 && (
            <div className="mb-4">
              <BulkOperations
                selectedCount={selectedItems.size}
                onBulkEdit={handleBulkEdit}
                onBulkDelete={handleBulkDelete}
              />
            </div>
          )}
          
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="loading-shimmer h-16 rounded-lg"></div>
              ))}
            </div>
          ) : error ? (
            <div className="empty-state">
              <span className="empty-state-icon">⚠️</span>
              <p className="empty-state-title">Failed to load invoices</p>
              <p className="empty-state-description">There was an error loading the invoices</p>
            </div>
          ) : !data?.invoices?.length ? (
            <div className="empty-state">
              <span className="empty-state-icon">🧾</span>
              <p className="empty-state-title">No invoices found</p>
              <p className="empty-state-description">Create your first invoice to get started</p>
            </div>
          ) : (
            <>
              <div className="table-container">
                <table className="enhanced-table">
                  <thead>
                    <tr>
                      <th className="w-12">
                        <Checkbox
                          checked={selectedItems.size === data?.invoices?.length && data?.invoices?.length > 0}
                          onCheckedChange={handleSelectAll}
                          className="checkbox-custom"
                        />
                      </th>
                      <th>Invoice</th>
                      <th>Company</th>
                      <th>Amount</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.invoices.map((invoice: any) => (
                      <tr key={invoice.id} className="table-row">
                        <td>
                          <Checkbox
                            checked={selectedItems.has(invoice.id)}
                            onCheckedChange={() => handleSelectItem(invoice.id)}
                            className="checkbox-custom"
                          />
                        </td>
                        <td>
                          <div className="flex items-center space-x-3">
                            <div className="entity-avatar bg-green-500/20">
                              <span className="text-green-400">🧾</span>
                            </div>
                            <div>
                              <p className="entity-title">{invoice.invoiceNumber}</p>
                              <p className="entity-subtitle">Invoice #{invoice.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="text-slate-300 text-sm">
                          {companies?.companies?.find((c: any) => c.id === invoice.companyId)?.name || 'No company'}
                        </td>
                        <td>
                          <div className="flex items-center gap-1">
                            <Euro className="w-4 h-4 text-emerald-400" />
                            <span className="text-emerald-400 font-semibold">
                              {Number(invoice.totalAmount).toLocaleString()}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-1 text-slate-300 text-sm">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(invoice.invoiceDate).toLocaleDateString()}</span>
                          </div>
                        </td>
                        <td>
                          <Badge className={getStatusColor(invoice.status)}>
                            {invoice.status}
                          </Badge>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleEdit(invoice)}
                              className="action-button action-button-edit"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleDelete(invoice.id)}
                              className="action-button action-button-delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                            <AttachmentButton
                              entityType="invoices"
                              entityId={invoice.id}
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
                    Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, data.total)} of {data.total} invoices
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
