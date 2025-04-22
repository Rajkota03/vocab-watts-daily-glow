
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Trash2, Calendar, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { type User } from '../UserManagementDashboard';

interface UserTableProps {
  users: User[];
  loading: boolean;
  onView: (user: User) => void;
  onDelete: (user: User) => void;
}

export const UserTable: React.FC<UserTableProps> = ({ users, loading, onView, onDelete }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 flex justify-center items-center h-64">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin h-8 w-8 border-4 border-[#2DCDA5] border-t-transparent rounded-full"></div>
            <p className="text-muted-foreground">Loading users...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (users.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 flex justify-center items-center h-64">
          <div className="text-center">
            <h3 className="text-lg font-medium">No users found</h3>
            <p className="text-muted-foreground mt-1">Adjust your search or filter criteria</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} className="hover:bg-muted/30">
                <TableCell className="font-medium">
                  {user.first_name} {user.last_name}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={user.is_pro ? 
                      "bg-[#2DCDA5]/10 text-[#2DCDA5] border-[#2DCDA5]/20" : 
                      "bg-gray-100 text-gray-600 border-gray-200"
                    }
                  >
                    {user.is_pro ? 'Pro' : 'Free'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px] block">
                    {user.category || 'N/A'}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{formatDate(user.created_at)}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{formatDate(user.last_active)}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-2 text-[#3F3D56]"
                      onClick={() => onView(user)}
                    >
                      <Eye className="h-4 w-4" />
                      <span className="ml-1.5 hidden sm:inline">View</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-2 text-[#FF6B6B] hover:text-red-700 hover:bg-red-50"
                      onClick={() => onDelete(user)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="ml-1.5 hidden sm:inline">Delete</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};
