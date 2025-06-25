import { useState } from "react";
import { ImportExportDialog } from "@/components/ui/import-export-dialog";
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
import { Upload, Edit, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { BulkOperations } from "@/components/ui/bulk-operations";
import { AttachmentButton } from "@/components/ui/attachment-button";

// Utility function for property type colors
const getPropertyTypeColor = (propertyType: string) => {
  switch (propertyType?.toLowerCase()) {
    case 'owned':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300';
    case 'rented':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'leased':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
    case 'contracted':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
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

  const { data: invoices } = useQuery({
    queryKey: ['/api/invoices', 1, 100],
    queryFn: async () => {
      const response = await fetch('/api/invoices?page=1&limit=100', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch invoices');
      return response.json();
    },
  });

  const { data: onjnReports } = useQuery({
    queryKey: ['/api/onjn-reports', 1, 100],
    queryFn: async () => {
      const response = await fetch('/api/onjn-reports?page=1&limit=100', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch ONJN reports');
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

  const form = useForm<InsertSlot>({
    resolver: zodResolver(insertSlotSchema),
    defaultValues: {
      slotNumber: 1,
      gameName: "",
      gameType: "",
      propertyType: "property",
      isActive: true,
    },
  });

  const editForm = useForm<InsertSlot>({
    resolver: zodResolver(insertSlotSchema),
    defaultValues: {
      slotNumber: 1,
      gameName: "",
      gameType: "",
      propertyType: "property",
      isActive: true,
    },
  });

  const watchPropertyType = form.watch("propertyType");
  const watchEditPropertyType = editForm.watch("propertyType");

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
      cabinetId: slot.cabinetId,
      gameMixId: slot.gameMixId,
      providerId: slot.providerId,
      slotNumber: slot.slotNumber,
      gameName: slot.gameName || "",
      gameType: slot.gameType || "",
      denomination: slot.denomination,
      maxBet: slot.maxBet,
      rtp: slot.rtp,
      propertyType: slot.propertyType || "property",
      ownerId: slot.ownerId,
      serialNr: slot.serialNr || "",
      invoiceId: slot.invoiceId,
      licenseDate: slot.licenseDate,
      onjnReportId: slot.onjnReportId,
      dailyRevenue: slot.dailyRevenue,
      isActive: slot.isActive,
    });
    setIsEditDialogOpen(true);
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

  const handleDelete = (slotId: number) => {
    if (confirm("Are you sure you want to delete this slot?")) {
      deleteMutation.mutate(slotId);
    }
  };

  const handleBulkDelete = () => {
    if (selectedSlots.length === 0) return;
    
    if (confirm(`Are you sure you want to delete ${selectedSlots.length} slots?`)) {
      selectedSlots.forEach(id => deleteMutation.mutate(id));
      setSelectedSlots([]);
    }
  };

  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'status-active';
      case 'maintenance':
        return 'status-maintenance';
      case 'inactive':
        return 'status-inactive';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

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
                                {cabinet.serialNumber} - {cabinet.model}
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

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="slotNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Slot Number</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            className="form-input" 
                            placeholder="Slot number"
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="gameName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Game Name</FormLabel>
                        <FormControl>
                          <Input {...field} className="form-input" placeholder="Game name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="gameType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Game Type</FormLabel>
                        <FormControl>
                          <Input {...field} className="form-input" placeholder="Game type" />
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
                        <FormLabel className="text-white">Property</FormLabel>
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

                <FormField
                  control={form.control}
                  name="ownerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">
                        {watchPropertyType === "property" ? "Company" : "Provider"}
                      </FormLabel>
                      <Select value={field.value?.toString()} onValueChange={(value) => field.onChange(parseInt(value))}>
                        <FormControl>
                          <SelectTrigger className="form-input">
                            <SelectValue placeholder={`Select ${watchPropertyType === "property" ? "company" : "provider"}`} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="glass-card border-white/10">
                          {watchPropertyType === "property" 
                            ? companies?.companies?.map((company: any) => (
                                <SelectItem key={company.id} value={company.id.toString()}>
                                  {company.name}
                                </SelectItem>
                              ))
                            : providers?.providers?.map((provider: any) => (
                                <SelectItem key={provider.id} value={provider.id.toString()}>
                                  {provider.name}
                                </SelectItem>
                              ))
                          }
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                            type="number" 
                            step="0.01"
                            className="form-input" 
                            placeholder="0.01"
                            onChange={(e) => field.onChange(e.target.value)}
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
                            type="number" 
                            step="0.01"
                            className="form-input" 
                            placeholder="100.00"
                            onChange={(e) => field.onChange(e.target.value)}
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
                            type="number" 
                            step="0.01"
                            className="form-input" 
                            placeholder="96.50"
                            onChange={(e) => field.onChange(e.target.value)}
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
                    name="serialNr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Serial Nr</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            className="form-input" 
                            placeholder="Enter serial number"
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
                        <FormLabel className="text-white">Invoice</FormLabel>
                        <Select value={field.value?.toString()} onValueChange={(value) => field.onChange(parseInt(value))}>
                          <FormControl>
                            <SelectTrigger className="form-input">
                              <SelectValue placeholder="Select invoice" />
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
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="licenseDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">License Date</FormLabel>
                        <FormControl>
                          <Input 
                            type="datetime-local"
                            className="form-input"
                            value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ""}
                            onChange={(e) => field.onChange(e.target.value || null)}
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="onjnReportId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">ONJN Report</FormLabel>
                        <Select value={field.value?.toString()} onValueChange={(value) => field.onChange(parseInt(value))}>
                          <FormControl>
                            <SelectTrigger className="form-input">
                              <SelectValue placeholder="Select ONJN report" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="glass-card border-white/10">
                            {onjnReports?.onjnReports?.map((report: any) => (
                              <SelectItem key={report.id} value={report.id.toString()}>
                                {report.reportType} - {report.reportPeriod}
                              </SelectItem>
                            ))}
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
                                  {cabinet.serialNumber} - {cabinet.model}
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

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
                      name="slotNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Slot Number</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number" 
                              className="form-input" 
                              placeholder="1"
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name="gameName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Game Name</FormLabel>
                          <FormControl>
                            <Input {...field} className="form-input" placeholder="Enter game name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
                      name="gameType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Game Type</FormLabel>
                          <FormControl>
                            <Input {...field} className="form-input" placeholder="Enter game type" />
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

                  <FormField
                    control={editForm.control}
                    name="ownerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">
                          {watchEditPropertyType === "property" ? "Owner Company" : "Rental Provider"}
                        </FormLabel>
                        <Select value={field.value?.toString()} onValueChange={(value) => field.onChange(parseInt(value))}>
                          <FormControl>
                            <SelectTrigger className="form-input">
                              <SelectValue placeholder={`Select ${watchEditPropertyType === "property" ? "company" : "provider"}`} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="glass-card border-white/10">
                            {watchEditPropertyType === "property" 
                              ? companies?.companies?.map((company: any) => (
                                <SelectItem key={company.id} value={company.id.toString()}>
                                  {company.name}
                                </SelectItem>
                              ))
                              : providers?.providers?.map((provider: any) => (
                                <SelectItem key={provider.id} value={provider.id.toString()}>
                                  {provider.name}
                                </SelectItem>
                              ))
                            }
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                              type="number" 
                              step="0.01"
                              className="form-input" 
                              placeholder="0.01"
                              onChange={(e) => field.onChange(e.target.value)}
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
                              type="number" 
                              step="0.01"
                              className="form-input" 
                              placeholder="100.00"
                              onChange={(e) => field.onChange(e.target.value)}
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
                              type="number" 
                              step="0.01"
                              className="form-input" 
                              placeholder="96.50"
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
                      name="serialNr"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Serial Nr</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              className="form-input" 
                              placeholder="Enter serial number"
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
                          <FormLabel className="text-white">Invoice</FormLabel>
                          <Select value={field.value?.toString()} onValueChange={(value) => field.onChange(parseInt(value))}>
                            <FormControl>
                              <SelectTrigger className="form-input">
                                <SelectValue placeholder="Select invoice" />
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
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
                      name="licenseDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">License Date</FormLabel>
                          <FormControl>
                            <Input 
                              type="datetime-local"
                              className="form-input"
                              value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ""}
                              onChange={(e) => field.onChange(e.target.value || null)}
                              onBlur={field.onBlur}
                              name={field.name}
                              ref={field.ref}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name="onjnReportId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">ONJN Report</FormLabel>
                          <Select value={field.value?.toString()} onValueChange={(value) => field.onChange(parseInt(value))}>
                            <FormControl>
                              <SelectTrigger className="form-input">
                                <SelectValue placeholder="Select ONJN report" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="glass-card border-white/10">
                              {onjnReports?.onjnReports?.map((report: any) => (
                                <SelectItem key={report.id} value={report.id.toString()}>
                                  {report.reportType} - {report.reportPeriod}
                                </SelectItem>
                              ))}
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
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 w-12">
                        <Checkbox
                          checked={selectedSlots.length === data?.slots.length && data?.slots.length > 0}
                          onCheckedChange={handleSelectAll}
                          className="border-white/20"
                        />
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Slot</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Game</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Cabinet</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Type</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">RTP</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Serial Nr</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Invoice</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">License Date</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Property</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Revenue (24h)</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.slots.map((slot: any) => (
                      <tr key={slot.id} className="table-row border-b border-white/5 hover:bg-blue-500/10">
                        <td className="py-4 px-4">
                          <Checkbox
                            checked={selectedSlots.includes(slot.id)}
                            onCheckedChange={() => handleSelectSlot(slot.id)}
                            className="border-white/20"
                          />
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                              <span className="text-yellow-500 text-sm">🎰</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">Slot #{slot.slotNumber}</p>
                              <p className="text-xs text-slate-400">ID: {slot.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-300">
                          {slot.gameName || 'No game'}
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-300">
                          {slot.cabinetId ? `Cabinet ${slot.cabinetId}` : 'Unassigned'}
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-300">
                          {slot.gameType || 'N/A'}
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-300">
                          {slot.rtp ? `${Number(slot.rtp)}%` : 'N/A'}
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-300">
                          {slot.serialNr || 'N/A'}
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-300">
                          {slot.invoiceId ? 
                            invoices?.invoices?.find((inv: any) => inv.id === slot.invoiceId)?.invoiceNumber || `Invoice #${slot.invoiceId}` 
                            : 'N/A'
                          }
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-300">
                          {slot.licenseDate ? new Date(slot.licenseDate).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-4 px-4">
                          <Badge className={`${getPropertyTypeColor(slot.propertyType)} border`}>
                            {slot.propertyType}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-sm font-semibold text-emerald-500">
                          €{slot.dailyRevenue ? Number(slot.dailyRevenue).toLocaleString() : '0'}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-400">
                              👁️
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-amber-500 hover:text-amber-400"
                              onClick={() => handleEdit(slot)}
                            >
                              ✏️
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
