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
import { insertInvoiceSchema, type InsertInvoice } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Upload, Edit, Trash2, Plus, Search, Calendar, FileText, Eye, Building2, CreditCard, Settings, MapPin } from "lucide-react";
import { AttachmentButton } from "@/components/ui/attachment-button";
import { BulkOperations } from "@/components/ui/bulk-operations";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CompanyLogo } from "@/components/ui/company-logo";

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

// Function to group serial numbers by year and create ranges
const groupSerialNumbers = (serialNumbers: string) => {
  if (!serialNumbers) return '';
  
  const numbers = serialNumbers.split(/[,\s]+/).filter(n => n.trim());
  if (numbers.length === 0) return '';
  
  // Group by year (assuming format like "2016-1234" or just "1234")
  const grouped = new Map<string, number[]>();
  
  numbers.forEach(num => {
    const parts = num.split('-');
    let year = 'Unknown';
    let serialPart = num;
    
    if (parts.length === 2 && parts[0].length === 4) {
      year = parts[0];
      serialPart = parts[1];
    }
    
    const serialInt = parseInt(serialPart);
    if (!isNaN(serialInt)) {
      if (!grouped.has(year)) {
        grouped.set(year, []);
      }
      grouped.get(year)!.push(serialInt);
    }
  });
  
  // Create display string with ranges
  const result: string[] = [];
  
  grouped.forEach((serials, year) => {
    serials.sort((a, b) => a - b);
    const ranges: string[] = [];
    let start = serials[0];
    let end = serials[0];
    
    for (let i = 1; i < serials.length; i++) {
      if (serials[i] === end + 1) {
        end = serials[i];
      } else {
        if (start === end) {
          ranges.push(start.toString());
        } else {
          ranges.push(`${start}-${end}`);
        }
        start = end = serials[i];
      }
    }
    
    if (start === end) {
      ranges.push(start.toString());
    } else {
      ranges.push(`${start}-${end}`);
    }
    
    if (year !== 'Unknown') {
      result.push(`${year}: ${ranges.join(', ')}`);
    } else {
      result.push(ranges.join(', '));
    }
  });
  
  return result.join(' | ');
};

export default function Invoices() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<any>(null);
  const [selectedInvoices, setSelectedInvoices] = useState<number[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<number[]>([]);
  const [editSelectedLocations, setEditSelectedLocations] = useState<number[]>([]);
  const { toast } = useToast();
  const limit = 10;

  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/invoices', currentPage, limit, searchTerm],
    queryFn: async () => {
      const searchParam = searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : '';
      const response = await apiRequest('GET', `/api/invoices?page=${currentPage}&limit=${limit}${searchParam}`);
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

  const { data: users } = useQuery({
    queryKey: ['/api/users', 1, 100],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/users?page=1&limit=100');
      return response.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      // Add current user ID to createdBy field
      const dataWithCreatedBy = {
        ...data,
        createdBy: 1, // TODO: Get from auth context
        locationIds: Array.isArray(selectedLocations) ? selectedLocations : [],
      };
      return await apiRequest("POST", "/api/invoices", dataWithCreatedBy);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      setIsCreateDialogOpen(false);
      setSelectedLocations([]);
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
    mutationFn: ({ id, data }: { id: number; data: any }) => {
      const dataWithLocations = {
        ...data,
        locationIds: Array.isArray(editSelectedLocations) ? editSelectedLocations : [],
      };
      return apiRequest("PUT", `/api/invoices/${id}`, dataWithLocations);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Invoice updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      setIsEditDialogOpen(false);
      setEditingInvoice(null);
      setEditSelectedLocations([]);
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
    mutationFn: (ids: number[]) => apiRequest("POST", "/api/invoices/bulk-delete", { ids }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: `${selectedInvoices.length} invoices deleted successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      setSelectedInvoices([]);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete invoices",
        variant: "destructive",
      });
    },
  });

  const form = useForm<any>({
    resolver: zodResolver(insertInvoiceSchema.omit({ createdBy: true, locationIds: true })),
    defaultValues: {
      invoiceNumber: "",
      invoiceDate: new Date(),
      dueDate: new Date(),
      subtotal: "0",
      taxAmount: "0",
      totalAmount: "0",
      status: "pending",
      currency: "EUR",
      propertyType: "property",
      amortizationMonths: 12,
    },
    mode: "onChange",
  });

  const editForm = useForm<any>({
    resolver: zodResolver(insertInvoiceSchema.omit({ createdBy: true, locationIds: true })),
    defaultValues: {
      invoiceNumber: "",
      invoiceDate: new Date(),
      dueDate: new Date(),
      subtotal: "0",
      taxAmount: "0",
      totalAmount: "0",
      status: "pending",
      currency: "EUR",
      propertyType: "property",
      amortizationMonths: 12,
    },
  });

  const onSubmit = (data: any) => {
    const submissionData = {
      ...data,
      // Ensure proper data types
      companyId: parseInt(data.companyId),
      sellerCompanyId: parseInt(data.sellerCompanyId),
      amortizationMonths: parseInt(data.amortizationMonths) || 12,
    };
    console.log("Submitting invoice data:", submissionData);
    createMutation.mutate(submissionData);
  };

  const onEditSubmit = (data: any) => {
    if (editingInvoice) {
      const submissionData = {
        ...data,
        // Ensure proper data types
        companyId: parseInt(data.companyId),
        sellerCompanyId: parseInt(data.sellerCompanyId),
        amortizationMonths: parseInt(data.amortizationMonths) || 12,
      };
      updateMutation.mutate({ id: editingInvoice.id, data: submissionData });
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (invoice: any) => {
    setEditingInvoice(invoice);
    
    // Parse location IDs
    const locationIds = invoice.locationIds ? 
      (typeof invoice.locationIds === 'string' ? 
        invoice.locationIds.split(',').map((id: string) => parseInt(id)).filter((id: number) => !isNaN(id)) : 
        invoice.locationIds) : [];
    setEditSelectedLocations(locationIds);
    
    editForm.reset({
      invoiceNumber: invoice.invoiceNumber || "",
      companyId: invoice.companyId,
      sellerCompanyId: invoice.sellerCompanyId,
      invoiceDate: invoice.invoiceDate ? new Date(invoice.invoiceDate) : new Date(),
      dueDate: invoice.dueDate ? new Date(invoice.dueDate) : new Date(),
      subtotal: invoice.subtotal || "0",
      taxAmount: invoice.taxAmount || "0",
      totalAmount: invoice.totalAmount || "0",
      notes: invoice.notes || "",
      status: invoice.status || "pending",
      serialNumbers: invoice.serialNumbers || "",
      amortizationMonths: invoice.amortizationMonths || 12,
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
    if (selectedInvoices.length === data?.invoices?.length) {
      setSelectedInvoices([]);
    } else {
      setSelectedInvoices(data?.invoices?.map((item: any) => item.id) || []);
    }
  };

  const handleSelectInvoice = (id: number) => {
    setSelectedInvoices(prev => 
      prev.includes(id) 
        ? prev.filter(invoiceId => invoiceId !== id)
        : [...prev, id]
    );
  };

  const handleBulkEdit = () => {
    toast({
      title: "Bulk Edit",
      description: `Editing ${selectedInvoices.length} invoices`,
    });
  };

  const handleBulkDelete = () => {
    if (selectedInvoices.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedInvoices.length} invoices?`)) {
      bulkDeleteMutation.mutate(selectedInvoices);
    }
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
    <div className="space-y-4 w-full max-w-none">
      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BulkOperations 
            selectedCount={selectedInvoices.length}
            onBulkEdit={handleBulkEdit}
            onBulkDelete={handleBulkDelete}
          />
        </div>
        <div className="text-sm text-slate-400">
          {selectedInvoices.length > 0 && (
            <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full">
              {selectedInvoices.length} selected
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
              placeholder="Search invoices by number, company, amount, status, or serial numbers..."
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
              Add Invoice
            </Button>
            <ImportExportDialog module="invoices" moduleName="Invoices">
              <Button className="px-4 py-2 rounded-lg h-10 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0">
                Import/Export
              </Button>
            </ImportExportDialog>
          </div>
        </div>
      </div>

      {/* Enhanced Invoices Table */}
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
            <h3 className="text-xl font-semibold text-white mb-2">Failed to load invoices</h3>
            <p>Please try refreshing the page or check your connection.</p>
          </div>
        ) : !data?.invoices?.length ? (
          <div className="empty-state-container">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-xl font-semibold text-white mb-2">No invoices found</h3>
            <p>Get started by creating your first invoice.</p>
          </div>
        ) : (
          <>
            <div className="enhanced-table-wrapper">
              <table className="enhanced-table w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="w-12 px-4 py-3 text-left">
                      <Checkbox
                        checked={selectedInvoices.length === data?.invoices.length && data?.invoices.length > 0}
                        onCheckedChange={handleSelectAll}
                        className="border-white/30"
                      />
                    </th>
                    <th className="w-16 px-4 py-3 text-left font-semibold text-white">#</th>
                    <th className="px-4 py-3 text-left font-semibold text-white">Invoice</th>
                    <th className="px-4 py-3 text-left font-semibold text-white">Buyer</th>
                    <th className="px-4 py-3 text-left font-semibold text-white">Seller</th>
                    <th className="px-4 py-3 text-left font-semibold text-white">Currency</th>
                    <th className="px-4 py-3 text-left font-semibold text-white">Amount</th>
                    <th className="px-4 py-3 text-left font-semibold text-white">Status</th>
                    <th className="px-4 py-3 text-left font-semibold text-white">Date</th>
                    <th className="px-4 py-3 text-left font-semibold text-white">Due Date</th>
                    <th className="px-4 py-3 text-left font-semibold text-white">Serial Numbers</th>
                    <th className="px-4 py-3 text-left font-semibold text-white">Attachments</th>
                    <th className="px-4 py-3 text-right font-semibold text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.invoices.map((invoice: any, index: number) => {
                    const buyer = Array.isArray(companies?.companies) ? companies.companies.find((c: any) => c.id === invoice.companyId) : undefined;
                    const seller = Array.isArray(companies?.companies) ? companies.companies.find((c: any) => c.id === invoice.sellerCompanyId) : undefined;
                    return (
                      <tr key={invoice.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-4 py-4">
                          <Checkbox
                            checked={selectedInvoices.includes(invoice.id)}
                            onCheckedChange={() => handleSelectInvoice(invoice.id)}
                            className="border-white/30"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <div className="table-cell-primary font-medium">
                            {(currentPage - 1) * limit + index + 1}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="min-w-0 flex-1">
                            <div className="table-cell-primary font-medium truncate">{invoice.invoiceNumber}</div>
                            <div className="table-cell-secondary text-sm truncate">{invoice.notes || 'No notes'}</div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2 min-w-0">
                            <CompanyLogo companyId={buyer?.id} companyName={buyer?.name} size="sm" />
                            <span className="table-cell-primary font-medium truncate">{buyer?.name || 'Unknown'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2 min-w-0">
                            <CompanyLogo companyId={seller?.id} companyName={seller?.name} size="sm" />
                            <span className="table-cell-primary font-medium truncate">{seller?.name || 'Unknown'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="table-cell-primary font-medium">{invoice.currency}</span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <span className="table-cell-primary font-medium">
                              {getCurrencySymbol(invoice.currency)}{parseFloat(invoice.totalAmount || 0).toLocaleString()}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`status-badge ${getStatusColor(invoice.status)}`}>{invoice.status}</span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="table-cell-secondary">
                            {invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString() : 'N/A'}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="table-cell-secondary">
                            {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <Dialog>
                            <DialogTrigger asChild>
                              <button className="table-cell-primary cursor-pointer inline-flex items-center gap-2 hover:text-blue-300 transition-colors">
                                <span className="text-blue-400">🔢</span>
                                <span className="font-medium">
                                  {invoice.serialNumbers ? 
                                    `${invoice.serialNumbers.split(/[,\s]+/).filter((n: string) => n.trim()).length} serials` : 
                                    'No serials'
                                  }
                                </span>
                              </button>
                            </DialogTrigger>
                            <DialogContent className="glass-dialog">
                              <DialogHeader>
                                <DialogTitle className="text-white flex items-center gap-2">
                                  <span className="text-blue-400">🔢</span>
                                  Serial Numbers for Invoice {invoice.invoiceNumber}
                                </DialogTitle>
                              </DialogHeader>
                              <div className="max-h-96 overflow-y-auto">
                                {invoice.serialNumbers ? (
                                  <div>
                                    <p className="text-slate-400 mb-4">
                                      {invoice.serialNumbers.split(/[,\s]+/).filter((n: string) => n.trim()).length} serial numbers in this invoice:
                                    </p>
                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                                      {invoice.serialNumbers.split(/[,\s]+/).filter((n: string) => n.trim()).map((serial: string, idx: number) => (
                                        <div key={idx} className="bg-white/5 rounded-lg p-2 flex items-center gap-2 border border-white/10 hover:bg-white/10 transition-colors">
                                          <span className="text-blue-400 text-sm">🔢</span>
                                          <span className="text-white text-sm font-medium truncate">
                                            {serial.trim()}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                    <div className="mt-4 p-3 bg-slate-800/30 rounded-lg border border-white/10">
                                      <p className="text-slate-400 text-sm mb-2">Grouped by year:</p>
                                      <p className="text-white text-sm">{groupSerialNumbers(invoice.serialNumbers)}</p>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-center py-8">
                                    <div className="text-4xl mb-4">🔢</div>
                                    <div className="text-slate-400">No serial numbers configured for this invoice</div>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                        </td>
                        <td className="px-4 py-4">
                          <AttachmentButton 
                            entityType="invoices" 
                            entityId={invoice.id} 
                            entityName={`Invoice ${invoice.invoiceNumber}`} 
                          />
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              className="action-button text-amber-500 hover:text-amber-400"
                              onClick={() => handleEdit(invoice)}
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button 
                              className="action-button text-red-500 hover:text-red-400"
                              onClick={() => handleDelete(invoice.id)}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Pagination and entries info - SUB tabel */}
      {data?.invoices?.length > 0 && (
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
              disabled={currentPage === Math.ceil((data.total || 0) / limit)}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="h-8 min-w-[40px] px-3"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Create Invoice Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="glass-dialog max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-400" />
              Create New Invoice
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Fill in the details below to create a new invoice.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Invoice Number */}
                <FormField
                  control={form.control}
                  name="invoiceNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Invoice Number *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., INV-2024-001"
                          className="enhanced-input"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Company */}
                <FormField
                  control={form.control}
                  name="companyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Company *</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString() ?? ""}>
                        <FormControl>
                          <SelectTrigger className="enhanced-input">
                            <SelectValue placeholder="Select a company" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
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

                {/* Seller Company */}
                <FormField
                  control={form.control}
                  name="sellerCompanyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Seller Company *</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString() ?? ""}>
                        <FormControl>
                          <SelectTrigger className="enhanced-input">
                            <SelectValue placeholder="Select seller company" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
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

                {/* Invoice Date */}
                <FormField
                  control={form.control}
                  name="invoiceDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Invoice Date *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="date"
                          className="enhanced-input"
                          value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Due Date */}
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Due Date *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="date"
                          className="enhanced-input"
                          value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Status */}
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Status *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? ""}>
                        <FormControl>
                          <SelectTrigger className="enhanced-input">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
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

                {/* Currency */}
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Currency *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? ""}>
                        <FormControl>
                          <SelectTrigger className="enhanced-input">
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="LEI">LEI</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Property Type */}
                <FormField
                  control={form.control}
                  name="propertyType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Property Type *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? ""}>
                        <FormControl>
                          <SelectTrigger className="enhanced-input">
                            <SelectValue placeholder="Select property type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="property">Property</SelectItem>
                          <SelectItem value="rent">Rent</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Amortization Months */}
                <FormField
                  control={form.control}
                  name="amortizationMonths"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Amortization Months</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          placeholder="12"
                          className="enhanced-input"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Subtotal */}
                <FormField
                  control={form.control}
                  name="subtotal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Subtotal</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="enhanced-input"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Tax Amount */}
                <FormField
                  control={form.control}
                  name="taxAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Tax Amount</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="enhanced-input"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Total Amount */}
                <FormField
                  control={form.control}
                  name="totalAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Total Amount *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="enhanced-input"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Serial Numbers */}
              <FormField
                control={form.control}
                name="serialNumbers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Serial Numbers</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Enter serial numbers separated by commas or new lines..."
                        className="enhanced-input min-h-[100px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Additional notes about this invoice..."
                        className="enhanced-input min-h-[80px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Locations Selection */}
              <div className="space-y-4">
                <FormLabel className="text-white">Locations</FormLabel>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-40 overflow-y-auto p-3 bg-slate-800/30 rounded-lg border border-white/10">
                  {locations?.locations?.map((location: any) => (
                    <div key={location.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`location-${location.id}`}
                        checked={selectedLocations.includes(location.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedLocations([...selectedLocations, location.id]);
                          } else {
                            setSelectedLocations(selectedLocations.filter(id => id !== location.id));
                          }
                        }}
                        className="border-white/30"
                      />
                      <label
                        htmlFor={`location-${location.id}`}
                        className="text-sm text-white cursor-pointer"
                      >
                        {location.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0"
                >
                  {createMutation.isPending ? "Creating..." : "Create Invoice"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Invoice Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="glass-dialog max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Edit className="h-5 w-5 text-amber-400" />
              Edit Invoice
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Update the invoice details below.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Invoice Number */}
                <FormField
                  control={editForm.control}
                  name="invoiceNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Invoice Number *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., INV-2024-001"
                          className="enhanced-input"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Company */}
                <FormField
                  control={editForm.control}
                  name="companyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Company *</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString() ?? ""}>
                        <FormControl>
                          <SelectTrigger className="enhanced-input">
                            <SelectValue placeholder="Select a company" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
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

                {/* Seller Company */}
                <FormField
                  control={editForm.control}
                  name="sellerCompanyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Seller Company *</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString() ?? ""}>
                        <FormControl>
                          <SelectTrigger className="enhanced-input">
                            <SelectValue placeholder="Select seller company" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
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

                {/* Invoice Date */}
                <FormField
                  control={editForm.control}
                  name="invoiceDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Invoice Date *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="date"
                          className="enhanced-input"
                          value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Due Date */}
                <FormField
                  control={editForm.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Due Date *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="date"
                          className="enhanced-input"
                          value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Status */}
                <FormField
                  control={editForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Status *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? ""}>
                        <FormControl>
                          <SelectTrigger className="enhanced-input">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
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

                {/* Currency */}
                <FormField
                  control={editForm.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Currency *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? ""}>
                        <FormControl>
                          <SelectTrigger className="enhanced-input">
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="LEI">LEI</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Property Type */}
                <FormField
                  control={editForm.control}
                  name="propertyType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Property Type *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? ""}>
                        <FormControl>
                          <SelectTrigger className="enhanced-input">
                            <SelectValue placeholder="Select property type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="property">Property</SelectItem>
                          <SelectItem value="rent">Rent</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Amortization Months */}
                <FormField
                  control={editForm.control}
                  name="amortizationMonths"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Amortization Months</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          placeholder="12"
                          className="enhanced-input"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Subtotal */}
                <FormField
                  control={editForm.control}
                  name="subtotal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Subtotal</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="enhanced-input"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Tax Amount */}
                <FormField
                  control={editForm.control}
                  name="taxAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Tax Amount</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="enhanced-input"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Total Amount */}
                <FormField
                  control={editForm.control}
                  name="totalAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Total Amount *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="enhanced-input"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Serial Numbers */}
              <FormField
                control={editForm.control}
                name="serialNumbers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Serial Numbers</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Enter serial numbers separated by commas or new lines..."
                        className="enhanced-input min-h-[100px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Notes */}
              <FormField
                control={editForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Additional notes about this invoice..."
                        className="enhanced-input min-h-[80px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Locations Selection */}
              <div className="space-y-4">
                <FormLabel className="text-white">Locations</FormLabel>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-40 overflow-y-auto p-3 bg-slate-800/30 rounded-lg border border-white/10">
                  {locations?.locations?.map((location: any) => (
                    <div key={location.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-location-${location.id}`}
                        checked={editSelectedLocations.includes(location.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setEditSelectedLocations([...editSelectedLocations, location.id]);
                          } else {
                            setEditSelectedLocations(editSelectedLocations.filter(id => id !== location.id));
                          }
                        }}
                        className="border-white/30"
                      />
                      <label
                        htmlFor={`edit-location-${location.id}`}
                        className="text-sm text-white cursor-pointer"
                      >
                        {location.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white border-0"
                >
                  {updateMutation.isPending ? "Updating..." : "Update Invoice"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
