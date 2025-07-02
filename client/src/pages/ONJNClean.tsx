import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Edit, Trash2, Bell } from "lucide-react";
import { insertOnjnReportSchema } from "@shared/schema";
import type { InsertOnjnReport } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { GroupedSerialNumbers } from "@/components/GroupedSerialNumbers";
import { AttachmentButton } from "@/components/ui/attachment-button";
import { BulkOperations } from "@/components/ui/bulk-operations";
import { Checkbox } from "@/components/ui/checkbox";

// Notification types for ONJN Central
const ONJN_CENTRAL_NOTIFICATION_TYPES = [
  "New Commission",
  "Sales Notification",
  "Buy Notification", 
  "Jackpot List",
  "Change Location",
  "Software Update",
  "Offline",
  "Autoexcluded clients",
  "Remove Authorization",
  "Legal Notification"
];

// Notification types for ONJN Local
const ONJN_LOCAL_NOTIFICATION_TYPES = [
  "Obtaining Authorization",
  "Change of Location", 
  "Remove from Location"
];

export default function ONJNClean() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isNotificationDialogOpen, setIsNotificationDialogOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<any>(null);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [notificationAuthority, setNotificationAuthority] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const limit = 10;

  // Fetch ONJN reports
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/onjn-reports', currentPage, limit, searchTerm],
    queryFn: async () => {
      const response = await fetch(`/api/onjn-reports?page=${currentPage}&limit=${limit}&search=${encodeURIComponent(searchTerm)}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch ONJN reports');
      return response.json();
    },
  });

  // Fetch companies
  const { data: companies } = useQuery({
    queryKey: ['/api/companies'],
    queryFn: async () => {
      const response = await fetch('/api/companies', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch companies');
      return response.json();
    },
  });

  // Fetch locations
  const { data: locations } = useQuery({
    queryKey: ['/api/locations'],
    queryFn: async () => {
      const response = await fetch('/api/locations', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch locations');
      return response.json();
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: InsertOnjnReport) => {
      return await apiRequest("POST", "/api/onjn-reports", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/onjn-reports'] });
      setIsCreateDialogOpen(false);
      setIsNotificationDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "ONJN report created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create ONJN report. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertOnjnReport> }) => {
      return await apiRequest("PUT", `/api/onjn-reports/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/onjn-reports'] });
      setIsEditDialogOpen(false);
      editForm.reset();
      toast({
        title: "Success",
        description: "ONJN report updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update ONJN report. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/onjn-reports/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/onjn-reports'] });
      toast({
        title: "Success",
        description: "ONJN report deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete ONJN report. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      return await apiRequest("POST", '/api/onjn-reports/bulk-delete', { ids });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/onjn-reports'] });
      setSelectedItems(new Set());
      toast({
        title: "Success",
        description: "Selected ONJN reports deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete selected ONJN reports. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Search handler
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Bulk operations handlers
  const handleSelectAll = () => {
    if (selectedItems.size === data?.onjnReports?.length) {
      setSelectedItems(new Set());
    } else {
      const allIds = data?.onjnReports?.map((item: any) => item.id) || [];
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
    if (window.confirm(`Are you sure you want to delete ${selectedItems.size} ONJN reports?`)) {
      bulkDeleteMutation.mutate(Array.from(selectedItems));
    }
  };

  const handleBulkEdit = () => {
    toast({
      title: "Bulk Edit",
      description: "Bulk edit functionality will be implemented soon.",
    });
  };

  // Forms
  const form = useForm<InsertOnjnReport>({
    resolver: zodResolver(insertOnjnReportSchema),
    defaultValues: {
      type: "license_commission",
      commissionType: "license_commission",
      serialNumbers: "",
      status: "draft",
      notes: "",
    },
  });

  const editForm = useForm<InsertOnjnReport>({
    resolver: zodResolver(insertOnjnReportSchema),
    defaultValues: {
      type: "license_commission",
      commissionType: "license_commission",
      serialNumbers: "",
      status: "draft",
      notes: "",
    },
  });

  // Notification Form
  const notificationForm = useForm<InsertOnjnReport>({
    resolver: zodResolver(insertOnjnReportSchema),
    defaultValues: {
      type: "notification",
      commissionType: "",
      serialNumbers: "",
      status: "draft",
      notes: "",
    },
  });

  const handleEdit = (report: any) => {
    setEditingReport(report);
    editForm.reset({
      type: report.type || "license_commission",
      commissionType: report.commissionType || "license_commission",
      serialNumbers: report.serialNumbers || "",
      companyId: report.companyId,
      commissionDate: report.commissionDate ? new Date(report.commissionDate) : undefined,
      submissionDate: report.submissionDate ? new Date(report.submissionDate) : undefined,
      status: report.status || "draft",
      notes: report.notes || "",
    });
    setIsEditDialogOpen(true);
  };

  const onSubmit = (data: InsertOnjnReport) => {
    createMutation.mutate(data);
  };

  const onEditSubmit = (data: InsertOnjnReport) => {
    if (editingReport) {
      updateMutation.mutate({ id: editingReport.id, data });
    }
  };

  // Notification Create Mutation
  const notificationCreateMutation = useMutation({
    mutationFn: async (data: InsertOnjnReport) => {
      const notificationData = {
        ...data,
        type: "notification",
        locationIds: selectedLocations.join(',')
      };
      return await apiRequest("POST", "/api/onjn-reports", notificationData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/onjn-reports'] });
      setIsNotificationDialogOpen(false);
      setSelectedLocations([]);
      setNotificationAuthority("");
      notificationForm.reset();
      toast({
        title: "Success",
        description: "ONJN notification created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create ONJN notification. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onNotificationSubmit = (data: InsertOnjnReport) => {
    notificationCreateMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">ONJN</h1>
          <p className="text-slate-400">Romanian gambling authority compliance</p>
        </div>
        <div className="flex items-center gap-2">
          <Button className="bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-500 text-white font-medium px-4 py-2 rounded-lg">
            Export
          </Button>
          <Dialog open={isNotificationDialogOpen} onOpenChange={setIsNotificationDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-500 text-white font-medium px-4 py-2 rounded-lg">
                <Bell className="mr-2 h-4 w-4" />
                New Notification
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-white/10 max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-white">Add ONJN Notification</DialogTitle>
              </DialogHeader>
              <Form {...notificationForm}>
                <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-6">
                  {/* Authority Selection */}
                  <FormField
                    control={notificationForm.control}
                    name="commissionType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Authority</FormLabel>
                        <Select value={field.value || ""} onValueChange={(value) => {
                          field.onChange(value);
                          setNotificationAuthority(value);
                        }}>
                          <FormControl>
                            <SelectTrigger className="glass-card border-white/20 text-white">
                              <SelectValue placeholder="Select Authority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="glass-card border-white/10">
                            <SelectItem value="central">ONJN Central</SelectItem>
                            <SelectItem value="local">ONJN Local</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Notification Type */}
                  {notificationAuthority && (
                    <FormField
                      control={notificationForm.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Notification Type</FormLabel>
                          <Select value={field.value || ""} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="glass-card border-white/20 text-white">
                                <SelectValue placeholder="Select notification type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="glass-card border-white/10">
                              {notificationAuthority === "central" ? 
                                ONJN_CENTRAL_NOTIFICATION_TYPES.map((type) => (
                                  <SelectItem key={type} value={type.toLowerCase().replace(/\s+/g, '_')}>
                                    {type}
                                  </SelectItem>
                                )) :
                                ONJN_LOCAL_NOTIFICATION_TYPES.map((type) => (
                                  <SelectItem key={type} value={type.toLowerCase().replace(/\s+/g, '_')}>
                                    {type}
                                  </SelectItem>
                                ))
                              }
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Company Selection */}
                  <FormField
                    control={notificationForm.control}
                    name="companyId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Company</FormLabel>
                        <Select value={field.value?.toString()} onValueChange={(value) => field.onChange(parseInt(value))}>
                          <FormControl>
                            <SelectTrigger className="glass-card border-white/20 text-white">
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

                  {/* Location Selection */}
                  <div className="space-y-2">
                    <FormLabel className="text-white">Locations</FormLabel>
                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto glass-card border-white/10 p-3 rounded-md">
                      {locations?.locations?.map((location: any) => (
                        <label key={location.id} className="flex items-center space-x-2 text-sm text-white">
                          <input
                            type="checkbox"
                            checked={selectedLocations.includes(location.id.toString())}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedLocations([...selectedLocations, location.id.toString()]);
                              } else {
                                setSelectedLocations(selectedLocations.filter(id => id !== location.id.toString()));
                              }
                            }}
                            className="rounded border-white/20"
                          />
                          <span className="truncate">{location.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Commission Date */}
                  <FormField
                    control={notificationForm.control}
                    name="commissionDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Commission Date</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            {...field} 
                            value={field.value ? field.value.toISOString().split('T')[0] : ''}
                            onChange={(e) => field.onChange(new Date(e.target.value))}
                            className="glass-card border-white/20 text-white" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Submission Date */}
                  <FormField
                    control={notificationForm.control}
                    name="submissionDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Submission Date</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            {...field} 
                            value={field.value ? field.value.toISOString().split('T')[0] : ''}
                            onChange={(e) => field.onChange(new Date(e.target.value))}
                            className="glass-card border-white/20 text-white" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Serial Numbers */}
                  <FormField
                    control={notificationForm.control}
                    name="serialNumbers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Serial Numbers</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            value={field.value || ""} 
                            className="glass-card border-white/20 text-white min-h-20" 
                            placeholder="Enter serial numbers separated by spaces or commas" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Notes */}
                  <FormField
                    control={notificationForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Notes</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            value={field.value || ""} 
                            className="glass-card border-white/20 text-white min-h-20" 
                            placeholder="Additional notes and comments" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={notificationForm.control}
                    name="filePath"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">File Path</FormLabel>
                        <FormControl>
                          <Input 
                            className="glass-card border-white/20 text-white"
                            placeholder="Enter file path or upload document"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Status */}
                  <FormField
                    control={notificationForm.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Status</FormLabel>
                        <Select value={field.value || "draft"} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="glass-card border-white/20 text-white">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="glass-card border-white/10">
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="submitted">Submitted</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsNotificationDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={notificationCreateMutation.isPending}>
                      {notificationCreateMutation.isPending ? "Creating..." : "Create Notification"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-500 text-white font-medium px-4 py-2 rounded-lg">
                <Plus className="mr-2 h-4 w-4" />
                Add new
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-white/10 max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-white">Create License Commission</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                            value={field.value ? field.value.toISOString().split('T')[0] : ''}
                            onChange={(e) => field.onChange(new Date(e.target.value))}
                            className="glass-card border-white/20 text-white" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="commissionType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Commission Type</FormLabel>
                        <Select value={field.value || ""} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="glass-card border-white/20 text-white">
                              <SelectValue placeholder="Select commission type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="glass-card border-white/10">
                            <SelectItem value="new_license">New License</SelectItem>
                            <SelectItem value="renewal">Renewal</SelectItem>
                            <SelectItem value="modification">Modification</SelectItem>
                            <SelectItem value="transfer">Transfer</SelectItem>
                            <SelectItem value="cancellation">Cancellation</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="serialNumbers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Serial Numbers</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            value={field.value || ""} 
                            className="glass-card border-white/20 text-white min-h-20" 
                            placeholder="Enter serial numbers separated by spaces or commas" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="filePath"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">File Path</FormLabel>
                        <FormControl>
                          <Input 
                            className="glass-card border-white/20 text-white"
                            placeholder="Enter file path or upload document"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Notes</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            value={field.value || ""} 
                            className="glass-card border-white/20 text-white min-h-20" 
                            placeholder="Additional notes and comments" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="companyId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Company</FormLabel>
                        <Select value={field.value?.toString()} onValueChange={(value) => field.onChange(parseInt(value))}>
                          <FormControl>
                            <SelectTrigger className="glass-card border-white/20 text-white">
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
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Status</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="glass-card border-white/20 text-white">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="glass-card border-white/10">
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
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
                      className="bg-green-600 hover:bg-green-700"
                      disabled={createMutation.isPending}
                    >
                      {createMutation.isPending ? "Creating..." : "Create Commission"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Table */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Search ONJN reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 glass-card border-white/20 text-slate-300"
              />
            </div>
          </div>
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
              Failed to load ONJN reports
            </div>
          ) : !data?.onjnReports?.length ? (
            <div className="text-center py-8 text-slate-400">
              <span className="text-2xl mb-2 block">📋</span>
              No ONJN reports found
            </div>
          ) : (
            <>
              {/* Bulk Operations */}
              {selectedItems.size > 0 && (
                <div className="mb-4">
                  <BulkOperations
                    selectedCount={selectedItems.size}
                    onBulkEdit={handleBulkEdit}
                    onBulkDelete={handleBulkDelete}
                  />
                </div>
              )}
              
              <div className="overflow-x-auto -mx-6">
                <table className="w-full min-w-max">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400 w-16">
                        <Checkbox
                          checked={selectedItems.size === data?.onjnReports?.length && data?.onjnReports?.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">ID</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Commission Date</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Serial Numbers</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Created</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Created By</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Attachments</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.onjnReports.map((report: any, index: number) => (
                      <tr key={report.id} className="table-row border-b border-white/5 hover:bg-blue-500/10">
                        <td className="py-4 px-4">
                          <Checkbox
                            checked={selectedItems.has(report.id)}
                            onCheckedChange={() => handleSelectItem(report.id)}
                          />
                        </td>
                        <td className="py-4 px-4 text-sm font-medium text-white">
                          {(currentPage - 1) * limit + index + 1}
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-300">
                          {report.commissionDate ? new Date(report.commissionDate).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-300">
                          <GroupedSerialNumbers serialNumbers={report.serialNumbers || ''} />
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            report.status === 'approved' ? 'bg-green-500/20 text-green-300' :
                            report.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                            report.status === 'rejected' ? 'bg-red-500/20 text-red-300' :
                            'bg-gray-500/20 text-gray-300'
                          }`}>
                            {report.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-300">
                          {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-300">
                          N/A
                        </td>
                        <td className="py-4 px-4">
                          <AttachmentButton
                            entityType="onjn_report"
                            entityId={report.id}
                          />
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(report)}
                              className="text-slate-400 hover:text-slate-300"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteMutation.mutate(report.id)}
                              className="text-red-400 hover:text-red-300"
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
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="glass-card border-white/10 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Edit License Commission</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
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
                        value={field.value ? field.value.toISOString().split('T')[0] : ''}
                        onChange={(e) => field.onChange(new Date(e.target.value))}
                        className="glass-card border-white/20 text-white" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="commissionType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Commission Type</FormLabel>
                    <Select value={field.value || ""} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="glass-card border-white/20 text-white">
                          <SelectValue placeholder="Select commission type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="glass-card border-white/10">
                        <SelectItem value="new_license">New License</SelectItem>
                        <SelectItem value="renewal">Renewal</SelectItem>
                        <SelectItem value="modification">Modification</SelectItem>
                        <SelectItem value="transfer">Transfer</SelectItem>
                        <SelectItem value="cancellation">Cancellation</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="serialNumbers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Serial Numbers</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        value={field.value || ""} 
                        className="glass-card border-white/20 text-white min-h-20" 
                        placeholder="Enter serial numbers separated by spaces or commas" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="filePath"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">File Path</FormLabel>
                    <FormControl>
                      <Input 
                        className="glass-card border-white/20 text-white"
                        placeholder="Enter file path or upload document"
                        {...field}
                        value={field.value || ""}
                      />
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
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="glass-card border-white/20 text-white">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="glass-card border-white/10">
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        value={field.value || ""} 
                        className="glass-card border-white/20 text-white min-h-20" 
                        placeholder="Additional notes and comments" 
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
                  onClick={() => setIsEditDialogOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-green-600 hover:bg-green-700"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? "Updating..." : "Update Commission"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}