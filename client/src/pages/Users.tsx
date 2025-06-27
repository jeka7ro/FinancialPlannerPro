import { useState } from "react";
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
import { insertUserSchema, type InsertUser } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { ImportExportDialog } from "@/components/ui/import-export-dialog";
import { AttachmentButton } from "@/components/ui/attachment-button";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Upload, Download, Edit, Trash2, Plus } from "lucide-react";

export default function Users() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [selectedLocations, setSelectedLocations] = useState<number[]>([]);
  const [editSelectedLocations, setEditSelectedLocations] = useState<number[]>([]);
  const { toast } = useToast();
  const limit = 10;

  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/users', currentPage, limit, searchTerm],
    queryFn: async () => {
      const searchParam = searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : '';
      const response = await fetch(`/api/users?page=${currentPage}&limit=${limit}${searchParam}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    },
  });

  const { data: locations } = useQuery({
    queryKey: ['/api/locations'],
    queryFn: async () => {
      const response = await fetch('/api/locations?page=1&limit=1000', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch locations');
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
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertUser> & { locationIds?: number[] } }) => {
      // Include location IDs in the user update request
      const userData = { ...data, locationIds: editSelectedLocations };
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

  const editForm = useForm<InsertUser>({
    resolver: zodResolver(insertUserSchema.omit({ password: true })),
    defaultValues: {
      username: "",
      email: "",
      telephone: "",
      firstName: "",
      lastName: "",
      role: "operator",
      isActive: true,
    },
  });

  const onSubmit = (data: InsertUser) => {
    createMutation.mutate(data);
  };

  const onEditSubmit = (data: Partial<InsertUser>) => {
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
    });
    
    // Load user's current location assignments
    try {
      const response = await fetch(`/api/users/${user.id}/locations`, {
        credentials: 'include'
      });
      if (response.ok) {
        const userLocations = await response.json();
        setEditSelectedLocations(userLocations.map((ul: any) => ul.locationId));
      }
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
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-2">
          <ImportExportDialog module="users" moduleName="Users">
            <Button className="bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-500 text-white font-medium px-4 py-2 rounded-lg">
              <Upload className="h-4 w-4 mr-2" />
              Import/Export
            </Button>
          </ImportExportDialog>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-500 text-white font-medium px-4 py-2 rounded-lg">
              <Plus className="h-4 w-4 mr-2" />
              Add new
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-white/10 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">Create New User</DialogTitle>
              <DialogDescription className="text-slate-400">
                Create a new system user with role permissions and location access.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Username</FormLabel>
                        <FormControl>
                          <Input {...field} className="form-input" placeholder="Enter username" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" className="form-input" placeholder="user@email.com" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="telephone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Telephone</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} type="tel" className="form-input" placeholder="Enter telephone number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Password</FormLabel>
                      <FormControl>
                        <Input {...field} type="password" className="form-input" placeholder="Enter password" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />



                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
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
                    control={form.control}
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

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Role</FormLabel>
                      <Select value={field.value || ""} onValueChange={field.onChange}>
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
                  <label className="text-white text-sm font-medium">Assigned Locations *</label>
                  <div className="space-y-2">
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
        </div>
      </div>

      {/* Enhanced Search */}
      <div className="search-card">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search users by name, email, or role..."
            value={searchTerm}
            onChange={handleSearch}
            className="enhanced-input pl-12 pr-4 py-4 text-base"
          />
          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400 text-lg">👥</span>
        </div>
      </div>

      {/* Enhanced Users Table */}
      <div className="content-card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold heading-gradient">System Users</h2>
            <p className="text-slate-400 mt-1">User accounts and access management</p>
          </div>
          <div className="text-sm text-slate-400">
            {data?.total || 0} total users
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="loading-shimmer h-20"></div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12 text-slate-400">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-white mb-2">Failed to load users</h3>
            <p>Please try refreshing the page or check your connection.</p>
          </div>
        ) : !data?.users?.length ? (
          <div className="text-center py-12 text-slate-400">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-white mb-2">No users found</h3>
            <p>Get started by creating your first system user.</p>
          </div>
        ) : (
          <>
            <div className="enhanced-table-wrapper">
              <table className="enhanced-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Telephone</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.users.map((user: any) => (
                    <tr key={user.id}>
                      <td>
                        <div className="flex items-center space-x-3">
                          <UserAvatar 
                            user={user} 
                            size="sm"
                          />
                          <div>
                            <div className="table-cell-primary">
                              {user.firstName && user.lastName ? 
                                `${user.firstName} ${user.lastName}` : 
                                user.username
                              }
                            </div>
                            <div className="table-cell-secondary">@{user.username}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="table-cell-primary">{user.email}</div>
                      </td>
                      <td>
                        <div className="table-cell-primary">{user.telephone || '-'}</div>
                      </td>
                      <td>
                        <span className={`status-badge ${getRoleColor(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${user.isActive ? 'status-active' : 'status-inactive'}`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="table-cell-secondary">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                        </div>
                      </td>
                      <td>
                        <div className="action-button-group justify-end">
                          <AttachmentButton 
                            entityType="users" 
                            entityId={user.id} 
                            entityName={`${user.firstName || ''} ${user.lastName || ''} (${user.username})`} 
                          />
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

            {/* Enhanced Pagination */}
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/10">
              <div className="text-sm text-slate-400">
                Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, data.total)} of {data.total} entries
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="ghost"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="action-button text-slate-400 hover:text-white"
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
                        ? "bg-blue-500 text-white px-3 py-1 rounded-lg" 
                        : "action-button text-slate-400 hover:text-white"
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
                  className="action-button text-slate-400 hover:text-white"
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="glass-card border-white/10 max-w-md">
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
                      <FormLabel className="text-white">Email</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} type="email" className="form-input" placeholder="user@email.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={editForm.control}
                name="telephone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Telephone</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} type="tel" className="form-input" placeholder="Enter telephone number" />
                    </FormControl>
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

              <FormField
                control={editForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Role</FormLabel>
                    <Select value={field.value || ""} onValueChange={field.onChange}>
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
                <label className="text-white text-sm font-medium">Assigned Locations *</label>
                <div className="space-y-2">
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
