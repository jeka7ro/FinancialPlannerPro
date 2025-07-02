import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertOnjnReportSchema, type InsertOnjnReport } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Calendar, FileText, MapPin, Building, Edit, Trash2, Bell, ChevronDown } from "lucide-react";
import { AttachmentButton } from "@/components/ui/attachment-button";
import { LocationsDisplay } from "@/components/LocationsDisplay";
import { MultiLocationSelect } from "@/components/MultiLocationSelect";
import { SerialNumbersDisplay } from "@/components/SerialNumbersDisplay";
import { safeFormValue } from "@/utils/formUtils";

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    case 'approved':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'rejected':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    case 'submitted':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'draft':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
};

const ONJN_LOCAL_NOTIFICATION_TYPES = [
  "Obtaining Authorization",
  "Change of Location", 
  "Remove from Location"
];

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

export default function ONJNEnhanced() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isNotificationDialogOpen, setIsNotificationDialogOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<any>(null);
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

  // Fetch locations for multi-select
  const { data: locationsData } = useQuery({
    queryKey: ['/api/locations'],
    queryFn: async () => {
      const response = await fetch('/api/locations?limit=1000', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch locations');
      return response.json();
    },
  });

  // Fetch companies
  const { data: companiesData } = useQuery({
    queryKey: ['/api/companies'],
    queryFn: async () => {
      const response = await fetch('/api/companies?limit=1000', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch companies');
      return response.json();
    },
  });

  // Fetch existing ONJN reports for commission data selection
  const { data: commissionsData } = useQuery({
    queryKey: ['/api/onjn-reports/commissions'],
    queryFn: async () => {
      const response = await fetch('/api/onjn-reports?type=license_commission&limit=1000', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch commissions');
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
      notificationForm.reset();
      setSelectedLocations([]);
      setNotificationAuthority("");
      toast({
        title: "Success",
        description: "ONJN report created successfully.",
      });
    },
    onError: (error) => {
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
      setEditingReport(null);
      editForm.reset();
      toast({
        title: "Success",
        description: "ONJN report updated successfully.",
      });
    },
    onError: (error) => {
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
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete ONJN report. Please try again.",
        variant: "destructive",
      });
    },
  });

  // License Commission Form
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

  // Notification Form
  const notificationForm = useForm<InsertOnjnReport>({
    resolver: zodResolver(insertOnjnReportSchema),
    defaultValues: {
      type: "notification",
      status: "draft",
      notes: "",
    },
  });

  // Edit Form
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

  const onSubmit = (data: InsertOnjnReport) => {
    createMutation.mutate(data);
  };

  const onNotificationSubmit = (data: InsertOnjnReport) => {
    const notificationData = {
      ...data,
      type: "notification",
      locationIds: selectedLocations.join(','),
    };
    createMutation.mutate(notificationData);
  };

  const onEditSubmit = (data: InsertOnjnReport) => {
    if (!editingReport) return;
    updateMutation.mutate({
      id: editingReport.id,
      data: data,
    });
  };

  const handleEdit = (report: any) => {
    setEditingReport(report);
    editForm.reset({
      type: safeFormValue(report.type),
      commissionType: safeFormValue(report.commissionType),
      commissionDate: report.commissionDate
        ? typeof report.commissionDate === "string"
          ? report.commissionDate
          : report.commissionDate instanceof Date
            ? report.commissionDate.toISOString().split('T')[0]
            : ""
        : "",
      serialNumbers: safeFormValue(report.serialNumbers),
      companyId: report.companyId || undefined,
      status: safeFormValue(report.status),
      notes: safeFormValue(report.notes),
      notificationAuthority: safeFormValue(report.notificationAuthority),
      notificationType: safeFormValue(report.notificationType),
      notificationDate: report.notificationDate
        ? typeof report.notificationDate === "string"
          ? report.notificationDate
          : report.notificationDate instanceof Date
            ? report.notificationDate.toISOString().split('T')[0]
            : ""
        : "",
      locationIds: safeFormValue(report.locationIds),
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this ONJN report?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-100">ONJN Reports</h1>
        </div>
        <div className="flex justify-center py-8">
          <div className="text-slate-400">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-100">ONJN Reports</h1>
        </div>
        <div className="flex justify-center py-8">
          <div className="text-red-400">Error loading ONJN reports</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-100">ONJN Reports</h1>
        <div className="flex gap-2">
          <Dialog open={isNotificationDialogOpen} onOpenChange={setIsNotificationDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-orange-600 hover:bg-orange-700">
                <Bell className="mr-2 h-4 w-4" />
                New Notification
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-dialog dialog-lg">
              <DialogHeader>
                <DialogTitle className="text-slate-100">Create New ONJN Notification</DialogTitle>
              </DialogHeader>
              <Form {...notificationForm}>
                <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-4">
                  <FormField
                    control={notificationForm.control}
                    name="notificationAuthority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Notification Authority</FormLabel>
                        <Select 
                          value={field.value || ""} 
                          onValueChange={(value) => {
                            field.onChange(value);
                            setNotificationAuthority(value);
                          }}
                        >
                          <FormControl>
                            <SelectTrigger className="glass-card border-white/20 text-slate-300">
                              <SelectValue placeholder="Select authority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="glass-card border-white/20">
                            <SelectItem value="onjn_local">ONJN Local</SelectItem>
                            <SelectItem value="onjn_central">ONJN Central</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {notificationAuthority && (
                    <FormField
                      control={notificationForm.control}
                      name="notificationType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300">Notification Type</FormLabel>
                          <Select value={field.value || ""} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="glass-card border-white/20 text-slate-300">
                                <SelectValue placeholder="Select notification type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="glass-card border-white/20">
                              {(notificationAuthority === "onjn_local" 
                                ? ONJN_LOCAL_NOTIFICATION_TYPES 
                                : ONJN_CENTRAL_NOTIFICATION_TYPES
                              ).map((type) => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={notificationForm.control}
                    name="commissionDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Commission Data (from existing commissions)</FormLabel>
                        <Select value={field.value?.toString() || ""} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="glass-card border-white/20 text-slate-300">
                              <SelectValue placeholder="Select commission data (optional)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="glass-card border-white/20">
                            {commissionsData?.onjnReports?.map((commission: any) => (
                              <SelectItem key={commission.id} value={commission.commissionDate}>
                                {new Date(commission.commissionDate).toLocaleDateString()} - {commission.serialNumbers}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div>
                    <label className="text-sm font-medium text-slate-300">Locations</label>
                    <MultiLocationSelect
                      locations={locationsData?.locations || []}
                      selectedLocationIds={selectedLocations}
                      onSelectionChange={setSelectedLocations}
                    />
                  </div>

                  <FormField
                    control={notificationForm.control}
                    name="notificationDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Date of Notification</FormLabel>
                        <FormControl>
                          <Input 
                            type="date"
                            className="glass-card border-white/20 text-slate-300"
                            {...field}
                            value={typeof field.value === "string" ? field.value : ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={notificationForm.control}
                    name="companyId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Company</FormLabel>
                        <Select value={field.value?.toString() || ""} onValueChange={(value) => field.onChange(parseInt(value))}>
                          <FormControl>
                            <SelectTrigger className="glass-card border-white/20 text-slate-300">
                              <SelectValue placeholder="Select company" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="glass-card border-white/20">
                            {companiesData?.companies?.map((company: any) => (
                              <SelectItem key={company.id} value={company.id.toString()}>{company.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={notificationForm.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Status</FormLabel>
                        <Select value={field.value || ""} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="glass-card border-white/20 text-slate-300">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="glass-card border-white/20">
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

                  <FormField
                    control={notificationForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Notes</FormLabel>
                        <FormControl>
                          <Textarea 
                            className="glass-card border-white/20 text-slate-300"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsNotificationDialogOpen(false)}
                      className="border-white/20 text-slate-300"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createMutation.isPending}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      {createMutation.isPending ? "Creating..." : "Create Notification"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                New License Commission
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-white/20 max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-slate-100">Create License Commission</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="commissionDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Commission Date</FormLabel>
                        <FormControl>
                          <Input 
                            type="date"
                            className="glass-card border-white/20 text-slate-300"
                            {...field}
                            value={typeof field.value === "string" ? field.value : ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="serialNumbers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Serial Numbers</FormLabel>
                        <FormControl>
                          <Input 
                            className="glass-card border-white/20 text-slate-300"
                            placeholder="Enter serial numbers separated by spaces"
                            {...field}
                            value={typeof field.value === "string" ? field.value : ""}
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
                        <FormLabel className="text-slate-300">Company</FormLabel>
                        <Select value={field.value?.toString() || ""} onValueChange={(value) => field.onChange(parseInt(value))}>
                          <FormControl>
                            <SelectTrigger className="glass-card border-white/20 text-slate-300">
                              <SelectValue placeholder="Select company" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="glass-card border-white/20">
                            {companiesData?.companies?.map((company: any) => (
                              <SelectItem key={company.id} value={company.id.toString()}>{company.name}</SelectItem>
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
                        <FormLabel className="text-slate-300">Status</FormLabel>
                        <Select value={field.value || ""} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="glass-card border-white/20 text-slate-300">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="glass-card border-white/20">
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

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Notes</FormLabel>
                        <FormControl>
                          <Textarea 
                            className="glass-card border-white/20 text-slate-300"
                            {...field}
                            value={typeof field.value === "string" ? field.value : ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                      className="border-white/20 text-slate-300"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700"
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Type</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Serial Numbers</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Locations</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Attachments</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.onjnReports.map((report: any) => (
                  <tr key={report.id} className="table-row border-b border-white/5 hover:bg-blue-500/10">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        {report.type === 'notification' ? (
                          <Bell className="h-4 w-4 text-orange-400" />
                        ) : (
                          <FileText className="h-4 w-4 text-blue-400" />
                        )}
                        <span className="text-sm text-slate-300">
                          {report.type === 'notification' 
                            ? `${report.notificationAuthority?.replace('_', ' ').toUpperCase()} - ${report.notificationType}`
                            : 'License Commission'
                          }
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-400" />
                        <span className="text-sm text-slate-300">
                          {report.commissionDate 
                            ? new Date(report.commissionDate).toLocaleDateString()
                            : report.notificationDate
                              ? new Date(report.notificationDate).toLocaleDateString()
                              : 'N/A'
                          }
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <SerialNumbersDisplay serialNumbers={report.serialNumbers} />
                    </td>
                    <td className="py-4 px-4">
                      <LocationsDisplay 
                        locationIds={report.locationIds} 
                        locations={locationsData?.locations || []} 
                      />
                    </td>
                    <td className="py-4 px-4">
                      <Badge className={getStatusColor(report.status)}>
                        {report.status}
                      </Badge>
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
                          onClick={() => handleDelete(report.id)}
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
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="glass-dialog dialog-lg">
          <DialogHeader>
            <DialogTitle className="text-slate-100">Edit ONJN Report</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              {editingReport?.type === 'notification' ? (
                <>
                  <FormField
                    control={editForm.control}
                    name="notificationAuthority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Notification Authority</FormLabel>
                        <Select value={field.value || ""} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="glass-card border-white/20 text-slate-300">
                              <SelectValue placeholder="Select authority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="glass-card border-white/20">
                            <SelectItem value="onjn_local">ONJN Local</SelectItem>
                            <SelectItem value="onjn_central">ONJN Central</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="notificationType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Notification Type</FormLabel>
                        <Select value={field.value || ""} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="glass-card border-white/20 text-slate-300">
                              <SelectValue placeholder="Select notification type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="glass-card border-white/20">
                            {(editingReport?.notificationAuthority === "onjn_local" 
                              ? ONJN_LOCAL_NOTIFICATION_TYPES 
                              : ONJN_CENTRAL_NOTIFICATION_TYPES
                            ).map((type) => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="notificationDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Notification Date</FormLabel>
                        <FormControl>
                          <Input 
                            type="date"
                            className="glass-card border-white/20 text-slate-300"
                            {...field}
                            value={typeof field.value === "string" ? field.value : ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              ) : (
                <>
                  <FormField
                    control={editForm.control}
                    name="commissionDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Commission Date</FormLabel>
                        <FormControl>
                          <Input 
                            type="date"
                            className="glass-card border-white/20 text-slate-300"
                            {...field}
                            value={typeof field.value === "string" ? field.value : ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="serialNumbers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Serial Numbers</FormLabel>
                        <FormControl>
                          <Input 
                            className="glass-card border-white/20 text-slate-300"
                            placeholder="Enter serial numbers separated by spaces"
                            {...field}
                            value={typeof field.value === "string" ? field.value : ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <FormField
                control={editForm.control}
                name="companyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">Company</FormLabel>
                    <Select value={field.value?.toString() || ""} onValueChange={(value) => field.onChange(parseInt(value))}>
                      <FormControl>
                        <SelectTrigger className="glass-card border-white/20 text-slate-300">
                          <SelectValue placeholder="Select company" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="glass-card border-white/20">
                        {companiesData?.companies?.map((company: any) => (
                          <SelectItem key={company.id} value={company.id.toString()}>{company.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">Status</FormLabel>
                    <Select value={field.value || ""} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="glass-card border-white/20 text-slate-300">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="glass-card border-white/20">
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

              <FormField
                control={editForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        className="glass-card border-white/20 text-slate-300"
                        {...field}
                        value={typeof field.value === "string" ? field.value : ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  className="border-white/20 text-slate-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {updateMutation.isPending ? "Updating..." : "Update Report"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}