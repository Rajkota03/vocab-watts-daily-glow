
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader as DialogHeaderUI, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Shield, UserPlus, UserMinus, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

type UserWithRoles = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  roles: string[];
};

type AppRole = "admin" | "moderator" | "user";

const UserRolesTab = () => {
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [adminUsers, setAdminUsers] = useState<UserWithRoles[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState<{ open: boolean; user: UserWithRoles | null }>({ open: false, user: null });
  const [selectUserSearch, setSelectUserSearch] = useState('');
  const [addInProgress, setAddInProgress] = useState(false);
  const [noUsers, setNoUsers] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setDebugInfo('Fetching users...');
      
      // First get all users from auth schema using the auth.users() function
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.error('Error fetching auth users:', authError);
        setDebugInfo(prev => prev + `\nError fetching auth users: ${authError.message}`);
        
        // Fallback to getting profiles directly if we can't use auth.admin
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*');
        
        if (profilesError || !profiles || profiles.length === 0) {
          console.error('Error fetching profiles or no profiles found:', profilesError);
          setDebugInfo(prev => prev + `\nError fetching profiles: ${profilesError?.message || 'No profiles found'}`);
          setNoUsers(true);
          setUsers([]);
          setAdminUsers([]);
          setLoading(false);
          return;
        }
        
        console.log('Fallback: Profiles fetched:', profiles.length);
        setDebugInfo(prev => prev + `\nFallback: Profiles fetched: ${profiles.length}`);
        
        // Continue with profiles data
        processUserData(profiles);
      } else {
        // Process data from auth.users
        if (!authUsers || authUsers.users.length === 0) {
          console.log('No auth users found');
          setDebugInfo(prev => prev + '\nNo auth users found');
          setNoUsers(true);
          setUsers([]);
          setAdminUsers([]);
          setLoading(false);
          return;
        }
        
        console.log('Auth users fetched:', authUsers.users.length);
        setDebugInfo(prev => prev + `\nAuth users fetched: ${authUsers.users.length}`);
        
        const simplifiedUsers = authUsers.users.map(user => ({
          id: user.id,
          email: user.email || '',
          first_name: user.user_metadata?.first_name || '',
          last_name: user.user_metadata?.last_name || '',
        }));
        
        processUserData(simplifiedUsers);
      }
    } catch (error: any) {
      console.error('Error in fetchUsers:', error);
      setDebugInfo(prev => prev + `\nError in fetchUsers: ${error.message}`);
      
      // Fallback to profiles table as last resort
      try {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*');
        
        if (profilesError || !profiles || profiles.length === 0) {
          console.error('Last resort fallback failed:', profilesError);
          setDebugInfo(prev => prev + `\nLast resort fallback failed: ${profilesError?.message || 'No profiles found'}`);
          setNoUsers(true);
          setLoading(false);
          return;
        }
        
        processUserData(profiles);
      } catch (finalError: any) {
        console.error('Fatal error fetching users:', finalError);
        setDebugInfo(prev => prev + `\nFatal error: ${finalError.message}`);
        toast({
          title: "Error",
          description: "Failed to fetch users. Please check console for details.",
          variant: "destructive"
        });
        setNoUsers(true);
        setLoading(false);
      }
    }
  };
  
  const processUserData = async (userData: any[]) => {
    try {
      // Get all user roles
      const { data: userRoles, error: rolesError } = await supabase.from('user_roles').select('*');
      
      if (rolesError) {
        console.error('Error fetching user roles:', rolesError);
        setDebugInfo(prev => prev + `\nError fetching user roles: ${rolesError.message}`);
        throw rolesError;
      }

      console.log('User roles fetched:', userRoles?.length || 0);
      setDebugInfo(prev => prev + `\nUser roles fetched: ${userRoles?.length || 0}`);

      // Map roles to users
      const usersWithRoles = userData.map(user => {
        const userRolesList = userRoles
          ?.filter(role => role.user_id === user.id)
          .map(role => role.role) || [];

        return {
          id: user.id,
          email: user.email || '',
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          roles: userRolesList,
        };
      });

      console.log('Total users mapped:', usersWithRoles.length);
      setDebugInfo(prev => prev + `\nTotal users mapped: ${usersWithRoles.length}`);
      
      setUsers(usersWithRoles);
      const adminUsersList = usersWithRoles.filter(user => user.roles.includes('admin')) || [];
      setAdminUsers(adminUsersList);
      setNoUsers(usersWithRoles.length === 0);
      
      console.log('Admin users:', adminUsersList.length);
      setDebugInfo(prev => prev + `\nAdmin users: ${adminUsersList.length}`);
      
    } catch (error: any) {
      console.error('Error processing user data:', error);
      setDebugInfo(prev => prev + `\nError processing user data: ${error.message}`);
      toast({
        title: "Error",
        description: "Failed to process user data. Please check console for details.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, role: AppRole, action: 'add' | 'remove') => {
    try {
      if (action === 'add') {
        setAddInProgress(true);
        // Add role
        const { error } = await supabase
          .from('user_roles')
          .insert({
            user_id: userId,
            role: role,
          });

        if (error) throw error;
        toast({
          title: "Role Updated",
          description: `Added ${role} role successfully.`,
        });
      } else {
        // Remove role
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', role);

        if (error) throw error;

        toast({
          title: "Role Updated",
          description: `Removed ${role} role successfully.`,
        });
      }
      setAddDialogOpen(false);
      setRemoveDialogOpen({ open: false, user: null });
      setSelectUserSearch('');
      fetchUsers();
    } catch (error: any) {
      console.error('Error updating role:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update role.",
        variant: "destructive"
      });
    } finally {
      setAddInProgress(false);
    }
  };

  // Filter for user search in dialog - showing all users who don't have admin role
  const eligibleUsers = users
    .filter(u => !u.roles.includes('admin'))
    .filter(u =>
      (u.email?.toLowerCase().includes(selectUserSearch.toLowerCase()) ||
      `${u.first_name || ''} ${u.last_name || ''}`.toLowerCase().includes(selectUserSearch.toLowerCase()))
    );

  // For Admin table search (all admins)
  const filteredAdminUsers = adminUsers.filter(user =>
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Show debug information in development mode
  const showDebugInfo = process.env.NODE_ENV === 'development';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Users with Admin Roles</h2>
        <p className="text-muted-foreground">
          Here are the users currently with admin permissions.
        </p>
      </div>

      {/* Add Admin User Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogTrigger asChild>
          <Button
            className="bg-[#2DCDA5] hover:bg-[#29B896] text-white"
            onClick={() => setAddDialogOpen(true)}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Admin
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeaderUI>
            <DialogTitle>Add an Admin User</DialogTitle>
            <DialogDescription>
              Select a user to grant admin privileges.
            </DialogDescription>
          </DialogHeaderUI>
          
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-[#2DCDA5]" />
            </div>
          ) : noUsers || users.length === 0 ? (
            <Alert className="bg-amber-50 border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <AlertTitle className="text-amber-800">No registered users found</AlertTitle>
              <AlertDescription className="text-amber-700">
                There are no registered users in the system yet. Users need to sign up first before they can be assigned admin roles.
              </AlertDescription>
            </Alert>
          ) : eligibleUsers.length === 0 ? (
            <div>
              <div className="mb-3">
                <Input
                  placeholder="Search user by name or email"
                  value={selectUserSearch}
                  onChange={e => setSelectUserSearch(e.target.value)}
                  autoFocus
                />
              </div>
              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-500" />
                <AlertTitle className="text-blue-800">No eligible users found</AlertTitle>
                <AlertDescription className="text-blue-700">
                  All existing users may already have admin privileges or no users match your search.
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <>
              <div className="mb-3">
                <Input
                  placeholder="Search user by name or email"
                  value={selectUserSearch}
                  onChange={e => setSelectUserSearch(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="max-h-64 overflow-y-auto space-y-1.5">
                {eligibleUsers.map(user => (
                  <div
                    className="flex items-center justify-between border rounded-md p-2 hover:bg-muted cursor-pointer transition"
                    key={user.id}
                  >
                    <div>
                      <div className="font-medium">
                        {user.first_name || user.last_name ? 
                          `${user.first_name || ''} ${user.last_name || ''}` : 
                          'User'}
                      </div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                    <Button
                      size="sm"
                      className="bg-[#2DCDA5] hover:bg-[#29B896] text-white"
                      disabled={addInProgress}
                      onClick={() => updateUserRole(user.id, "admin", "add")}
                    >
                      <UserPlus className="h-4 w-4 mr-1" />
                      Add Admin
                    </Button>
                  </div>
                ))}
              </div>
            </>
          )}
          
          <Alert className="bg-blue-50 border-blue-200">
            <AlertTitle className="text-blue-800">How do users get registered?</AlertTitle>
            <AlertDescription className="text-blue-700">
              Users need to sign up through the application's registration page. Only registered users can be assigned admin roles.
            </AlertDescription>
          </Alert>
        </DialogContent>
      </Dialog>

      {/* Remove Admin User Dialog */}
      <Dialog
        open={removeDialogOpen.open}
        onOpenChange={open =>
          setRemoveDialogOpen(prev => ({ ...prev, open }))
        }
      >
        <DialogContent>
          <DialogHeaderUI>
            <DialogTitle>Remove Admin Privilege</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove admin rights from <span className="font-semibold">{removeDialogOpen.user?.first_name || ''} {removeDialogOpen.user?.last_name || ''} ({removeDialogOpen.user?.email})</span>? This will not delete the user.
            </DialogDescription>
          </DialogHeaderUI>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveDialogOpen({ open: false, user: null })}>
              Cancel
            </Button>
            <Button
              className="bg-red-500 text-white hover:bg-red-700"
              onClick={() =>
                removeDialogOpen.user &&
                updateUserRole(removeDialogOpen.user.id, "admin", "remove")
              }
            >
              <UserMinus className="h-4 w-4 mr-2" />
              Remove Admin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Debug Information (only in development) */}
      {showDebugInfo && (
        <Alert className="bg-gray-100 border-gray-200 font-mono text-xs">
          <AlertTitle className="text-gray-800">Debug Information</AlertTitle>
          <AlertDescription className="text-gray-700 whitespace-pre-wrap">
            {debugInfo}
          </AlertDescription>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2" 
            onClick={() => fetchUsers()}
          >
            Refresh Data
          </Button>
        </Alert>
      )}

      {/* Admin Users Table */}
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-[#2DCDA5]" />
        </div>
      ) : (
        <Card>
          <CardHeader className="pb-2 flex flex-col md:flex-row md:items-center md:justify-between">
            <CardTitle>
              Admin Users ({filteredAdminUsers.length})
            </CardTitle>
            <div className="flex items-center gap-2 mt-3 md:mt-0">
              <Input
                type="text"
                placeholder="Search admins..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="max-w-xs"
              />
            </div>
          </CardHeader>
          <CardContent>
            {filteredAdminUsers.length > 0 ? (
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="text-right">Roles</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAdminUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="font-medium">
                            {user.first_name || user.last_name ? 
                              `${user.first_name || ''} ${user.last_name || ''}` : 
                              'User'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-gray-500">{user.email}</div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge className="bg-red-100 text-red-800 hover:bg-red-200 flex items-center gap-1 whitespace-nowrap">
                            <Shield className="h-3 w-3" />
                            Admin
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="icon"
                            className="hover:bg-red-50 text-red-600"
                            title="Remove admin"
                            onClick={() =>
                              setRemoveDialogOpen({ open: true, user })
                            }
                          >
                            <UserMinus className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                No admin users found.
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Information for admins */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800 text-lg">How Admin Access Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-blue-700 space-y-2">
            <p>
              <strong>Who can be an admin?</strong> Only users who have registered accounts in the system can be assigned admin roles.
            </p>
            <p>
              <strong>Why don't I see any users?</strong> If you don't see any eligible users, it means there are no registered users in the system yet, or all users already have admin privileges.
            </p>
            <p>
              <strong>How to add users?</strong> Users need to sign up through the registration page. You cannot manually create user accounts from this admin panel.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserRolesTab;
