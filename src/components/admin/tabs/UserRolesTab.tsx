
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader as DialogHeaderUI, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Shield, UserPlus, UserMinus } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

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

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data: profiles, error: profilesError } = await supabase.from('profiles').select('*');
      if (profilesError) throw profilesError;

      const { data: userRoles, error: rolesError } = await supabase.from('user_roles').select('*');
      if (rolesError) throw rolesError;

      const usersWithRoles = profiles?.map(profile => {
        const userRolesList = userRoles
          ?.filter(role => role.user_id === profile.id)
          .map(role => role.role) || [];

        return {
          id: profile.id,
          email: profile.email,
          first_name: profile.first_name,
          last_name: profile.last_name,
          roles: userRolesList,
        };
      });

      setUsers(usersWithRoles || []);
      const adminUsersList = usersWithRoles?.filter(user => user.roles.includes('admin')) || [];
      setAdminUsers(adminUsersList);

    } catch (error) {
      console.error('Error fetching users and roles:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users and roles.",
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

  // Filter for user search in dialog (only non-admins)
  const eligibleUsers = users
    .filter(u => !u.roles.includes('admin'))
    .filter(u =>
      (u.email.toLowerCase().includes(selectUserSearch.toLowerCase()) ||
      `${u.first_name} ${u.last_name}`.toLowerCase().includes(selectUserSearch.toLowerCase()))
    );

  // For Admin table search (all admins)
  const filteredAdminUsers = adminUsers.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <div className="mb-3">
            <Input
              placeholder="Search user by name or email"
              value={selectUserSearch}
              onChange={e => setSelectUserSearch(e.target.value)}
              autoFocus
            />
          </div>
          <div className="max-h-64 overflow-y-auto space-y-1.5">
            {eligibleUsers.length === 0 && (
              <div className="text-muted-foreground py-4 text-center">
                No eligible users found.
              </div>
            )}
            {eligibleUsers.map(user => (
              <div
                className="flex items-center justify-between border rounded-md p-2 hover:bg-muted cursor-pointer transition"
                key={user.id}
              >
                <div>
                  <div className="font-medium">{user.first_name} {user.last_name}</div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                </div>
                <Button
                  size="sm"
                  className="bg-[#2DCDA5] hover:bg-[#29B896] text-white"
                  disabled={addInProgress}
                  onClick={() => updateUserRole(user.id, "admin", "add")}
                >
                  <UserPlus className="h-4 w-4" />
                  Add Admin
                </Button>
              </div>
            ))}
          </div>
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
              Are you sure you want to remove admin rights from <span className="font-semibold">{removeDialogOpen.user?.first_name} {removeDialogOpen.user?.last_name} ({removeDialogOpen.user?.email})</span>? This will not delete the user.
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

      {/* Admin Users Table */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin h-8 w-8 border-4 border-vuilder-indigo border-t-transparent rounded-full"></div>
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
                          <div className="font-medium">{user.first_name} {user.last_name}</div>
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
    </div>
  );
};

export default UserRolesTab;
