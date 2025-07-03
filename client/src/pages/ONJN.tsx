import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertOnjnReportSchema, type InsertOnjnReport } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Calendar, FileText, MapPin, Building, Edit, Trash2, Bell, ChevronDown } from "lucide-react";
import { AttachmentButton } from "@/components/ui/attachment-button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { safeFormValue } from "@/utils/formUtils";

// Serial Numbers Display Component
const SerialNumbersDisplay = ({ serialNumbers }: { serialNumbers: string | null }) => {
  if (!serialNumbers) {
    return <span className="text-slate-500">No serials</span>;
  }

  const serials = serialNumbers.split(' ').filter((sn: string) => sn.trim());
  
  if (serials.length <= 1) {
    return (
      <Badge variant="outline" className="text-xs bg-blue-500/20 text-blue-300 border-blue-500/50">
        {serials[0]}
      </Badge>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-auto p-1 text-xs bg-blue-500/20 text-blue-300 border border-blue-500/50 hover:bg-blue-500/30"
        >
          multiple serials ({serials.length}) <ChevronDown className="ml-1 h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 glass-card border-white/10">
        <div className="space-y-2">
          <h4 className="font-medium text-white">Serial Numbers</h4>
          <div className="flex flex-wrap gap-1">
            {serials.map((serialNumber: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs bg-blue-500/20 text-blue-300 border-blue-500/50">
                {serialNumber}
              </Badge>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    case 'approved':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'rejected':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
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

export default function ONJN() {
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

  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/onjn-reports', currentPage, limit, searchTerm],
    queryFn: async () => {
      const response = await fetch(`/api/onjn-reports?page=${currentPage}&limit=${limit}&search=${searchTerm}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch ONJN reports');
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
    mutationFn: async (data: InsertOnjnReport) => {
      return await apiRequest("POST", "/api/onjn-reports", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/onjn-reports'] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "License commission created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create license commission. Please try again.",
        variant: "destructive",
      });
    },
  });

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
        description: "License commission updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update license commission. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/onjn-reports/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/onjn-reports'] });
      toast({
        title: "Success",
        description: "License commission deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete license commission. Please try again.",
        variant: "destructive",
      });
    },
  });

  const form = useForm<InsertOnjnReport>({
    resolver: zodResolver(insertOnjnReportSchema),
    defaultValues: {
      commissionType: "license_commission",
      serialNumbers: "",
      status: "draft",
      notes: "",
    },
  });

  const editForm = useForm<InsertOnjnReport>({
    resolver: zodResolver(insertOnjnReportSchema),
    defaultValues: {
      commissionType: "license_commission",
      serialNumbers: "",
      status: "draft",
      notes: "",
    },
  });

  const onSubmit = (data: InsertOnjnReport) => {
    createMutation.mutate(data);
  };

  const onEditSubmit = (data: InsertOnjnReport) => {
    if (editingReport) {
      updateMutation.mutate({ id: editingReport.id, data });
    }
  };

  const handleEdit = (report: any) => {
    setEditingReport(report);
    editForm.reset({
      commissionType: report.commissionType || "license_commission",
      commissionDate: report.commissionDate
        ? typeof report.commissionDate === "string"
          ? report.commissionDate
          : report.commissionDate instanceof Date
            ? report.commissionDate.toISOString().split('T')[0]
            : ""
        : "",
      serialNumbers: report.serialNumbers || "",
      companyId: report.companyId || undefined,
      locationIds: report.locationIds || "",
      submissionDate: report.submissionDate
        ? typeof report.submissionDate === "string"
          ? report.submissionDate
          : report.submissionDate instanceof Date
            ? report.submissionDate.toISOString().split('T')[0]
            : ""
        : "",
      status: report.status || "draft",
      notes: report.notes || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (reportId: number) => {
    if (confirm("Are you sure you want to delete this license commission?")) {
      deleteMutation.mutate(reportId);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  // Function to find commission date by matching slot serial number with ONJN serial numbers
  const findCommissionDateBySerialNumber = (slotSerialNumber: string) => {
    if (!data?.onjnReports || !slotSerialNumber) return null;
    
    const matchingReport = data.onjnReports.find((report: any) => {
      if (!report.serialNumbers) return false;
      const serialNumbers = report.serialNumbers.split(' ').filter((sn: string) => sn.trim());
      return serialNumbers.includes(slotSerialNumber);
    });
    
    return matchingReport?.commissionDate ? new Date(matchingReport.commissionDate).toLocaleDateString() : null;
  };

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">

        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isNotificationDialogOpen} onOpenChange={setIsNotificationDialogOpen}>
            <DialogTrigger asChild>
              <Button className="floating-action text-white bg-blue-600 hover:bg-blue-700">
                <span className="mr-2">🔔</span>
                New Notification
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-dialog dialog-xl">
              <DialogHeader>
                <DialogTitle className="text-white">Create ONJN Notification</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Notification Authority
                    </label>
                    <select 
                      value={notificationAuthority} 
                      onChange={(e) => setNotificationAuthority(e.target.value)}
                      className="form-input w-full"
                    >
                      <option value="">Select Authority</option>
                      <option value="ONJN Central">ONJN Central</option>
                      <option value="ONJN Local">ONJN Local</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Notification Type
                    </label>
                    <select className="form-input w-full">
                      <option value="">Select Type</option>
                      {(notificationAuthority === "ONJN Local" ? ONJN_LOCAL_NOTIFICATION_TYPES : 
                        notificationAuthority === "ONJN Central" ? ONJN_CENTRAL_NOTIFICATION_TYPES : [])
                        .map((type: string) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Commission Data Selection
                  </label>
                  <select className="form-input w-full">
                    <option value="">Select Commission Data</option>
                    {data?.onjnReports?.map((report: any) => (
                      <option key={report.id} value={report.id}>
                        {report.serialNumbers} - {new Date(report.commissionDate).toLocaleDateString()}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Locations
                  </label>
                  <div className="space-y-2">
                    {locations?.locations?.map((location: any) => (
                      <label key={location.id} className="flex items-center space-x-2">
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
                          className="rounded border-gray-300"
                        />
                        <span className="text-white">{location.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Notification Date
                    </label>
                    <input 
                      type="date" 
                      className="form-input w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Submission Date
                    </label>
                    <input 
                      type="date" 
                      className="form-input w-full"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Notes
                  </label>
                  <textarea 
                    className="form-input w-full h-24" 
                    placeholder="Enter notification notes..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Attachments
                  </label>
                  <input 
                    type="file" 
                    multiple 
                    className="form-input w-full"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                  />
                </div>
                
                <div className="flex justify-end gap-2 mt-6">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => setIsNotificationDialogOpen(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="button" 
                    className="btn-gaming"
                  >
                    Create Notification
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="floating-action text-white">
                <span className="mr-2">➕</span>
                Create License Commission
              </Button>
            </DialogTrigger>
          <DialogContent className="glass-dialog dialog-lg">
            <DialogHeader>
              <DialogTitle className="text-white">Create License Commission</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
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
                            value={typeof field.value === "string" ? field.value : ""}
                            onChange={e => field.onChange(e.target.value)}
                            className="form-input"
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
                        <FormLabel className="text-white">Serial Numbers</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} className="form-input" placeholder="Enter serial numbers (space separated)" />
                        </FormControl>
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
                        <Select value={field.value ?? ""} onValueChange={(value) => field.onChange(parseInt(value))}>
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
                    name="locationIds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Location</FormLabel>
                        <Select value={field.value ?? ""} onValueChange={(value) => field.onChange(parseInt(value))}>
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
                    name="submissionDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Submission Date</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            value={typeof field.value === "string" ? field.value : ""}
                            onChange={e => field.onChange(e.target.value)}
                            className="form-input"
                          />
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
                        <Select value={field.value ?? ""} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="form-input">
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
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Notes</FormLabel>
                      <FormControl>
                        <Textarea {...field} value={field.value || ""} className="form-input" placeholder="Enter any additional notes" />
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
                    {createMutation.isPending ? "Creating..." : "Create Commission"}
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
              placeholder="Search license commissions by serial numbers..."
              value={searchTerm}
              onChange={handleSearch}
              className="form-input pl-10"
            />
            <span className="absolute left-3 top-3 text-slate-400">🔍</span>
          </div>
        </CardContent>
      </Card>

      {/* License Commissions List */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white">License Commissions</CardTitle>
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
              Failed to load license commissions
            </div>
          ) : !data?.onjnReports?.length ? (
            <div className="text-center py-8 text-slate-400">
              <span className="text-2xl mb-2 block">📄</span>
              No license commissions found
            </div>
          ) : (
            <>
              <div className="overflow-x-auto -mx-6">
                <table className="w-full min-w-max">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Commission Date</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Serial Numbers</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Company</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Location</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Submission Date</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Attachments</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.onjnReports.map((report: any) => (
                      <tr key={report.id} className="table-row border-b border-white/5 hover:bg-blue-500/10">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-blue-400" />
                            <span className="text-sm text-slate-300">
                              {report.commissionDate ? new Date(report.commissionDate).toLocaleDateString() : 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <SerialNumbersDisplay serialNumbers={report.serialNumbers} />
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-300">
                          {companies?.companies?.find((c: any) => c.id === report.companyId)?.name || 'N/A'}
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-300">
                          {Array.isArray(locations?.locations) ? locations.locations.find((l: any) => l.id === report.locationId)?.name || 'N/A' : 'N/A'}
                        </td>
                        <td className="py-4 px-4">
                          <Badge className={`${getStatusColor(report.status)} border`}>
                            {report.status}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-300">
                          {report.submissionDate ? new Date(report.submissionDate).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-4 px-4">
                          <AttachmentButton 
                            entityType="onjn-report" 
                            entityId={report.id}
                          />
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(report)}
                              className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/20"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(report.id)}
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
        <DialogContent className="glass-dialog dialog-lg">
          <DialogHeader>
            <DialogTitle className="text-white">Edit License Commission</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
                          value={typeof field.value === "string" ? field.value : ""}
                          onChange={e => field.onChange(e.target.value)}
                          className="form-input"
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
                      <FormLabel className="text-white">Serial Numbers</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} className="form-input" placeholder="Enter serial numbers (space separated)" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="companyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Company</FormLabel>
                      <Select value={field.value ?? ""} onValueChange={(value) => field.onChange(parseInt(value))}>
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
                  control={editForm.control}
                  name="locationIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Location</FormLabel>
                      <Select value={field.value ?? ""} onValueChange={(value) => field.onChange(parseInt(value))}>
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
                  control={editForm.control}
                  name="submissionDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Submission Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          value={typeof field.value === "string" ? field.value : ""}
                          onChange={e => field.onChange(e.target.value)}
                          className="form-input"
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
                      <Select value={field.value ?? ""} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="form-input">
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
              </div>

              <FormField
                control={editForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Notes</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value || ""} className="form-input" placeholder="Enter any additional notes" />
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