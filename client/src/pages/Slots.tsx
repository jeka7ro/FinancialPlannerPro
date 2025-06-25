import { useState } from "react";
import { ImportExportDialog } from "@/components/ui/import-export-dialog";
import { AttachmentButton } from "@/components/ui/attachment-button";
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
import { insertSlotSchema, type InsertSlot } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Upload, Calendar } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { BulkOperations } from "@/components/ui/bulk-operations";
import { safeFormValue } from "@/utils/formUtils";

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

export default function Slots() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<any>(null);
  const [selectedSlots, setSelectedSlots] = useState<number[]>([]);
  const { toast } = useToast();
  const limit = 10;

  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/slots', currentPage, limit, searchTerm],
    queryFn: async () => {
      const response = await fetch(`/api/slots?page=${currentPage}&limit=${limit}&search=${searchTerm}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch slots');
      return response.json();
    },
  });

  const { data: cabinets } = useQuery({
    queryKey: ['/api/cabinets', 1, 100],
    queryFn: async () => {
      const response = await fetch('/api/cabinets?page=1&limit=100', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch cabinets');
      return response.json();
    },
  });

  const { data: gameMixes } = useQuery({
    queryKey: ['/api/game-mixes', 1, 100],
    queryFn: async () => {
      const response = await fetch('/api/game-mixes?page=1&limit=100', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch game mixes');
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

  const { data: invoices } = useQuery({
    queryKey: ['/api/invoices', 1, 1000],
    queryFn: async () => {
      const response = await fetch('/api/invoices?page=1&limit=1000', {
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

  const { data: onjnReports } = useQuery({
    queryKey: ['/api/onjn-reports', 1, 1000],
    queryFn: async () => {
      const response = await fetch('/api/onjn-reports?page=1&limit=1000', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch ONJN reports');
      return response.json();
    },
  });

  // Function to find invoice number by matching slot serial number with invoice serial numbers
  const findInvoiceBySerialNumber = (slotSerialNumber: string) => {
    if (!invoices?.invoices || !slotSerialNumber) return null;
    
    const matchingInvoice = invoices.invoices.find((invoice: any) => {
      if (!invoice.serialNumbers) return false;
      const serialNumbers = invoice.serialNumbers.split(' ').filter((sn: string) => sn.trim());
      return serialNumbers.includes(slotSerialNumber);
    });
    
    return matchingInvoice?.invoiceNumber || null;
  };

  // Function to find commission date by matching slot serial number with ONJN serial numbers
  const findCommissionDateBySerialNumber = (slotSerialNumber: string) => {
    if (!onjnReports?.onjnReports || !slotSerialNumber) return null;
    
    const matchingReport = onjnReports.onjnReports.find((report: any) => {
      if (!report.serialNumbers) return false;
      const serialNumbers = report.serialNumbers.split(' ').filter((sn: string) => sn.trim());
      return serialNumbers.includes(slotSerialNumber);
    });
    
    return matchingReport?.commissionDate ? new Date(matchingReport.commissionDate).toLocaleDateString() : null;
  };

  const createMutation = useMutation({
    mutationFn: async (data: InsertSlot) => {
      return await apiRequest("POST", "/api/slots", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/slots'] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Slot created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create slot. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertSlot> }) => {
      return await apiRequest("PUT", `/api/slots/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/slots'] });
      setIsEditDialogOpen(false);
      setEditingSlot(null);
      editForm.reset();
      toast({
        title: "Success",
        description: "Slot updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update slot. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/slots/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/slots'] });
      toast({
        title: "Success",
        description: "Slot deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete slot. Please try again.",
        variant: "destructive",
      });
    },
  });

  const form = useForm<InsertSlot>({
    resolver: zodResolver(insertSlotSchema),
    defaultValues: {
      exciterType: "",
      propertyType: "property",
      serialNr: "",
      isActive: true,
    },
  });

  const editForm = useForm<InsertSlot>({
    resolver: zodResolver(insertSlotSchema),
    defaultValues: {
      exciterType: "",
      propertyType: "property",
      serialNr: "",
      isActive: true,
    },
  });

  const onSubmit = (data: InsertSlot) => {
    createMutation.mutate(data);
  };

  const onEditSubmit = (data: InsertSlot) => {
    if (editingSlot) {
      updateMutation.mutate({ id: editingSlot.id, data });
    }
  };

  const handleEdit = (slot: any) => {
    setEditingSlot(slot);
    editForm.reset({
      cabinetId: slot.cabinetId || undefined,
      gameMixId: slot.gameMixId || undefined,
      providerId: slot.providerId || undefined,
      exciterType: slot.exciterType || "",
      denomination: slot.denomination || "",
      maxBet: slot.maxBet || "",
      rtp: slot.rtp || "",
      propertyType: slot.propertyType || "property",
      ownerId: slot.ownerId || undefined,
      serialNr: slot.serialNr || "",
      invoiceId: slot.invoiceId || undefined,
      commissionDate: slot.commissionDate ? new Date(slot.commissionDate) : undefined,
      onjnReportId: slot.onjnReportId || undefined,
      dailyRevenue: slot.dailyRevenue || "",
      isActive: slot.isActive !== undefined ? slot.isActive : true,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (slotId: number) => {
    if (confirm("Are you sure you want to delete this slot?")) {
      deleteMutation.mutate(slotId);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleSelectAll = () => {
    if (selectedSlots.length === data?.slots.length) {
      setSelectedSlots([]);
    } else {
      setSelectedSlots(data?.slots.map((s: any) => s.id) || []);
    }
  };

  const handleSelectSlot = (slotId: number) => {
    setSelectedSlots(prev => 
      prev.includes(slotId) 
        ? prev.filter(id => id !== slotId)
        : [...prev, slotId]
    );
  };

  const handleBulkEdit = () => {
    toast({
      title: "Bulk Edit",
      description: `Editing ${selectedSlots.length} slots`,
    });
  };

  const handleBulkDelete = () => {
    if (selectedSlots.length === 0) return;
    
    if (confirm(`Are you sure you want to delete ${selectedSlots.length} slots?`)) {
      selectedSlots.forEach(id => deleteMutation.mutate(id));
      setSelectedSlots([]);
    }
  };

  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex items-center justify-between">
        <BulkOperations 
          selectedCount={selectedSlots.length}
          onBulkEdit={handleBulkEdit}
          onBulkDelete={handleBulkDelete}
        />
        <div className="flex items-center gap-2">
          <ImportExportDialog module="slots" moduleName="Slots">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
              <Upload className="h-4 w-4 mr-2" />
              Import/Export
            </Button>
          </ImportExportDialog>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="floating-action text-white">
                <span className="mr-2">➕</span>
                Add Slot
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-white/10 text-white max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-white">Create New Slot</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="cabinetId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Cabinet</FormLabel>
                          <Select value={field.value?.toString()} onValueChange={(value) => field.onChange(parseInt(value))}>
                            <FormControl>
                              <SelectTrigger className="form-input">
                                <SelectValue placeholder="Select cabinet" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="glass-card border-white/10">
                              {cabinets?.cabinets?.map((cabinet: any) => (
                                <SelectItem key={cabinet.id} value={cabinet.id.toString()}>
                                  {cabinet.model}
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
                      name="gameMixId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Game Mix</FormLabel>
                          <Select value={field.value?.toString()} onValueChange={(value) => field.onChange(parseInt(value))}>
                            <FormControl>
                              <SelectTrigger className="form-input">
                                <SelectValue placeholder="Select game mix" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="glass-card border-white/10">
                              {gameMixes?.gameMixes?.map((gameMix: any) => (
                                <SelectItem key={gameMix.id} value={gameMix.id.toString()}>
                                  {gameMix.name}
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
                      name="providerId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Provider</FormLabel>
                          <Select value={field.value?.toString()} onValueChange={(value) => field.onChange(parseInt(value))}>
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

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="exciterType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Exciter Type</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ""} className="form-input" placeholder="Enter exciter type" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="serialNr"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Serial Number</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ""} className="form-input" placeholder="Enter serial number" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
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
                    <FormField
                      control={form.control}
                      name="commissionDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Commission Date</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              value={field.value ? (field.value instanceof Date ? field.value.toISOString().split('T')[0] : new Date(field.value).toISOString().split('T')[0]) : ""}
                              onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                              className="form-input"
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
                      className="btn-gaming"
                      disabled={createMutation.isPending}
                    >
                      {createMutation.isPending ? "Creating..." : "Create Slot"}
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
              placeholder="Search slots..."
              value={searchTerm}
              onChange={handleSearch}
              className="form-input pl-10"
            />
            <span className="absolute left-3 top-3 text-slate-400">🔍</span>
          </div>
        </CardContent>
      </Card>

      {/* Slots List */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Slot Machines</CardTitle>
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
              Failed to load slots
            </div>
          ) : !data?.slots?.length ? (
            <div className="text-center py-8 text-slate-400">
              <span className="text-2xl mb-2 block">🎰</span>
              No slots found
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full table-fixed">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-2 px-3 w-10">
                        <Checkbox
                          checked={selectedSlots.length === data?.slots.length && data?.slots.length > 0}
                          onCheckedChange={handleSelectAll}
                          className="border-white/20"
                        />
                      </th>
                      <th className="text-left py-2 px-3 text-sm font-medium text-slate-400 w-24">Cabinet</th>
                      <th className="text-left py-2 px-3 text-sm font-medium text-slate-400 w-20">Game Mix</th>
                      <th className="text-left py-2 px-3 text-sm font-medium text-slate-400 w-24">Exciter Type</th>
                      <th className="text-left py-2 px-3 text-sm font-medium text-slate-400 w-16">RTP</th>
                      <th className="text-left py-2 px-3 text-sm font-medium text-slate-400 w-20">Serial Nr</th>
                      <th className="text-left py-2 px-3 text-sm font-medium text-slate-400 w-24">Invoice</th>
                      <th className="text-left py-2 px-3 text-sm font-medium text-slate-400 w-28">Commission Date</th>
                      <th className="text-left py-2 px-3 text-sm font-medium text-slate-400 w-20">Property</th>
                      <th className="text-left py-2 px-3 text-sm font-medium text-slate-400 w-24">Revenue (24h)</th>
                      <th className="text-left py-2 px-3 text-sm font-medium text-slate-400 w-20">Attachments</th>
                      <th className="text-right py-2 px-3 text-sm font-medium text-slate-400 w-20">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.slots.map((slot: any) => (
                      <tr key={slot.id} className="table-row border-b border-white/5 hover:bg-blue-500/10">
                        <td className="py-3 px-3">
                          <Checkbox
                            checked={selectedSlots.includes(slot.id)}
                            onCheckedChange={() => handleSelectSlot(slot.id)}
                            className="border-white/20"
                          />
                        </td>
                        <td className="py-3 px-3 text-sm text-slate-300 truncate">
                          {cabinets?.cabinets?.find((c: any) => c.id === slot.cabinetId)?.model || 'N/A'}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-medium text-white text-sm truncate">
                            {gameMixes?.gameMixes?.find((g: any) => g.id === slot.gameMixId)?.name || 'N/A'}
                          </div>
                          <div className="text-xs text-slate-400 truncate">
                            {providers?.providers?.find((p: any) => p.id === slot.providerId)?.name || 'No provider'}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-sm text-slate-300 truncate">
                          {slot.exciterType || 'N/A'}
                        </td>
                        <td className="py-3 px-3 text-sm text-slate-300">
                          {slot.rtp ? `${Number(slot.rtp)}%` : 'N/A'}
                        </td>
                        <td className="py-3 px-3 text-sm text-slate-300 truncate">
                          {slot.serialNr || 'N/A'}
                        </td>
                        <td className="py-3 px-3 text-sm text-slate-300 truncate">
                          {findInvoiceBySerialNumber(slot.serialNr) || 'N/A'}
                        </td>
                        <td className="py-3 px-3 text-sm text-slate-300">
                          <div className="flex items-center gap-1">
                            {slot.commissionDate && (
                              <Calendar className="h-3 w-3 text-blue-400" />
                            )}
                            <span className="truncate">
                              {slot.commissionDate 
                                ? new Date(slot.commissionDate).toLocaleDateString() 
                                : findCommissionDateBySerialNumber(slot.serialNr) || 'N/A'
                              }
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge className={`${getPropertyTypeColor(slot.propertyType)} border`}>
                            {slot.propertyType}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-sm font-semibold text-emerald-500">
                          €{slot.dailyRevenue ? Number(slot.dailyRevenue).toLocaleString() : '0'}
                        </td>
                        <td className="py-4 px-4">
                          <AttachmentButton 
                            entityType="slot" 
                            entityId={slot.id}
                          />
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(slot)}
                              className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/20"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(slot.id)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-slate-400">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="glass-card border-white/10 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Slot</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="cabinetId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Cabinet</FormLabel>
                      <Select value={field.value?.toString()} onValueChange={(value) => field.onChange(parseInt(value))}>
                        <FormControl>
                          <SelectTrigger className="form-input">
                            <SelectValue placeholder="Select cabinet" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="glass-card border-white/10">
                          {cabinets?.cabinets?.map((cabinet: any) => (
                            <SelectItem key={cabinet.id} value={cabinet.id.toString()}>
                              {cabinet.model}
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
                  name="gameMixId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Game Mix</FormLabel>
                      <Select value={field.value?.toString()} onValueChange={(value) => field.onChange(parseInt(value))}>
                        <FormControl>
                          <SelectTrigger className="form-input">
                            <SelectValue placeholder="Select game mix" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="glass-card border-white/10">
                          {gameMixes?.gameMixes?.map((gameMix: any) => (
                            <SelectItem key={gameMix.id} value={gameMix.id.toString()}>
                              {gameMix.name}
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
                  control={editForm.control}
                  name="providerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Provider</FormLabel>
                      <Select value={field.value?.toString()} onValueChange={(value) => field.onChange(parseInt(value))}>
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

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="exciterType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Exciter Type</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} className="form-input" placeholder="Enter exciter type" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="serialNr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Serial Number</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} className="form-input" placeholder="Enter serial number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
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
                <FormField
                  control={editForm.control}
                  name="commissionDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Commission Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          value={field.value ? (field.value instanceof Date ? field.value.toISOString().split('T')[0] : new Date(field.value).toISOString().split('T')[0]) : ""}
                          onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                          className="form-input"
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
                  {updateMutation.isPending ? "Updating..." : "Update Slot"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}