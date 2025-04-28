
import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { UserTable } from './users/UserTable';
import { SearchFilterBar } from './users/SearchFilterBar';
import { AddUserButton } from './users/AddUserButton';
import { UserDrawer } from './users/UserDrawer';
import { DeleteUserDialog } from './users/DeleteUserDialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_pro: boolean;
  category: string;
  created_at: string;
  last_active: string;
}

const UserManagementDashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('registration');

  // Action states
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch users
  useEffect(() => {
    fetchUsers();
  }, []);

  // Apply filters
  useEffect(() => {
    applyFilters();
  }, [users, searchQuery, planFilter, categoryFilter, sortBy]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Get profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
      
      if (profilesError) {
        throw profilesError;
      }
      
      // Get subscriptions
      const { data: subscriptions, error: subsError } = await supabase
        .from('user_subscriptions')
        .select('*');
      
      if (subsError) {
        throw subsError;
      }
      
      // Get latest activity from user_word_history
      const { data: activities, error: activitiesError } = await supabase
        .from('user_word_history')
        .select('user_id, date_sent')
        .order('date_sent', { ascending: false });
      
      if (activitiesError) {
        throw activitiesError;
      }
      
      // Create a Map for quick lookups
      const subscriptionMap = new Map();
      subscriptions?.forEach(sub => {
        subscriptionMap.set(sub.user_id, {
          is_pro: sub.is_pro,
          category: sub.category
        });
      });
      
      // Group activities by user_id and take the latest
      const latestActivityMap = new Map();
      activities?.forEach(activity => {
        if (!latestActivityMap.has(activity.user_id) || 
            new Date(activity.date_sent) > new Date(latestActivityMap.get(activity.user_id))) {
          latestActivityMap.set(activity.user_id, activity.date_sent);
        }
      });
      
      // Combine data
      const usersData = profiles?.map(profile => {
        const subscription = subscriptionMap.get(profile.id) || { is_pro: false, category: 'none' };
        const lastActive = latestActivityMap.get(profile.id) || profile.created_at;
        
        return {
          id: profile.id,
          email: profile.email,
          first_name: profile.first_name,
          last_name: profile.last_name,
          is_pro: subscription.is_pro,
          category: subscription.category,
          created_at: profile.created_at,
          last_active: lastActive
        };
      });
      
      setUsers(usersData || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...users];
    
    // Apply search filter
    if (searchQuery) {
      result = result.filter(user => 
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply plan filter
    if (planFilter !== 'all') {
      const isPro = planFilter === 'pro';
      result = result.filter(user => user.is_pro === isPro);
    }
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      result = result.filter(user => user.category === categoryFilter);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      if (sortBy === 'registration') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else { // last_active
        return new Date(b.last_active).getTime() - new Date(a.last_active).getTime();
      }
    });
    
    setFilteredUsers(result);
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsDrawerOpen(true);
  };

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      setIsDeleting(true);
      
      // First delete the user's subscription
      const { error: subError } = await supabase
        .from('user_subscriptions')
        .delete()
        .eq('user_id', selectedUser.id);
      
      if (subError) {
        console.error('Error deleting subscription:', subError);
        throw subError;
      }
      
      // Delete the user's word history
      const { error: historyError } = await supabase
        .from('user_word_history')
        .delete()
        .eq('user_id', selectedUser.id);
      
      if (historyError) {
        console.error('Error deleting word history:', historyError);
        throw historyError;
      }
      
      // Delete the user's roles
      const { error: roleError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', selectedUser.id);
      
      if (roleError) {
        console.error('Error deleting roles:', roleError);
        throw roleError;
      }
      
      // Finally delete the profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', selectedUser.id);
        
      if (profileError) throw profileError;
      
      // Update local state
      setUsers(prevUsers => prevUsers.filter(user => user.id !== selectedUser.id));
      
      toast({
        title: "Success",
        description: `User ${selectedUser.email} has been deleted.`,
      });
      
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
      
      // Trigger a refresh of the AdminDashboard to update subscriptions tab
      const event = new CustomEvent('userDeleted', { detail: { userId: selectedUser.id } });
      window.dispatchEvent(event);
      
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddUser = async (userData: Omit<User, 'id' | 'created_at' | 'last_active'>) => {
    try {
      // In a real implementation, you would call an API to create the user in auth system
      // For demo purposes, we'll just add to profiles
      
      // Generate a UUID for the new user using our edge function
      const { data: uuidResponse, error: uuidError } = await supabase.functions.invoke('generate_uuid');
      
      if (uuidError) throw uuidError;
      
      const new_id = uuidResponse.uuid;
      
      // Create a new profile
      const { data: newProfile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: new_id, // Use the generated UUID
          first_name: userData.first_name,
          last_name: userData.last_name,
          email: userData.email,
          whatsapp_number: '', // Required field
          nick_name: `${userData.first_name.charAt(0)}${userData.last_name.charAt(0)}`
        })
        .select()
        .single();
        
      if (profileError) throw profileError;
      
      // Create subscription
      const { error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: newProfile.id,
          is_pro: userData.is_pro,
          category: userData.category,
          phone_number: '',  // Required field
        });
        
      if (subscriptionError) throw subscriptionError;
      
      // Refresh the user list
      fetchUsers();
      
      toast({
        title: "Success",
        description: "New user has been added successfully.",
      });
      
    } catch (error) {
      console.error('Error adding user:', error);
      toast({
        title: "Error",
        description: "Failed to add user. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <AdminLayout activeTab="users" setActiveTab={() => {}}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-[#3F3D56]">User Management</h2>
            <p className="text-muted-foreground">
              Search, filter, add, or delete users
            </p>
          </div>
          <AddUserButton onAddUser={handleAddUser} />
        </div>
        
        <SearchFilterBar 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          planFilter={planFilter}
          setPlanFilter={setPlanFilter}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />
        
        <UserTable 
          users={filteredUsers}
          loading={loading}
          onView={handleViewUser}
          onDelete={handleDeleteClick}
        />
        
        <UserDrawer 
          user={selectedUser}
          open={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
        />
        
        <DeleteUserDialog 
          user={selectedUser}
          open={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onDelete={handleDeleteUser}
          isDeleting={isDeleting}
        />
      </div>
    </AdminLayout>
  );
};

export default UserManagementDashboard;
