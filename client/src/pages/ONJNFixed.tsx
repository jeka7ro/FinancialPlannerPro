import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "../components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { useToast } from "../hooks/use-toast";
import { Search, Plus, Edit, Trash2, Bell } from "lucide-react";
import { insertOnjnReportSchema } from "@/shared/schema";
import type { InsertOnjnReport } from "@/shared/schema";
import { apiRequest } from "../lib/queryClient";
import { GroupedSerialNumbers } from "../components/GroupedSerialNumbers";
import { AttachmentButton } from "../components/ui/attachment-button";

// Notification types for ONJN system
const notificationTypes = [
  "Install Authorization",
  "Operation Authorization", 
  "Move Authorization",
  "Remove Authorization",
  "Legal Notification"
];

export default function ONJNFixed() {
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

  const form = useForm<InsertOnjnReport>({
    resolver: zodResolver(insertOnjnReportSchema),
    defaultValues: {
      commissionType: "license_commission",
      commissionDate: new Date().toISOString().split('T')[0],
      serialNumbers: "",
      companyId: undefined,
      locationIds: "",
      submissionDate: undefined,
      status: "draft",
      notes: "",
    },
  });

  const editForm = useForm<InsertOnjnReport>({
    resolver: zodResolver(insertOnjnReportSchema),
    defaultValues: {
      commissionType: "license_commission",
      commissionDate: new Date().toISOString().split('T')[0],
      serialNumbers: "",
      companyId: undefined,
      locationIds: "",
      submissionDate: undefined,
      status: "draft",
      notes: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertOnjnReport) => apiRequest('/api/onjn-reports', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/onjn-reports'] });
      setIsCreateDialogOpen(false);
      setIsNotificationDialogOpen(false);
      form.reset();
      toast({ title: "Success", description: "ONJN report created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to create ONJN report", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertOnjnReport> }) => 
      apiRequest(`/api/onjn-reports/${id}`, 'PUT', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/onjn-reports'] });
      setIsEditDialogOpen(false);
      setEditingReport(null);
      editForm.reset();
      toast({ title: "Success", description: "ONJN report updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to update ONJN report", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/onjn-reports/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/onjn-reports'] });
      toast({ title: "Success", description: "ONJN report deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to delete ONJN report", variant: "destructive" });
    },
  });

  const handleEdit = (report: any) => {
    setEditingReport(report);
    editForm.reset({
      commissionType: report.commissionType || "license_commission",
      commissionDate: report.commissionDate ? (typeof report.commissionDate === "string" ? report.commissionDate : report.commissionDate.toISOString().split('T')[0]) : "",
      serialNumbers: report.serialNumbers || "",
      companyId: report.companyId || undefined,
      locationIds: report.locationIds || "",
      submissionDate: report.submissionDate ? (typeof report.submissionDate === "string" ? report.submissionDate : report.submissionDate.toISOString().split('T')[0]) : "",
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

  const onNotificationSubmit = () => {
    const notificationData = {
      type: "notification" as const,
      notificationAuthority,
      locationIds: selectedLocations.join(','),
      commissionDate: new Date().toISOString().split('T')[0],
      status: "pending" as const,
      notes: "ONJN Notification created",
    };
    createMutation.mutate(notificationData);
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search ONJN reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 glass-card border-white/10 text-white placeholder-gray-400 w-80"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Export Button */}
          <Button 
            variant="outline" 
            className="border-white/20 text-slate-300 hover:bg-white/10"
          >
            Export
          </Button>
          
          {/* New Notification Button */}
          <Dialog open={isNotificationDialogOpen} onOpenChange={setIsNotificationDialogOpen}>
            <DialogTrigger asChild>
              <Button className="floating-action text-white bg-blue-600 hover:bg-blue-700">
                <Bell className="mr-2 h-4 w-4" />
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
                      {notificationTypes.map((type: string) => (
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
                    <option value="">Select Commission</option>
                    {data?.onjnReports?.map((report: any) => (
                      <option key={report.id} value={report.id}>
                        Commission #{report.id} - {new Date(report.commissionDate).toLocaleDateString()} ({report.status})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Locations
                  </label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
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
                  <AttachmentButton
                    entityType="onjn_notification"
                    entityId={0}
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
                    onClick={onNotificationSubmit}
                    className="btn-gaming"
                  >
                    Create Notification
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          {/* Create License Commission Button */}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="floating-action text-white">
                <Plus className="mr-2 h-4 w-4" />
                Create License Commission
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-white/10 text-white max-w-2xl">
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
                          <Textarea {...field} value={field.value || ""} className="form-input" placeholder="Enter serial numbers separated by spaces" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="companyId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Company</FormLabel>
                          <Select value={field.value?.toString() ?? ""} onValueChange={(value) => field.onChange(parseInt(value))}>
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

      {/* Table */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-400">
          Error loading ONJN reports: {error.message}
        </div>
      ) : (
        <div className="glass-card border-white/10 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-white/5">
                <TableHead className="text-white">ID</TableHead>
                <TableHead className="text-white">Commission Date</TableHead>
                <TableHead className="text-white">Serial Numbers</TableHead>
                <TableHead className="text-white">Status</TableHead>
                <TableHead className="text-white">Created</TableHead>
                <TableHead className="text-white">Created By</TableHead>
                <TableHead className="text-white">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.onjnReports?.map((report: any) => (
                <TableRow key={report.id} className="border-white/10 hover:bg-white/5">
                  <TableCell className="text-white font-medium">
                    {report.id}
                  </TableCell>
                  <TableCell className="text-white">
                    {new Date(report.commissionDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-white">
                    <GroupedSerialNumbers serialNumbers={report.serialNumbers || ''} />
                  </TableCell>
                  <TableCell className="text-white">
                    <span className={`px-2 py-1 rounded text-xs ${
                      report.status === 'approved' ? 'bg-green-600' :
                      report.status === 'pending' ? 'bg-yellow-600' :
                      'bg-gray-600'
                    }`}>
                      {report.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-white">
                    {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell className="text-white">
                    {report.userId ? `User ${report.userId}` : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(report)}
                        className="text-blue-400 hover:text-blue-300"
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {data?.total > limit && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="glass-card border-white/10 text-white"
          >
            Previous
          </Button>
          <span className="text-white">
            Page {currentPage} of {Math.ceil(data.total / limit)}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(Math.min(Math.ceil(data.total / limit), currentPage + 1))}
            disabled={currentPage >= Math.ceil(data.total / limit)}
            className="glass-card border-white/10 text-white"
          >
            Next
          </Button>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="glass-card border-white/10 text-white max-w-2xl">
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
                      <Textarea {...field} value={field.value || ""} className="form-input" placeholder="Enter serial numbers separated by spaces" />
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

      {/* Main Table */}
      <div className="glass-card rounded-lg overflow-hidden border border-white/10">
        <div className="overflow-x-auto" style={{ width: 'calc(100vw - 280px)', marginLeft: '-24px' }}>
          <Table className="w-full border-collapse">
            <TableHeader>
              <TableRow className="border-b border-white/10 hover:bg-white/5">
                <TableHead 
                  className="text-left py-4 px-6 text-slate-300 font-semibold cursor-pointer hover:text-white transition-colors"
                  onClick={() => {/* Add sorting logic */}}
                >
                  ID
                </TableHead>
                <TableHead className="text-left py-4 px-6 text-slate-300 font-semibold">Type</TableHead>
                <TableHead className="text-left py-4 px-6 text-slate-300 font-semibold">Date</TableHead>
                <TableHead className="text-left py-4 px-6 text-slate-300 font-semibold">Serial Numbers</TableHead>
                <TableHead className="text-left py-4 px-6 text-slate-300 font-semibold">Status</TableHead>
                <TableHead className="text-left py-4 px-6 text-slate-300 font-semibold">Created</TableHead>
                <TableHead className="text-left py-4 px-6 text-slate-300 font-semibold">Created By</TableHead>
                <TableHead className="text-left py-4 px-6 text-slate-300 font-semibold">Attachments</TableHead>
                <TableHead className="text-left py-4 px-6 text-slate-300 font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-slate-400">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : data?.onjnReports?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-slate-400">
                    No ONJN reports found
                  </TableCell>
                </TableRow>
              ) : (
                data?.onjnReports?.map((report: any) => (
                  <TableRow key={report.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <TableCell className="py-4 px-6 text-slate-300 font-medium">
                      {report.id}
                    </TableCell>
                    <TableCell className="py-4 px-6 text-slate-300">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        report.type === 'license_commission' 
                          ? 'bg-blue-500/20 text-blue-300' 
                          : 'bg-green-500/20 text-green-300'
                      }`}>
                        {report.type === 'license_commission' ? 'License Commission' : 'Notification'}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 px-6 text-slate-300">
                      {report.commissionDate 
                        ? new Date(report.commissionDate).toLocaleDateString()
                        : report.notificationDate 
                        ? new Date(report.notificationDate).toLocaleDateString()
                        : '-'
                      }
                    </TableCell>
                    <TableCell className="py-4 px-6 text-slate-300">
                      {report.serialNumbers ? (
                        <GroupedSerialNumbers serialNumbers={report.serialNumbers} />
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        report.status === 'approved' ? 'bg-green-500/20 text-green-300' :
                        report.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                        report.status === 'rejected' ? 'bg-red-500/20 text-red-300' :
                        'bg-gray-500/20 text-gray-300'
                      }`}>
                        {report.status}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 px-6 text-slate-300">
                      {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell className="py-4 px-6 text-slate-300">
                      {report.createdBy || 'System'}
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <AttachmentButton 
                        entityType="onjn_report" 
                        entityId={report.id}
                      />
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(report)}
                          className="text-slate-400 hover:text-white hover:bg-white/10"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteMutation.mutate(report.id)}
                          className="text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}