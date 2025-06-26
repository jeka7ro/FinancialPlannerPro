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
import { Upload } from "lucide-react";
import { AttachmentButton } from "@/components/ui/attachment-button";

// Utility function for property type colors
const getPropertyTypeColor = (propertyType: string) => {
  switch (propertyType?.toLowerCase()) {
    case 'property':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300';
    case 'rent':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
};

export default function Invoices() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<any>(null);
  const { toast } = useToast();
  const limit = 10;

  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/invoices', currentPage, limit, searchTerm],
    queryFn: async () => {
      const response = await fetch(`/api/invoices?page=${currentPage}&limit=${limit}&search=${searchTerm}`, {
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
    createMutation.mutate(data);
  };

  const onEditSubmit = (data: InsertInvoice) => {
    if (editingInvoice) {
      updateMutation.mutate({ id: editingInvoice.id, data });
    }
  };

  const handleEdit = (invoice: any) => {
    setEditingInvoice(invoice);
    editForm.reset({
      invoiceNumber: invoice.invoiceNumber || "",
      companyId: invoice.companyId,
      locationId: invoice.locationId,
      invoiceDate: invoice.invoiceDate ? new Date(invoice.invoiceDate) : new Date(),
      dueDate: invoice.dueDate ? new Date(invoice.dueDate) : new Date(),
      subtotal: invoice.subtotal || "0",
      taxAmount: invoice.taxAmount || "0",
      totalAmount: invoice.totalAmount || "0",
      notes: invoice.notes || "",
      status: invoice.status || "pending",
    });
    setIsEditDialogOpen(true);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const totalPages = data ? Math.ceil(data.total / limit) : 0;

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

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-2">
          <ImportExportDialog module="invoices" moduleName="Invoices">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
              <Upload className="h-4 w-4 mr-2" />
              Import/Export
            </Button>
          </ImportExportDialog>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="floating-action text-white">
                <span className="mr-2">➕</span>
                Create Invoice
              </Button>
            </DialogTrigger>
          <DialogContent className="glass-card border-white/10 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">Create New Invoice</DialogTitle>
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
                    name="invoiceDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Invoice Date</FormLabel>
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
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Due Date</FormLabel>
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
                    name="serialNumbers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Serial Numbers</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            value={field.value || ""} 
                            className="form-input" 
                            placeholder="Enter serial numbers separated by spaces"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="licenseDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">License Date</FormLabel>
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
                    name="amortizationMonths"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Amortization (Months)</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            min="1"
                            max="120"
                            className="form-input" 
                            placeholder="Number of months"
                            value={field.value?.toString() || ""}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="propertyType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Property Type</FormLabel>
                        <Select value={field.value || ""} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="form-input">
                              <SelectValue placeholder="Select property type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="glass-card border-white/10">
                            <SelectItem value="property">Property</SelectItem>
                            <SelectItem value="rent">Rent</SelectItem>
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
                            type="number" 
                            step="0.01"
                            className="form-input" 
                            placeholder="0.00"
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
                            type="number" 
                            step="0.01"
                            className="form-input" 
                            placeholder="0.00"
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
                            type="number" 
                            step="0.01"
                            className="form-input" 
                            placeholder="0.00"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Notes</FormLabel>
                      <FormControl>
                        <Textarea {...field} value={field.value || ""} className="form-input" placeholder="Additional notes..." />
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
                    {createMutation.isPending ? "Creating..." : "Create Invoice"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search */}
      <Card className="glass-card border-white/10">
        <CardContent className="p-6">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={handleSearch}
              className="form-input pl-10"
            />
            <span className="absolute left-3 top-3 text-slate-400">🔍</span>
          </div>
        </CardContent>
      </Card>

      {/* Invoices List */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="loading-shimmer h-20 rounded-xl"></div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8 text-slate-400">
              <span className="text-2xl mb-2 block">⚠️</span>
              Failed to load invoices
            </div>
          ) : !data?.invoices?.length ? (
            <div className="text-center py-8 text-slate-400">
              <span className="text-2xl mb-2 block">💰</span>
              No invoices found
            </div>
          ) : (
            <>
              <div className="overflow-x-auto -mx-6">
                <table className="w-full min-w-max">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Invoice</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Company</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Location</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Serial Numbers</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">License Date</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Amortization</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Property Type</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Amount</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Due Date</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Status</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.invoices.map((invoice: any) => (
                      <tr key={invoice.id} className="table-row border-b border-white/5 hover:bg-blue-500/10">
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                              <span className="text-green-500 text-sm">💰</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">{invoice.invoiceNumber}</p>
                              <p className="text-xs text-slate-400">
                                {new Date(invoice.invoiceDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-300">
                          {invoice.companyId ? `Company ${invoice.companyId}` : 'No company'}
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-300">
                          {invoice.locationId ? `Location ${invoice.locationId}` : 'No location'}
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-300">
                          {invoice.serialNumbers ? (
                            <div className="flex flex-wrap gap-1">
                              {invoice.serialNumbers.split(' ').filter((sn: string) => sn.trim()).map((serialNumber: string, index: number) => (
                                <Badge key={index} variant="outline" className="text-xs bg-blue-500/20 text-blue-300 border-blue-500/50">
                                  {serialNumber}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-500">No serials</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-300">
                          {invoice.licenseDate ? new Date(invoice.licenseDate).toLocaleDateString() : 'No license date'}
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-300">
                          {invoice.amortizationMonths ? `${invoice.amortizationMonths} months` : 'No amortization'}
                        </td>
                        <td className="py-4 px-4">
                          <Badge className={`${getPropertyTypeColor(invoice.propertyType)} border`}>
                            {invoice.propertyType || 'property'}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-sm font-semibold text-white">
                          €{Number(invoice.totalAmount).toLocaleString()}
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-300">
                          {new Date(invoice.dueDate).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4">
                          <Badge className={`${getStatusColor(invoice.status)} border`}>
                            {invoice.status}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-400">
                              👁️
                            </Button>
                            <Button variant="ghost" size="sm" className="text-amber-500 hover:text-amber-400">
                              ✏️
                            </Button>
                            <AttachmentButton 
                              entityType="invoice" 
                              entityId={invoice.id}
                            />
                            <Button variant="ghost" size="sm" className="text-emerald-500 hover:text-emerald-400">
                              📄
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

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
                <div className="text-sm text-slate-400">
                  Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, data.total)} of {data.total} entries
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="ghost"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="text-slate-400 hover:text-white hover:bg-white/10"
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
                          ? "bg-blue-500 text-white" 
                          : "text-slate-400 hover:text-white hover:bg-white/10"
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
                    className="text-slate-400 hover:text-white hover:bg-white/10"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
