import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

// Settings schemas
const profileSettingsSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8, "Password must be at least 8 characters").optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  if (data.newPassword && data.newPassword !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const systemSettingsSchema = z.object({
  theme: z.string(),
  language: z.string(),
  timezone: z.string(),
  dateFormat: z.string(),
  currencyFormat: z.string(),
  autoLogout: z.boolean(),
  logoutTime: z.number().min(5).max(480),
  enableNotifications: z.boolean(),
  enableEmailAlerts: z.boolean(),
  enableSmsAlerts: z.boolean(),
});

const securitySettingsSchema = z.object({
  twoFactorEnabled: z.boolean(),
  sessionTimeout: z.number().min(15).max(1440),
  passwordExpiry: z.number().min(30).max(365),
  maxLoginAttempts: z.number().min(3).max(10),
  ipWhitelisting: z.boolean(),
  auditLogging: z.boolean(),
});

type ProfileSettings = z.infer<typeof profileSettingsSchema>;
type SystemSettings = z.infer<typeof systemSettingsSchema>;
type SecuritySettings = z.infer<typeof securitySettingsSchema>;

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  const { toast } = useToast();

  // Get current user data
  const { data: currentUser, isLoading: userLoading } = useQuery({
    queryKey: ['/api/auth/user'],
    queryFn: async () => {
      const response = await fetch('/api/auth/user', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch user');
      return response.json();
    },
  });

  // Profile form
  const profileForm = useForm<ProfileSettings>({
    resolver: zodResolver(profileSettingsSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // System settings form with default values
  const systemForm = useForm<SystemSettings>({
    resolver: zodResolver(systemSettingsSchema),
    defaultValues: {
      theme: "dark",
      language: "en",
      timezone: "Europe/Bucharest",
      dateFormat: "DD/MM/YYYY",
      currencyFormat: "EUR",
      autoLogout: true,
      logoutTime: 30,
      enableNotifications: true,
      enableEmailAlerts: true,
      enableSmsAlerts: false,
    },
  });

  // Security settings form with default values
  const securityForm = useForm<SecuritySettings>({
    resolver: zodResolver(securitySettingsSchema),
    defaultValues: {
      twoFactorEnabled: false,
      sessionTimeout: 120,
      passwordExpiry: 90,
      maxLoginAttempts: 5,
      ipWhitelisting: false,
      auditLogging: true,
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileSettings) => {
      return await apiRequest("PUT", `/api/users/${currentUser?.id}`, {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        ...(data.newPassword && { password: data.newPassword }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({
        title: "Success",
        description: "Profile updated successfully.",
      });
      profileForm.setValue("currentPassword", "");
      profileForm.setValue("newPassword", "");
      profileForm.setValue("confirmPassword", "");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  // System settings mutation (mock - would normally save to user preferences)
  const updateSystemMutation = useMutation({
    mutationFn: async (data: SystemSettings) => {
      // In a real implementation, this would save to user preferences or system config
      return new Promise(resolve => setTimeout(resolve, 1000));
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "System settings updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update system settings.",
        variant: "destructive",
      });
    },
  });

  // Security settings mutation (mock - would normally save to system security config)
  const updateSecurityMutation = useMutation({
    mutationFn: async (data: SecuritySettings) => {
      // In a real implementation, this would save to system security configuration
      return new Promise(resolve => setTimeout(resolve, 1000));
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Security settings updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update security settings.",
        variant: "destructive",
      });
    },
  });

  // Set form defaults when user data loads
  if (currentUser && !profileForm.getValues().email) {
    profileForm.reset({
      firstName: currentUser.firstName || "",
      lastName: currentUser.lastName || "",
      email: currentUser.email || "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  }

  const onProfileSubmit = (data: ProfileSettings) => {
    updateProfileMutation.mutate(data);
  };

  const onSystemSubmit = (data: SystemSettings) => {
    updateSystemMutation.mutate(data);
  };

  const onSecuritySubmit = (data: SecuritySettings) => {
    updateSecurityMutation.mutate(data);
  };

  if (userLoading) {
    return (
      <div className="space-y-6">
        <div className="loading-shimmer h-32 rounded-xl"></div>
        <div className="loading-shimmer h-96 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-400">System configuration and preferences</p>
      </div>

      {/* Settings Tabs */}
      <Card className="glass-card border-white/10">
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 glass-morphism">
              <TabsTrigger value="profile" className="text-white data-[state=active]:bg-blue-500/20">
                👤 Profile
              </TabsTrigger>
              <TabsTrigger value="system" className="text-white data-[state=active]:bg-blue-500/20">
                ⚙️ System
              </TabsTrigger>
              <TabsTrigger value="security" className="text-white data-[state=active]:bg-blue-500/20">
                🔒 Security
              </TabsTrigger>
              <TabsTrigger value="about" className="text-white data-[state=active]:bg-blue-500/20">
                ℹ️ About
              </TabsTrigger>
            </TabsList>

            {/* Profile Settings */}
            <TabsContent value="profile" className="space-y-6 mt-6">
              <Card className="glass-card border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Profile Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={profileForm.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">First Name</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value || ""} className="form-input" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={profileForm.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Last Name</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value || ""} className="form-input" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Email Address</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ""} type="email" className="form-input" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Separator className="bg-white/10" />

                      <div className="space-y-4">
                        <h4 className="text-lg font-medium text-white">Change Password</h4>
                        
                        <FormField
                          control={profileForm.control}
                          name="currentPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Current Password</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value || ""} type="password" className="form-input" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={profileForm.control}
                            name="newPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">New Password</FormLabel>
                                <FormControl>
                                  <Input {...field} value={field.value || ""} type="password" className="form-input" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={profileForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Confirm Password</FormLabel>
                                <FormControl>
                                  <Input {...field} value={field.value || ""} type="password" className="form-input" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button 
                          type="submit" 
                          className="btn-gaming"
                          disabled={updateProfileMutation.isPending}
                        >
                          {updateProfileMutation.isPending ? "Updating..." : "Update Profile"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* System Settings */}
            <TabsContent value="system" className="space-y-6 mt-6">
              <Card className="glass-card border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">System Preferences</CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...systemForm}>
                    <form onSubmit={systemForm.handleSubmit(onSystemSubmit)} className="space-y-6">
                      {/* Appearance */}
                      <div className="space-y-4">
                        <h4 className="text-lg font-medium text-white">Appearance</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={systemForm.control}
                            name="theme"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Theme</FormLabel>
                                <Select value={field.value} onValueChange={field.onChange}>
                                  <FormControl>
                                    <SelectTrigger className="form-input">
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="glass-card border-white/10">
                                    <SelectItem value="dark">Dark</SelectItem>
                                    <SelectItem value="light">Light</SelectItem>
                                    <SelectItem value="auto">Auto</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={systemForm.control}
                            name="language"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Language</FormLabel>
                                <Select value={field.value} onValueChange={field.onChange}>
                                  <FormControl>
                                    <SelectTrigger className="form-input">
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="glass-card border-white/10">
                                    <SelectItem value="en">English</SelectItem>
                                    <SelectItem value="ro">Romanian</SelectItem>
                                    <SelectItem value="de">German</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <Separator className="bg-white/10" />

                      {/* Localization */}
                      <div className="space-y-4">
                        <h4 className="text-lg font-medium text-white">Localization</h4>
                        <div className="grid grid-cols-3 gap-4">
                          <FormField
                            control={systemForm.control}
                            name="timezone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Timezone</FormLabel>
                                <Select value={field.value} onValueChange={field.onChange}>
                                  <FormControl>
                                    <SelectTrigger className="form-input">
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="glass-card border-white/10">
                                    <SelectItem value="Europe/Bucharest">Europe/Bucharest</SelectItem>
                                    <SelectItem value="Europe/London">Europe/London</SelectItem>
                                    <SelectItem value="Europe/Berlin">Europe/Berlin</SelectItem>
                                    <SelectItem value="UTC">UTC</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={systemForm.control}
                            name="dateFormat"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Date Format</FormLabel>
                                <Select value={field.value} onValueChange={field.onChange}>
                                  <FormControl>
                                    <SelectTrigger className="form-input">
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="glass-card border-white/10">
                                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={systemForm.control}
                            name="currencyFormat"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Currency</FormLabel>
                                <Select value={field.value} onValueChange={field.onChange}>
                                  <FormControl>
                                    <SelectTrigger className="form-input">
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="glass-card border-white/10">
                                    <SelectItem value="EUR">EUR (€)</SelectItem>
                                    <SelectItem value="USD">USD ($)</SelectItem>
                                    <SelectItem value="RON">RON (lei)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <Separator className="bg-white/10" />

                      {/* Session */}
                      <div className="space-y-4">
                        <h4 className="text-lg font-medium text-white">Session Management</h4>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-white">Auto Logout</Label>
                            <p className="text-sm text-slate-400">Automatically log out after inactivity</p>
                          </div>
                          <FormField
                            control={systemForm.control}
                            name="autoLogout"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        {systemForm.watch("autoLogout") && (
                          <FormField
                            control={systemForm.control}
                            name="logoutTime"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Logout Time (minutes)</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    type="number" 
                                    className="form-input w-32"
                                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        )}
                      </div>

                      <Separator className="bg-white/10" />

                      {/* Notifications */}
                      <div className="space-y-4">
                        <h4 className="text-lg font-medium text-white">Notifications</h4>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-white">Push Notifications</Label>
                              <p className="text-sm text-slate-400">Receive browser notifications</p>
                            </div>
                            <FormField
                              control={systemForm.control}
                              name="enableNotifications"
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Switch
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-white">Email Alerts</Label>
                              <p className="text-sm text-slate-400">Receive email notifications</p>
                            </div>
                            <FormField
                              control={systemForm.control}
                              name="enableEmailAlerts"
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Switch
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-white">SMS Alerts</Label>
                              <p className="text-sm text-slate-400">Receive SMS notifications</p>
                            </div>
                            <FormField
                              control={systemForm.control}
                              name="enableSmsAlerts"
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Switch
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button 
                          type="submit" 
                          className="btn-gaming"
                          disabled={updateSystemMutation.isPending}
                        >
                          {updateSystemMutation.isPending ? "Updating..." : "Update Settings"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Settings */}
            <TabsContent value="security" className="space-y-6 mt-6">
              <Card className="glass-card border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Security Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...securityForm}>
                    <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)} className="space-y-6">
                      {/* Authentication */}
                      <div className="space-y-4">
                        <h4 className="text-lg font-medium text-white">Authentication</h4>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-white">Two-Factor Authentication</Label>
                            <p className="text-sm text-slate-400">Add an extra layer of security</p>
                          </div>
                          <FormField
                            control={securityForm.control}
                            name="twoFactorEnabled"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <Separator className="bg-white/10" />

                      {/* Session Security */}
                      <div className="space-y-4">
                        <h4 className="text-lg font-medium text-white">Session Security</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={securityForm.control}
                            name="sessionTimeout"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Session Timeout (minutes)</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    type="number" 
                                    className="form-input"
                                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                                  />
                                </FormControl>
                                <FormDescription className="text-slate-400">
                                  Automatic logout after inactivity
                                </FormDescription>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={securityForm.control}
                            name="maxLoginAttempts"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Max Login Attempts</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    type="number" 
                                    className="form-input"
                                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                                  />
                                </FormControl>
                                <FormDescription className="text-slate-400">
                                  Lock account after failed attempts
                                </FormDescription>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <Separator className="bg-white/10" />

                      {/* Password Policy */}
                      <div className="space-y-4">
                        <h4 className="text-lg font-medium text-white">Password Policy</h4>
                        <FormField
                          control={securityForm.control}
                          name="passwordExpiry"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Password Expiry (days)</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="number" 
                                  className="form-input w-32"
                                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                                />
                              </FormControl>
                              <FormDescription className="text-slate-400">
                                Force password change after specified days
                              </FormDescription>
                            </FormItem>
                          )}
                        />
                      </div>

                      <Separator className="bg-white/10" />

                      {/* Access Control */}
                      <div className="space-y-4">
                        <h4 className="text-lg font-medium text-white">Access Control</h4>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-white">IP Whitelisting</Label>
                              <p className="text-sm text-slate-400">Restrict access to specific IP addresses</p>
                            </div>
                            <FormField
                              control={securityForm.control}
                              name="ipWhitelisting"
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Switch
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-white">Audit Logging</Label>
                              <p className="text-sm text-slate-400">Log all user activities</p>
                            </div>
                            <FormField
                              control={securityForm.control}
                              name="auditLogging"
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Switch
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button 
                          type="submit" 
                          className="btn-gaming"
                          disabled={updateSecurityMutation.isPending}
                        >
                          {updateSecurityMutation.isPending ? "Updating..." : "Update Security"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* About */}
            <TabsContent value="about" className="space-y-6 mt-6">
              <Card className="glass-card border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">About CASHPOT ERP</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 gaming-gradient rounded-2xl flex items-center justify-center mx-auto">
                      <span className="text-white text-2xl">🎲</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">CASHPOT ERP 2.0</h3>
                      <p className="text-slate-400">Gaming Management System</p>
                    </div>
                  </div>

                  <Separator className="bg-white/10" />

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-white mb-2">Version Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Version:</span>
                          <span className="text-white">2.0.1</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Build:</span>
                          <span className="text-white">20241225</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Environment:</span>
                          <span className="text-white">Production</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">License:</span>
                          <span className="text-white">Commercial</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-white mb-2">System Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Database:</span>
                          <span className="text-white">PostgreSQL</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Backend:</span>
                          <span className="text-white">Node.js + Express</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Frontend:</span>
                          <span className="text-white">React + TypeScript</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">UI Library:</span>
                          <span className="text-white">Shadcn/UI</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-white/10" />

                  <div>
                    <h4 className="font-semibold text-white mb-2">Features</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm text-slate-300">
                      <div className="flex items-center space-x-2">
                        <span className="text-emerald-500">✓</span>
                        <span>Companies Management</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-emerald-500">✓</span>
                        <span>Locations Tracking</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-emerald-500">✓</span>
                        <span>Equipment Inventory</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-emerald-500">✓</span>
                        <span>Financial Management</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-emerald-500">✓</span>
                        <span>User Management</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-emerald-500">✓</span>
                        <span>ONJN Compliance</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-emerald-500">✓</span>
                        <span>Legal Documentation</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-emerald-500">✓</span>
                        <span>Real-time Dashboard</span>
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-white/10" />

                  <div className="text-center">
                    <p className="text-sm text-slate-400">
                      © 2024 CASHPOT ERP. All rights reserved.
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Professional gaming management solution for the modern industry.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
