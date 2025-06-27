import { useState } from "react";
import { ImportExportDialog } from "@/components/ui/import-export-dialog";
import { AttachmentButton } from "@/components/ui/attachment-button";
import { ProviderLogo } from "@/components/ui/provider-logo";
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
import { Edit, Trash2, Upload, Calendar, Plus, Search } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { BulkOperations } from "@/components/ui/bulk-operations";
import { safeFormValue } from "@/utils/formUtils";

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

export default function Slots() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<any>(null);
  const [selectedSlots, setSelectedSlots] = useState<number[]>([]);
  const [selectedProviderIdForCreate, setSelectedProviderIdForCreate] = useState<number | null>(null);
  const [selectedProviderIdForEdit, setSelectedProviderIdForEdit] = useState<number | null>(null);
  const [sortField, setSortField] = useState<string>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const { toast } = useToast();
  const limit = 10;

  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/slots', currentPage, limit, searchTerm, sortField, sortDirection],
    queryFn: async () => {
      const searchParam = searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : '';
      const url = `/api/slots?page=${currentPage}&limit=${limit}${searchParam}&sortField=${sortField}&sortDirection=${sortDirection}`;
      console.log('Fetching slots with URL:', url);
      const response = await fetch(url, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch slots');
      const result = await response.json();
      console.log('Slots API response:', result);
      return result;
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
    // Convert Date object to ISO string for server compatibility
    const formattedData = {
      ...data,
      commissionDate: data.commissionDate instanceof Date ? data.commissionDate.toISOString() : data.commissionDate
    } as any;
    createMutation.mutate(formattedData);
  };

  const onEditSubmit = (data: InsertSlot) => {
    if (editingSlot) {
      // Convert Date object to ISO string for server compatibility
      const formattedData = {
        ...data,
        commissionDate: data.commissionDate instanceof Date ? data.commissionDate.toISOString() : data.commissionDate
      } as Partial<InsertSlot>;
      console.log("Form data being sent:", formattedData);
      updateMutation.mutate({ id: editingSlot.id, data: formattedData });
    }
  };

  // Filter cabinets and game mixes based on selected provider
  const getFilteredCabinets = (selectedProviderId: number | null) => {
    if (!selectedProviderId || !cabinets?.cabinets) return [];
    return cabinets.cabinets.filter((cabinet: any) => cabinet.providerId === selectedProviderId);
  };

  const getFilteredGameMixes = (selectedProviderId: number | null) => {
    if (!selectedProviderId || !gameMixes?.gameMixes) return [];
    return gameMixes.gameMixes.filter((gameMix: any) => gameMix.providerId === selectedProviderId);
  };

  const handleProviderChange = (providerId: string, isEdit = false) => {
    const numericProviderId = parseInt(providerId);
    
    if (isEdit) {
      setSelectedProviderIdForEdit(numericProviderId);
      // Reset cabinet and game mix when provider changes
      editForm.setValue('cabinetId', undefined);
      editForm.setValue('gameMixId', undefined);
    } else {
      setSelectedProviderIdForCreate(numericProviderId);
      // Reset cabinet and game mix when provider changes
      form.setValue('cabinetId', undefined);
      form.setValue('gameMixId', undefined);
    }
  };

  const handleEdit = (slot: any) => {
    setEditingSlot(slot);
    setSelectedProviderIdForEdit(slot.providerId || null);
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
      year: slot.year || "",
      gamingPlaces: slot.gamingPlaces || "",
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
    console.log('Search input changed:', e.target.value);
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
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
      {/* Enhanced Search Interface */}
      <Card className="search-card">
        <CardContent className="p-6">
          <div className="search-header">
            <div className="search-icon-section">
              <div className="search-icon-wrapper">
                <span className="search-icon">🎰</span>
              </div>
              <div>
                <h3 className="search-title">Slot Machines</h3>
                <p className="search-subtitle">Gaming equipment and machine management</p>
              </div>
            </div>
          </div>
          <div className="search-input-wrapper">
            <Search className="search-input-icon" />
            <Input
              type="text"
              placeholder="Search slots by serial number, provider, cabinet model, or game mix..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions and Bulk Operations */}
      <div className="flex items-center justify-between">
        {selectedSlots.length > 0 ? (
          <BulkOperations 
            selectedCount={selectedSlots.length}
            onBulkEdit={handleBulkEdit}
            onBulkDelete={handleBulkDelete}
          />
        ) : (
          <div></div>
        )}
        <div className="flex items-center gap-2">
          <ImportExportDialog module="slots" moduleName="Slots">
            <Button className="btn-secondary">
              <Upload className="h-4 w-4 mr-2" />
              Import/Export
            </Button>
          </ImportExportDialog>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-primary">
                <Plus className="h-4 w-4 mr-2" />
                Add Slot
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-dialog dialog-xl">
              <DialogHeader>
                <DialogTitle className="text-white flex items-center gap-2">
                  <span className="text-xl">🎰</span>
                  Create New Slot Machine
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="providerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Provider</FormLabel>
                        <Select value={field.value?.toString()} onValueChange={(value) => {
                          field.onChange(parseInt(value));
                          handleProviderChange(value, false);
                        }}>
                          <FormControl>
                            <SelectTrigger className="form-input">
                              <SelectValue placeholder="Select provider first" />
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

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="cabinetId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Cabinet</FormLabel>
                          <Select 
                            value={field.value?.toString()} 
                            onValueChange={(value) => field.onChange(parseInt(value))}
                            disabled={!selectedProviderIdForCreate}
                          >
                            <FormControl>
                              <SelectTrigger className="form-input">
                                <SelectValue placeholder={selectedProviderIdForCreate ? "Select cabinet" : "Select provider first"} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="glass-card border-white/10">
                              {getFilteredCabinets(selectedProviderIdForCreate)?.map((cabinet: any) => (
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
                          <Select 
                            value={field.value?.toString()} 
                            onValueChange={(value) => field.onChange(parseInt(value))}
                            disabled={!selectedProviderIdForCreate}
                          >
                            <FormControl>
                              <SelectTrigger className="form-input">
                                <SelectValue placeholder={selectedProviderIdForCreate ? "Select game mix" : "Select provider first"} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="glass-card border-white/10">
                              {getFilteredGameMixes(selectedProviderIdForCreate)?.map((gameMix: any) => (
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

                  <div className="grid grid-cols-3 gap-4">
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
                    <FormField
                      control={form.control}
                      name="exciterType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Exciter Type</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ""} className="form-input" placeholder="Exciter type" />
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
                      {createMutation.isPending ? "Creating..." : "Create Slot"}
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
            <span>🎰</span>
            Slot Machines
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
              <p className="empty-state-title">Failed to load slots</p>
              <p className="empty-state-description">There was an error loading the slot machines</p>
            </div>
          ) : !data?.slots?.length ? (
            <div className="empty-state">
              <span className="empty-state-icon">🎰</span>
              <p className="empty-state-title">No slot machines found</p>
              <p className="empty-state-description">Add your first slot machine to get started</p>
            </div>
          ) : (
            <>
              <div className="table-container">
                <table className="enhanced-table">
                  <thead>
                    <tr>
                      <th className="w-12">
                        <Checkbox
                          checked={selectedSlots.length === data?.slots.length && data?.slots.length > 0}
                          onCheckedChange={handleSelectAll}
                          className="checkbox-custom"
                        />
                      </th>
                      <th>Machine</th>
                      <th>Provider</th>
                      <th>Cabinet</th>
                      <th>Game Mix</th>
                      <th>Property</th>
                      <th>Status</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.slots.map((slot: any) => (
                      <tr key={slot.id} className="table-row">
                        <td>
                          <Checkbox
                            checked={selectedSlots.includes(slot.id)}
                            onCheckedChange={() => handleSelectSlot(slot.id)}
                            className="checkbox-custom"
                          />
                        </td>
                        <td>
                          <div className="flex items-center space-x-3">
                            <div className="entity-avatar bg-purple-500/20">
                              <span className="text-purple-400">🎰</span>
                            </div>
                            <div>
                              <p className="entity-title">{slot.serialNr || 'No serial'}</p>
                              <p className="entity-subtitle">Slot #{slot.id}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            {slot.providerId && <ProviderLogo providerId={slot.providerId} size="sm" />}
                            <span className="text-slate-300 text-sm">
                              {providers?.providers?.find((p: any) => p.id === slot.providerId)?.name || 'No provider'}
                            </span>
                          </div>
                        </td>
                        <td className="text-slate-300 text-sm">
                          {cabinets?.cabinets?.find((c: any) => c.id === slot.cabinetId)?.model || 'No cabinet'}
                        </td>
                        <td className="text-slate-300 text-sm">
                          {gameMixes?.gameMixes?.find((g: any) => g.id === slot.gameMixId)?.name || 'No game mix'}
                        </td>
                        <td>
                          <Badge className={getPropertyTypeColor(slot.propertyType)}>
                            {slot.propertyType || 'property'}
                          </Badge>
                        </td>
                        <td>
                          <Badge className={slot.isActive ? 'status-active' : 'status-inactive'}>
                            {slot.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleEdit(slot)}
                              className="action-button action-button-edit"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleDelete(slot.id)}
                              className="action-button action-button-delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                            <AttachmentButton
                              entityType="slots"
                              entityId={slot.id}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Enhanced Pagination */}
              <div className="pagination">
                <div className="pagination-info">
                  Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, data.total)} of {data.total} slots
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
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog - Similar structure to create dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="glass-dialog dialog-xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <span className="text-xl">🎰</span>
              Edit Slot Machine
            </DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="providerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Provider</FormLabel>
                    <Select value={field.value?.toString()} onValueChange={(value) => {
                      field.onChange(parseInt(value));
                      handleProviderChange(value, true);
                    }}>
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

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="cabinetId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Cabinet</FormLabel>
                      <Select 
                        value={field.value?.toString()} 
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        disabled={!selectedProviderIdForEdit}
                      >
                        <FormControl>
                          <SelectTrigger className="form-input">
                            <SelectValue placeholder="Select cabinet" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="glass-card border-white/10">
                          {getFilteredCabinets(selectedProviderIdForEdit)?.map((cabinet: any) => (
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
                      <Select 
                        value={field.value?.toString()} 
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        disabled={!selectedProviderIdForEdit}
                      >
                        <FormControl>
                          <SelectTrigger className="form-input">
                            <SelectValue placeholder="Select game mix" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="glass-card border-white/10">
                          {getFilteredGameMixes(selectedProviderIdForEdit)?.map((gameMix: any) => (
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

              <div className="grid grid-cols-3 gap-4">
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
                <FormField
                  control={editForm.control}
                  name="exciterType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Exciter Type</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} className="form-input" placeholder="Exciter type" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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