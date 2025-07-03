import { useState } from "react";
import { ImportExportDialog } from "@/components/ui/import-export-dialog";
import { AttachmentButton } from "@/components/ui/attachment-button";
import { ProviderLogo } from "@/components/ui/provider-logo";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSlotSchema, type InsertSlot } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Upload, Plus, Search } from "lucide-react";
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
  const { toast } = useToast();
  const limit = 10;

  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/slots', currentPage, limit, searchTerm],
    queryFn: async () => {
      const searchParam = searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : '';
      const response = await apiRequest('GET', `/api/slots?page=${currentPage}&limit=${limit}${searchParam}`);
      return response.json();
    },
  });

  const { data: cabinets } = useQuery({
    queryKey: ['/api/cabinets', 1, 100],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/cabinets?page=1&limit=100');
      return response.json();
    },
  });

  const { data: gameMixes } = useQuery({
    queryKey: ['/api/game-mixes', 1, 100],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/game-mixes?page=1&limit=100');
      return response.json();
    },
  });

  const { data: providers } = useQuery({
    queryKey: ['/api/providers', 1, 100],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/providers?page=1&limit=100');
      return response.json();
    },
  });

  const { data: invoices } = useQuery({
    queryKey: ['/api/invoices', 1, 1000],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/invoices?page=1&limit=1000');
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
    mutationFn: ({ id, data }: { id: number; data: InsertSlot }) =>
      apiRequest("PUT", `/api/slots/${id}`, data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Slot updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/slots"] });
      setIsEditDialogOpen(false);
      setEditingSlot(null);
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
    mutationFn: (id: number) => apiRequest("DELETE", `/api/slots/${id}`),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Slot deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/slots"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete slot",
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
      denomination: "",
      maxBet: "",
      rtp: "",
      year: undefined,
      gamingPlaces: undefined,
      dailyRevenue: "",
      commissionDate: undefined,
      invoiceId: undefined,
      locationId: undefined,
      isActive: true,
    },
  });

  const editForm = useForm<InsertSlot>({
    resolver: zodResolver(insertSlotSchema),
    defaultValues: {
      exciterType: "",
      propertyType: "property",
      serialNr: "",
      denomination: "",
      maxBet: "",
      rtp: "",
      year: undefined,
      gamingPlaces: undefined,
      dailyRevenue: "",
      commissionDate: undefined,
      invoiceId: undefined,
      locationId: undefined,
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

  const getFilteredCabinets = (selectedProviderId: number | null) => {
    if (!selectedProviderId || !cabinets?.cabinets) return [];
    return cabinets.cabinets.filter((cabinet: any) => cabinet.providerId === selectedProviderId);
  };

  const getFilteredGameMixes = (selectedProviderId: number | null) => {
    if (!selectedProviderId || !gameMixes?.gameMixes) return [];
    return gameMixes.gameMixes.filter((gameMix: any) => gameMix.providerId === selectedProviderId);
  };

  // Function to find invoice by serial number
  const findInvoiceBySerialNumber = (serialNumber: string) => {
    if (!invoices?.invoices) return null;
    return Array.isArray(invoices.invoices) ? invoices.invoices.find((invoice: any) => {
      return invoice.serialNumbers && invoice.serialNumbers.includes(serialNumber);
    }) : null;
  };

  // Function to handle serial number change and auto-fill invoice
  const handleSerialNumberChange = (serialNumber: string, isEdit = false) => {
    const invoice = findInvoiceBySerialNumber(serialNumber);
    if (invoice) {
      if (isEdit) {
        editForm.setValue('invoiceId', invoice.id);
      } else {
        form.setValue('invoiceId', invoice.id);
      }
    }
  };

  const handleProviderChange = (providerId: string, isEdit = false) => {
    const numericProviderId = parseInt(providerId);
    
    if (isEdit) {
      setSelectedProviderIdForEdit(numericProviderId);
      editForm.setValue('cabinetId', undefined);
      editForm.setValue('gameMixId', undefined);
    } else {
      setSelectedProviderIdForCreate(numericProviderId);
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
      locationId: slot.locationId || undefined,
      exciterType: slot.exciterType || "",
      propertyType: slot.propertyType || "property",
      serialNr: slot.serialNr || "",
      denomination: slot.denomination || "",
      maxBet: slot.maxBet || "",
      rtp: slot.rtp || "",
      year: slot.year || undefined,
      gamingPlaces: slot.gamingPlaces || undefined,
      dailyRevenue: slot.dailyRevenue || "",
      commissionDate: slot.commissionDate ? new Date(slot.commissionDate) : undefined,
      isActive: slot.isActive !== undefined ? slot.isActive : true,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this slot?")) {
      deleteMutation.mutate(id);
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
    
    toast({
      title: "Bulk Delete",
      description: `Deleting ${selectedSlots.length} slots`,
      variant: "destructive",
    });
  };

  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  return (
    <div className="space-y-4 w-full max-w-none">
      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BulkOperations 
            selectedCount={selectedSlots.length}
            onBulkEdit={handleBulkEdit}
            onBulkDelete={handleBulkDelete}
          />
        </div>
        <div className="text-sm text-slate-400">
          {selectedSlots.length > 0 && (
            <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full">
              {selectedSlots.length} selected
            </span>
          )}
        </div>
      </div>

      {/* Title and Total - SUS */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold heading-gradient">Slots</h2>
          <p className="text-slate-400 mt-1">Slot machine and gaming device management</p>
        </div>
        <div className="text-sm text-slate-400">
          {data?.total || 0} total slots
        </div>
      </div>

      {/* Search Bar and Actions - SUS */}
      <div className="search-card">
        <div className="flex items-center justify-between w-full">
          <div className="relative" style={{ width: '10cm' }}>
            <Input
              type="text"
              placeholder="Search slots by name, cabinet, or game mix..."
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
              Add Slot
            </Button>
            <ImportExportDialog module="slots" moduleName="Slots">
              <Button className="px-4 py-2 rounded-lg h-10 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0">
                Import/Export
              </Button>
            </ImportExportDialog>
          </div>
        </div>
      </div>

      {/* Enhanced Slots Table */}
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
            <h3 className="text-xl font-semibold text-white mb-2">Failed to load slots</h3>
            <p>Please try refreshing the page or check your connection.</p>
          </div>
        ) : !data?.slots?.length ? (
          <div className="empty-state-container">
            <div className="text-6xl mb-4">🎰</div>
            <h3 className="text-xl font-semibold text-white mb-2">No slot machines found</h3>
            <p>Get started by adding your first slot machine.</p>
          </div>
        ) : (
          <>
            <div className="enhanced-table-wrapper">
              <table className="enhanced-table">
                <thead>
                  <tr>
                    <th className="w-12">
                      <Checkbox
                        checked={selectedSlots.length === data?.slots.length && data?.slots.length > 0}
                        onCheckedChange={handleSelectAll}
                        className="border-white/30"
                      />
                    </th>
                    <th className="w-16">#</th>
                    <th>Machine</th>
                    <th>Provider</th>
                    <th>Cabinet</th>
                    <th>Location</th>
                    <th>Game Mix</th>
                    <th>Financial</th>
                    <th>Technical</th>
                    <th>Property</th>
                    <th>Status</th>
                    <th>Attachments</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.slots.map((slot: any, index: number) => (
                    <tr key={slot.id}>
                      <td>
                        <Checkbox
                          checked={selectedSlots.includes(slot.id)}
                          onCheckedChange={() => handleSelectSlot(slot.id)}
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
                          <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                            <span className="text-purple-400 text-lg">🎰</span>
                          </div>
                          <div>
                            <div className="table-cell-primary">{slot.serialNr || 'No serial'}</div>
                            <div className="table-cell-secondary">Slot #{slot.id}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-3">
                          {slot.providerId && (
                            <ProviderLogo providerId={slot.providerId} size="lg" />
                          )}
                          <div>
                            <div className="table-cell-primary">
                              {Array.isArray(providers?.providers) ? providers.providers.find((p: any) => p.id === slot.providerId)?.name || 'No provider' : 'No provider'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="table-cell-primary">
                          {Array.isArray(cabinets?.cabinets) ? cabinets.cabinets.find((c: any) => c.id === slot.cabinetId)?.model || 'No cabinet' : 'No cabinet'}
                        </div>
                      </td>
                      <td>
                        <div className="table-cell-primary">
                          {Array.isArray(locations?.locations) ? locations.locations.find((l: any) => l.id === slot.locationId)?.name || 'No location' : 'No location'}
                        </div>
                      </td>
                      <td>
                        <div className="table-cell-primary">
                          {Array.isArray(gameMixes?.gameMixes) ? gameMixes.gameMixes.find((g: any) => g.id === slot.gameMixId)?.name || 'No game mix' : 'No game mix'}
                        </div>
                      </td>
                      <td>
                        <div className="space-y-1">
                          <div className="table-cell-secondary text-xs">
                            Denom: {slot.denomination ? `€${slot.denomination}` : 'N/A'}
                          </div>
                          <div className="table-cell-secondary text-xs">
                            Max Bet: {slot.maxBet ? `€${slot.maxBet}` : 'N/A'}
                          </div>
                          <div className="table-cell-secondary text-xs">
                            RTP: {slot.rtp ? `${slot.rtp}%` : 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="space-y-1">
                          <div className="table-cell-secondary text-xs">
                            Year: {slot.year || 'N/A'}
                          </div>
                          <div className="table-cell-secondary text-xs">
                            Places: {slot.gamingPlaces || 'N/A'}
                          </div>
                          <div className="table-cell-secondary text-xs">
                            Daily: {slot.dailyRevenue ? `€${slot.dailyRevenue}` : 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${getPropertyTypeColor(slot.propertyType)}`}>
                          {slot.propertyType || 'property'}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${slot.isActive ? 'status-active' : 'status-inactive'}`}>
                          {slot.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <AttachmentButton 
                          entityType="slots" 
                          entityId={slot.id}
                        />
                      </td>
                      <td>
                        <div className="action-button-group justify-end">
                          <button 
                            className="action-button text-amber-500 hover:text-amber-400"
                            onClick={() => handleEdit(slot)}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            className="action-button text-red-500 hover:text-red-400"
                            onClick={() => handleDelete(slot.id)}
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
      {data?.slots?.length > 0 && (
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

      {/* Create Slot Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="glass-dialog dialog-lg">
          <DialogHeader>
            <DialogTitle className="text-white">Create New Slot Machine</DialogTitle>
            <DialogDescription className="text-slate-400">
              Add a new slot machine to the system with provider, cabinet, and game mix information.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="providerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Provider</FormLabel>
                    <Select value={field.value?.toString() ?? ""} onValueChange={(value) => {
                      field.onChange(parseInt(value));
                      handleProviderChange(value, false);
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

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="cabinetId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Cabinet</FormLabel>
                      <Select 
                        value={field.value?.toString() ?? ""} 
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        disabled={!selectedProviderIdForCreate}
                      >
                        <FormControl>
                          <SelectTrigger className="form-input">
                            <SelectValue placeholder="Select cabinet" />
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
                        value={field.value?.toString() ?? ""} 
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        disabled={!selectedProviderIdForCreate}
                      >
                        <FormControl>
                          <SelectTrigger className="form-input">
                            <SelectValue placeholder="Select game mix" />
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
                <FormField
                  control={form.control}
                  name="locationId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Location</FormLabel>
                      <Select 
                        value={field.value?.toString() ?? ""} 
                        onValueChange={(value) => field.onChange(parseInt(value))}
                      >
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

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="serialNr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Serial Number</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          value={field.value || ""} 
                          className="form-input" 
                          placeholder="Enter serial number"
                          onChange={(e) => {
                            field.onChange(e);
                            handleSerialNumberChange(e.target.value, false);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="invoiceId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Invoice Number</FormLabel>
                      <Select 
                        value={field.value?.toString() ?? ""} 
                        onValueChange={(value) => field.onChange(parseInt(value))}
                      >
                        <FormControl>
                          <SelectTrigger className="form-input">
                            <SelectValue placeholder="Auto-filled from serial number" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="glass-card border-white/10">
                          {invoices?.invoices?.map((invoice: any) => (
                            <SelectItem key={invoice.id} value={invoice.id.toString()}>
                              {invoice.invoiceNumber}
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
              </div>

              <div className="grid grid-1 gap-4">
                <FormField
                  control={form.control}
                  name="propertyType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Property Type</FormLabel>
                      <Select value={field.value?.toString() ?? ""} onValueChange={field.onChange}>
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

              {/* Financial Fields */}
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="denomination"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Denomination</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          value={field.value || ""} 
                          className="form-input" 
                          placeholder="0.00" 
                          type="number"
                          step="0.01"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="maxBet"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Max Bet</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          value={field.value || ""} 
                          className="form-input" 
                          placeholder="0.00" 
                          type="number"
                          step="0.01"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="rtp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">RTP (%)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          value={field.value || ""} 
                          className="form-input" 
                          placeholder="0.00" 
                          type="number"
                          step="0.01"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Technical Fields */}
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Year of Manufacture</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          value={field.value || ""} 
                          className="form-input" 
                          placeholder="2024" 
                          type="number"
                          min="1900"
                          max="2030"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gamingPlaces"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Gaming Places</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          value={field.value || ""} 
                          className="form-input" 
                          placeholder="1" 
                          type="number"
                          min="1"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dailyRevenue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Daily Revenue</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          value={field.value || ""} 
                          className="form-input" 
                          placeholder="0.00" 
                          type="number"
                          step="0.01"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Commission Date */}
              <FormField
                control={form.control}
                name="commissionDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Commission Date</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        value={field.value ? new Date(field.value).toISOString().split('T')[0] : ""} 
                        className="form-input" 
                        type="date"
                      />
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
                  {createMutation.isPending ? "Creating..." : "Create Slot"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Slot Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="glass-dialog dialog-lg">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Slot Machine</DialogTitle>
            <DialogDescription className="text-slate-400">
              Update the slot machine information and details.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="providerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Provider</FormLabel>
                    <Select value={field.value?.toString() ?? ""} onValueChange={(value) => {
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

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={editForm.control}
                  name="cabinetId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Cabinet</FormLabel>
                      <Select 
                        value={field.value?.toString() ?? ""} 
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
                        value={field.value?.toString() ?? ""} 
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
                <FormField
                  control={editForm.control}
                  name="locationId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Location</FormLabel>
                      <Select 
                        value={field.value?.toString() ?? ""} 
                        onValueChange={(value) => field.onChange(parseInt(value))}
                      >
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

              <div className="grid grid-3 gap-4">
                <FormField
                  control={editForm.control}
                  name="serialNr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Serial Number</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          value={field.value || ""} 
                          className="form-input" 
                          placeholder="Enter serial number"
                          onChange={(e) => {
                            field.onChange(e);
                            handleSerialNumberChange(e.target.value, true);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="invoiceId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Invoice Number</FormLabel>
                      <Select 
                        value={field.value?.toString() ?? ""} 
                        onValueChange={(value) => field.onChange(parseInt(value))}
                      >
                        <FormControl>
                          <SelectTrigger className="form-input">
                            <SelectValue placeholder="Auto-filled from serial number" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="glass-card border-white/10">
                          {invoices?.invoices?.map((invoice: any) => (
                            <SelectItem key={invoice.id} value={invoice.id.toString()}>
                              {invoice.invoiceNumber}
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
              </div>

              <div className="grid grid-1 gap-4">
                <FormField
                  control={editForm.control}
                  name="propertyType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Property Type</FormLabel>
                      <Select value={field.value?.toString() ?? ""} onValueChange={field.onChange}>
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

              {/* Financial Fields */}
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={editForm.control}
                  name="denomination"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Denomination</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          value={field.value || ""} 
                          className="form-input" 
                          placeholder="0.00" 
                          type="number"
                          step="0.01"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="maxBet"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Max Bet</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          value={field.value || ""} 
                          className="form-input" 
                          placeholder="0.00" 
                          type="number"
                          step="0.01"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="rtp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">RTP (%)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          value={field.value || ""} 
                          className="form-input" 
                          placeholder="0.00" 
                          type="number"
                          step="0.01"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Technical Fields */}
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={editForm.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Year of Manufacture</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          value={field.value || ""} 
                          className="form-input" 
                          placeholder="2024" 
                          type="number"
                          min="1900"
                          max="2030"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="gamingPlaces"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Gaming Places</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          value={field.value || ""} 
                          className="form-input" 
                          placeholder="1" 
                          type="number"
                          min="1"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="dailyRevenue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Daily Revenue</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          value={field.value || ""} 
                          className="form-input" 
                          placeholder="0.00" 
                          type="number"
                          step="0.01"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Commission Date */}
              <FormField
                control={editForm.control}
                name="commissionDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Commission Date</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        value={field.value ? new Date(field.value).toISOString().split('T')[0] : ""} 
                        className="form-input" 
                        type="date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)} className="border-white/20 text-white hover:bg-white/10">
                  Cancel
                </Button>
                <Button type="submit" className="floating-action text-white" disabled={updateMutation.isPending}>
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