
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search, Shield, UserCheck, AlertCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

type UserWithRoles = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  roles: string[];
};

// Define a type for the app_role enum
type AppRole = "admin" | "moderator" | "user";

const UserRolesTab = () => {
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
      
      if (profilesError) throw profilesError;
      
      // Fetch all user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');
      
      if (rolesError) throw rolesError;
      
      // Map roles to users
      const usersWithRoles = profiles?.map(profile => {
        const userRolesList = userRoles
          ?.filter(role => role.user_id === profile.id)
          .map(role => role.role) || [];
        
        return {
          id: profile.id,
          email: profile.email,
          first_name: profile.first_name,
          last_name: profile.last_name,
          roles: userRolesList
        };
      });
      
      setUsers(usersWithRoles || []);
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
        // Add role
        const { error } = await supabase
          .from('user_roles')
          .insert({
            user_id: userId,
            role: role
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
      
      // Refresh the user list
      fetchUsers();
    } catch (error: any) {
      console.error('Error updating role:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update role.",
        variant: "destructive"
      });
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">User Roles</h2>
        <p className="text-muted-foreground">
          Manage user roles and permissions.
        </p>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>User Roles Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search users..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button className="ml-4" onClick={fetchUsers}>
              Refresh
            </Button>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin h-8 w-8 border-4 border-vuilder-indigo border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.first_name} {user.last_name}</div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          {user.roles.includes('admin') && (
                            <Badge className="bg-red-100 text-red-800 hover:bg-red-200 flex items-center gap-1">
                              <Shield className="h-3 w-3" />
                              Admin
                            </Badge>
                          )}
                          {user.roles.includes('moderator') && (
                            <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              Moderator
                            </Badge>
                          )}
                          {user.roles.includes('user') && (
                            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 flex items-center gap-1">
                              <UserCheck className="h-3 w-3" />
                              User
                            </Badge>
                          )}
                          {user.roles.length === 0 && (
                            <span className="text-gray-500 text-sm">No roles</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Select 
                            onValueChange={(value) => {
                              // Cast the value to AppRole type
                              const roleValue = value as AppRole;
                              const action = user.roles.includes(value) ? 'remove' : 'add';
                              updateUserRole(user.id, roleValue, action);
                            }}
                          >
                            <SelectTrigger className="w-[180px]">
                              <span>Manage roles</span>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">
                                {user.roles.includes('admin') ? 'Remove Admin Role' : 'Add Admin Role'}
                              </SelectItem>
                              <SelectItem value="moderator">
                                {user.roles.includes('moderator') ? 'Remove Moderator Role' : 'Add Moderator Role'}
                              </SelectItem>
                              <SelectItem value="user">
                                {user.roles.includes('user') ? 'Remove User Role' : 'Add User Role'}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserRolesTab;
