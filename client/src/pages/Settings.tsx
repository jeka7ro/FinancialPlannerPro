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
import { Settings as SettingsIcon, User, Shield, Info, Search, Save } from "lucide-react";

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
      {/* Enhanced Header */}
      <Card className="search-card">
        <CardContent className="p-6">
          <div className="search-header">
            <div className="search-icon-section">
              <div className="search-icon-wrapper">
                <span className="search-icon">⚙️</span>
              </div>
              <div>
                <h3 className="search-title">System Settings</h3>
                <p className="search-subtitle">Configure system preferences and user account settings</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Settings Tabs */}
      <Card className="data-table">
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8 bg-slate-800/50 p-1 rounded-xl">
              <TabsTrigger 
                value="profile" 
                className="flex items-center gap-2 text-slate-400 data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400 rounded-lg transition-all duration-200"
              >
                <User className="w-4 h-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger 
                value="system" 
                className="flex items-center gap-2 text-slate-400 data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400 rounded-lg transition-all duration-200"
              >
                                 <SettingsIcon className="w-4 h-4" />
                 System
               </TabsTrigger>
               <TabsTrigger 
                 value="security" 
                 className="flex items-center gap-2 text-slate-400 data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400 rounded-lg transition-all duration-200"
               >
                 <Shield className="w-4 h-4" />
                 Security
               </TabsTrigger>
               <TabsTrigger 
                 value="about" 
                 className="flex items-center gap-2 text-slate-400 data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400 rounded-lg transition-all duration-200"
               >
                 <Info className="w-4 h-4" />
                 About
               </TabsTrigger>
             </TabsList>

             {/* Profile Settings */}
             <TabsContent value="profile" className="space-y-6 mt-6">
               <Card className="glass-card border-white/10">
                 <CardHeader className="border-b border-white/10">
                   <CardTitle className="text-white flex items-center gap-2">
                     <User className="w-5 h-5" />
                     Profile Information
                   </CardTitle>
                 </CardHeader>
                 <CardContent className="p-6">
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
                           className="btn-primary"
                           disabled={updateProfileMutation.isPending}
                         >
                           <Save className="w-4 h-4 mr-2" />
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
                 <CardHeader className="border-b border-white/10">
                   <CardTitle className="text-white flex items-center gap-2">
                     <SettingsIcon className="w-5 h-5" />
                    System Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
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

                      {/* Notifications */}
                      <div className="space-y-4">
                        <h4 className="text-lg font-medium text-white">Notifications</h4>
                        <div className="space-y-4">
                          <FormField
                            control={systemForm.control}
                            name="enableNotifications"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border border-white/10 p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base text-white">
                                    Desktop Notifications
                                  </FormLabel>
                                                                     <FormDescription>
                                     Receive desktop notifications for important events
                                   </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={systemForm.control}
                            name="enableEmailAlerts"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border border-white/10 p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base text-white">
                                    Email Alerts
                                  </FormLabel>
                                                                     <FormDescription>
                                     Receive email notifications for system alerts
                                   </FormDescription>
                                </div>
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

                      <div className="flex justify-end">
                        <Button 
                          type="submit" 
                          className="btn-primary"
                          disabled={updateSystemMutation.isPending}
                        >
                          <Save className="w-4 h-4 mr-2" />
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
                <CardHeader className="border-b border-white/10">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Security Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <Form {...securityForm}>
                    <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)} className="space-y-6">
                      <div className="space-y-4">
                        <FormField
                          control={securityForm.control}
                          name="twoFactorEnabled"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border border-white/10 p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base text-white">
                                  Two-Factor Authentication
                                </FormLabel>
                                                                 <FormDescription>
                                   Add an extra layer of security to your account
                                 </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={securityForm.control}
                          name="auditLogging"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border border-white/10 p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base text-white">
                                  Audit Logging
                                </FormLabel>
                                                                 <FormDescription>
                                   Log all user actions for security auditing
                                 </FormDescription>
                              </div>
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

                      <div className="flex justify-end">
                        <Button 
                          type="submit" 
                          className="btn-primary"
                          disabled={updateSecurityMutation.isPending}
                        >
                          <Save className="w-4 h-4 mr-2" />
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
                <CardHeader className="border-b border-white/10">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Info className="w-5 h-5" />
                    System Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-slate-400 mb-2">Application</h4>
                      <p className="text-white font-semibold">CASHPOT ERP</p>
                      <p className="text-slate-300 text-sm">Gaming Management System</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-slate-400 mb-2">Version</h4>
                      <p className="text-white font-semibold">2.0.0</p>
                      <p className="text-slate-300 text-sm">Build 2024.06.27</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-slate-400 mb-2">License</h4>
                      <p className="text-white font-semibold">Commercial</p>
                      <p className="text-slate-300 text-sm">Licensed to Organization</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-slate-400 mb-2">Support</h4>
                      <p className="text-white font-semibold">24/7 Available</p>
                      <p className="text-slate-300 text-sm">Premium Support Plan</p>
                    </div>
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
