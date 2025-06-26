import { useState } from "react";
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
import { insertUserSchema, type InsertUser } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { ImportExportDialog } from "@/components/ui/import-export-dialog";
import { AttachmentButton } from "@/components/ui/attachment-button";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Upload, Download } from "lucide-react";

export default function Users() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const { toast } = useToast();
  const limit = 10;

  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/users', currentPage, limit, searchTerm],
    queryFn: async () => {
      const response = await fetch(`/api/users?page=${currentPage}&limit=${limit}&search=${searchTerm}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertUser) => {
      return await apiRequest("POST", "/api/users", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setIsCreateDialogOpen(false);
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
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertUser> }) => {
      return await apiRequest("PUT", `/api/users/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setIsEditDialogOpen(false);
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

  const handleEdit = (user: any) => {
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
    setIsEditDialogOpen(true);
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
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
              <Upload className="h-4 w-4 mr-2" />
              Import/Export
            </Button>
          </ImportExportDialog>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="floating-action text-white">
              <span className="mr-2">➕</span>
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-white/10 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">Create New User</DialogTitle>
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

      {/* Search */}
      <Card className="glass-card border-white/10">
        <CardContent className="p-6">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={handleSearch}
              className="form-input pl-10"
            />
            <span className="absolute left-3 top-3 text-slate-400">🔍</span>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white">System Users</CardTitle>
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
              Failed to load users
            </div>
          ) : !data?.users?.length ? (
            <div className="text-center py-8 text-slate-400">
              <span className="text-2xl mb-2 block">👥</span>
              No users found
            </div>
          ) : (
            <>
              <div className="overflow-x-auto -mx-6">
                <table className="w-full min-w-max">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">User</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Email</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Telephone</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Role</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Created</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.users.map((user: any) => (
                      <tr key={user.id} className="table-row border-b border-white/5 hover:bg-blue-500/10">
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            <UserAvatar 
                              user={user} 
                              size="sm"
                            />
                            <div>
                              <p className="text-sm font-medium text-white">
                                {user.firstName && user.lastName ? 
                                  `${user.firstName} ${user.lastName}` : 
                                  user.username
                                }
                              </p>
                              <p className="text-xs text-slate-400">@{user.username}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-300">
                          {user.email}
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-300">
                          {user.telephone || '-'}
                        </td>
                        <td className="py-4 px-4">
                          <Badge className={`${getRoleColor(user.role)} border`}>
                            {user.role}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <Badge className={user.isActive ? 'status-active' : 'status-inactive'}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-300">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-400">
                              👁️
                            </Button>
                            <AttachmentButton 
                              entityType="users" 
                              entityId={user.id} 
                              entityName={`${user.firstName || ''} ${user.lastName || ''} (${user.username})`} 
                            />
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-amber-500 hover:text-amber-400"
                              onClick={() => handleEdit(user)}
                            >
                              ✏️
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-400">
                              🔒
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="glass-card border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Edit User</DialogTitle>
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
