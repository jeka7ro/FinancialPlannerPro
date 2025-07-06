import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "../lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, type InsertUser } from "@/shared/schema";
import { useToast } from "../hooks/use-toast";
import { Badge } from "../components/ui/badge";
import { ImportExportDialog } from "../components/ui/import-export-dialog";
import { AttachmentButton } from "../components/ui/attachment-button";
import { UserAvatar } from "../components/ui/user-avatar";
import { BulkOperations } from "../components/ui/bulk-operations";
import { Checkbox } from "../components/ui/checkbox";
import { Upload, Download, Edit, Trash2, Plus, Search, Mail, Phone, Eye, EyeOff } from "lucide-react";
import { z } from "zod";

export default function Users() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [selectedLocations, setSelectedLocations] = useState<number[]>([]);
  const [editSelectedLocations, setEditSelectedLocations] = useState<number[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const { toast } = useToast();
  const limit = 10;
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/users', currentPage, limit, searchTerm],
    queryFn: async () => {
      const searchParam = searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : '';
      const response = await apiRequest('GET', `/api/users?page=${currentPage}&limit=${limit}${searchParam}`);
      return response.json();
    },
  });

  const { data: locations } = useQuery({
    queryKey: ['/api/locations'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/locations?page=1&limit=1000');
      return response.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertUser & { locationIds?: number[] }) => {
      // Include location IDs in the user creation request
      const userData = { ...data, locationIds: selectedLocations };
      return await apiRequest("POST", "/api/users", userData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setIsCreateDialogOpen(false);
      setSelectedLocations([]);
      form.reset();
      toast({
        title: "Success",
        description: "User created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create user. Please try again.",
        variant: "destructive",
      });
    },
  });

  const editMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertUser> & { locationIds?: number[]; newPassword?: string } }) => {
      // Include location IDs in the user update request
      const userData = { ...data, locationIds: editSelectedLocations };
      
      // If new password is provided, include it in the update
      if (data.newPassword && data.newPassword.trim()) {
        userData.password = data.newPassword;
      }
      
      // Remove newPassword from the data sent to API
      delete userData.newPassword;
      
      return await apiRequest("PUT", `/api/users/${id}`, userData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setIsEditDialogOpen(false);
      setEditSelectedLocations([]);
      editForm.reset();
      setEditingUser(null);
      toast({
        title: "Success",
        description: "User updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update user.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/users/${id}`),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    },
  });

  const form = useForm<InsertUser>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      email: "",
      telephone: "",
      password: "",
      firstName: "",
      lastName: "",
      role: "operator",
      isActive: true,
    },
  });

  const editForm = useForm<InsertUser & { newPassword?: string, confirmPassword?: string }>({
    resolver: zodResolver(insertUserSchema.omit({ password: true }).extend({
      newPassword: z.string().optional(),
      confirmPassword: z.string().optional(),
    })),
    defaultValues: {
      username: "",
      email: "",
      telephone: "",
      firstName: "",
      lastName: "",
      role: "operator",
      isActive: true,
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: InsertUser) => {
    createMutation.mutate(data);
  };

  const onEditSubmit = (data: Partial<InsertUser> & { newPassword?: string, confirmPassword?: string }) => {
    setPasswordError("");
    if (data.newPassword && data.newPassword !== data.confirmPassword) {
      setPasswordError("Parolele nu coincid!");
      return;
    }
    if (editingUser) {
      editMutation.mutate({ id: editingUser.id, data });
    }
  };

  const handleEdit = async (user: any) => {
    setEditingUser(user);
    editForm.reset({
      username: user.username || "",
      email: user.email || "",
      telephone: user.telephone || "",
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      role: user.role || "operator",
      isActive: user.isActive ?? true,
      newPassword: "",
      confirmPassword: "",
    });
    
    // Load user's current location assignments
    try {
      const response = await apiRequest('GET', `/api/users/${user.id}/locations`);
      const userLocations = await response.json();
      setEditSelectedLocations(userLocations.map((ul: any) => ul.locationId));
    } catch (error) {
      console.error('Failed to load user locations:', error);
      setEditSelectedLocations([]);
    }
    
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === data?.users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(data?.users.map((u: any) => u.id) || []);
    }
  };

  const handleSelectUser = (userId: number) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleBulkEdit = () => {
    toast({
      title: "Bulk Edit",
      description: `Editing ${selectedUsers.length} users`,
    });
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedUsers.length} users?`)) {
      selectedUsers.forEach(id => deleteMutation.mutate(id));
      setSelectedUsers([]);
    }
  };

  const handleSelectAllLocations = () => {
    if (selectedLocations.length === locations?.locations?.length) {
      setSelectedLocations([]);
    } else {
      setSelectedLocations(locations?.locations?.map((loc: any) => loc.id) || []);
    }
  };

  const handleSelectAllEditLocations = () => {
    if (editSelectedLocations.length === locations?.locations?.length) {
      setEditSelectedLocations([]);
    } else {
      setEditSelectedLocations(locations?.locations?.map((loc: any) => loc.id) || []);
    }
  };

  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'manager':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'operator':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'viewer':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-4 w-full max-w-none">
      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BulkOperations 
            selectedCount={selectedUsers.length}
            onBulkEdit={handleBulkEdit}
            onBulkDelete={handleBulkDelete}
          />
        </div>
        <div className="text-sm text-slate-400">
          {selectedUsers.length > 0 && (
            <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full">
              {selectedUsers.length} selected
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
              placeholder="Search users by name, email, or role..."
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
              Add User
            </Button>
            <ImportExportDialog module="users" moduleName="Users">
              <Button className="px-4 py-2 rounded-lg h-10 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0">
                Import/Export
              </Button>
            </ImportExportDialog>
          </div>
        </div>
      </div>

      {/* Enhanced Users Table */}
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
            <h3 className="text-xl font-semibold text-white mb-2">Failed to load users</h3>
            <p>Please try refreshing the page or check your connection.</p>
          </div>
        ) : !data?.users?.length ? (
          <div className="empty-state-container">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-white mb-2">No users found</h3>
            <p>Get started by creating your first system user.</p>
          </div>
        ) : (
          <>
            <div className="enhanced-table-wrapper">
              <table className="enhanced-table w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="w-12 px-4 py-3 text-left">
                      <Checkbox
                        checked={selectedUsers.length === data?.users.length && data?.users.length > 0}
                        onCheckedChange={handleSelectAll}
                        className="border-white/30"
                      />
                    </th>
                    <th className="w-16 px-4 py-3 text-left font-semibold text-white">#</th>
                    <th className="px-4 py-3 text-left font-semibold text-white">User</th>
                    <th className="px-4 py-3 text-left font-semibold text-white">Email</th>
                    <th className="px-4 py-3 text-left font-semibold text-white">Telephone</th>
                    <th className="px-4 py-3 text-left font-semibold text-white">Role</th>
                    <th className="px-4 py-3 text-left font-semibold text-white">Status</th>
                    <th className="px-4 py-3 text-left font-semibold text-white">Created</th>
                    <th className="px-4 py-3 text-left font-semibold text-white">Attachments</th>
                    <th className="px-4 py-3 text-right font-semibold text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.users.map((user: any, index: number) => (
                    <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-4">
                        <Checkbox
                          checked={selectedUsers.includes(user.id)}
                          onCheckedChange={() => handleSelectUser(user.id)}
                          className="border-white/30"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="table-cell-primary font-medium">
                          {(currentPage - 1) * limit + index + 1}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <UserAvatar 
                            user={user} 
                            size="lg"
                            className="avatar-lg"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="table-cell-primary font-medium truncate">
                              {user.firstName && user.lastName ? 
                                `${user.firstName} ${user.lastName}` : 
                                user.username
                              }
                            </div>
                            <div className="table-cell-secondary text-sm truncate">@{user.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-blue-400" />
                          <span className="table-cell-primary">{user.email}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-green-400" />
                          <span className="table-cell-primary">{user.telephone || '-'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`status-badge ${getRoleColor(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`status-badge ${user.isActive ? 'status-active' : 'status-inactive'}`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="table-cell-secondary">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <AttachmentButton 
                          entityType="users" 
                          entityId={user.id} 
                          entityName={`${user.firstName || ''} ${user.lastName || ''} (${user.username})`} 
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            className="action-button text-amber-500 hover:text-amber-400"
                            onClick={() => handleEdit(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            className="action-button text-red-500 hover:text-red-400"
                            onClick={() => handleDelete(user.id)}
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
      {data?.users?.length > 0 && (
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

      {/* Create User Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="glass-dialog dialog-lg">
          <DialogHeader>
            <DialogTitle className="text-white">Create New User</DialogTitle>
            <DialogDescription className="text-slate-400">
              Add a new user account with role permissions and location assignments.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel className="text-white">Username *</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} className="form-input w-full" placeholder="Enter username" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel className="text-white flex items-center gap-2">
                        <Mail className="h-4 w-4 text-blue-400" />
                        Email *
                      </FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} type="email" className="form-input w-full" placeholder="user@email.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel className="text-white">First Name</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} className="form-input w-full" placeholder="First name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel className="text-white">Last Name</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} className="form-input w-full" placeholder="Last name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel className="text-white">Password *</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} type="password" className="form-input w-full" placeholder="Enter password" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="telephone"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel className="text-white flex items-center gap-2">
                        <Phone className="h-4 w-4 text-green-400" />
                        Telephone
                      </FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} type="tel" className="form-input w-full" placeholder="Enter telephone number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Role *</FormLabel>
                    <Select value={field.value ?? ""} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="form-input">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="glass-card border-white/10">
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="operator">Operator</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-white text-sm font-medium">Assigned Locations *</label>
                  <button
                    type="button"
                    onClick={handleSelectAllLocations}
                    className="text-xs text-blue-400 hover:text-blue-300 underline"
                  >
                    {selectedLocations.length === locations?.locations?.length ? "Deselect All" : "Select All"}
                  </button>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto border border-white/10 rounded-md p-3">
                  {locations?.locations?.map((location: any) => (
                    <label key={location.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedLocations.includes(location.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedLocations([...selectedLocations, location.id]);
                          } else {
                            setSelectedLocations(selectedLocations.filter(id => id !== location.id));
                          }
                        }}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-300">{location.name}</span>
                    </label>
                  ))}
                </div>
                {selectedLocations.length === 0 && (
                  <p className="text-xs text-red-400">Please select at least one location</p>
                )}
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
                  {createMutation.isPending ? "Creating..." : "Create User"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="glass-dialog dialog-sm confirmation-dialog">
          <DialogHeader>
            <DialogTitle className="text-white">Edit User</DialogTitle>
            <DialogDescription className="text-slate-400">
              Modify user account settings, role permissions, and location assignments.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Username</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} className="form-input" placeholder="Enter username" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white flex items-center gap-2">
                        <Mail className="h-4 w-4 text-blue-400" />
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} type="email" className="form-input" placeholder="user@email.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">First Name</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} className="form-input" placeholder="First name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Last Name</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} className="form-input" placeholder="Last name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="telephone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white flex items-center gap-2">
                        <Phone className="h-4 w-4 text-green-400" />
                        Telephone
                      </FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} type="tel" className="form-input" placeholder="Enter telephone number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">New Password</FormLabel>
                      <div className="relative">
                        <Input
                          {...field}
                          value={field.value || ""}
                          type={showNewPassword ? "text" : "password"}
                          className="form-input pr-10"
                          placeholder="Leave empty to keep current"
                        />
                        <button
                          type="button"
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-400"
                          tabIndex={-1}
                          onClick={() => setShowNewPassword((v) => !v)}
                        >
                          {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={editForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Confirm New Password</FormLabel>
                    <div className="relative">
                      <Input
                        {...field}
                        value={field.value || ""}
                        type={showConfirmPassword ? "text" : "password"}
                        className="form-input pr-10"
                        placeholder="Re-enter new password"
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-400"
                        tabIndex={-1}
                        onClick={() => setShowConfirmPassword((v) => !v)}
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {passwordError && (
                <div className="text-red-400 text-sm font-semibold text-center -mt-2 mb-2">
                  {passwordError}
                </div>
              )}

              <FormField
                control={editForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Role</FormLabel>
                    <Select value={field.value ?? ""} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="form-input">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="glass-card border-white/10">
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="operator">Operator</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <label className="text-white text-sm font-medium">User Photo</label>
                <AttachmentButton
                  entityType="users"
                  entityId={editingUser?.id}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-white text-sm font-medium">Assigned Locations *</label>
                  <button
                    type="button"
                    onClick={handleSelectAllEditLocations}
                    className="text-xs text-blue-400 hover:text-blue-300 underline"
                  >
                    {editSelectedLocations.length === locations?.locations?.length ? "Deselect All" : "Select All"}
                  </button>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto border border-white/10 rounded-md p-3">
                  {locations?.locations?.map((location: any) => (
                    <label key={location.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editSelectedLocations.includes(location.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEditSelectedLocations([...editSelectedLocations, location.id]);
                          } else {
                            setEditSelectedLocations(editSelectedLocations.filter(id => id !== location.id));
                          }
                        }}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-300">{location.name}</span>
                    </label>
                  ))}
                </div>
                {editSelectedLocations.length === 0 && (
                  <p className="text-xs text-red-400">Please select at least one location</p>
                )}
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
                  disabled={editMutation.isPending}
                >
                  {editMutation.isPending ? "Updating..." : "Update User"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
