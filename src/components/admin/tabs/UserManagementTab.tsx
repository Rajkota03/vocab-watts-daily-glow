
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

// Mock data - in a real application, this would come from your API
const users = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    status: 'pro',
    category: 'business-intermediate',
    joinedDate: '2024-01-15',
    lastActive: '2024-04-20',
  },
  {
    id: '2',
    name: 'Alex Chen',
    email: 'alex.c@example.com',
    status: 'free',
    category: 'exam-gre',
    joinedDate: '2024-02-20',
    lastActive: '2024-04-21',
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    email: 'emily.r@example.com',
    status: 'pro',
    category: 'daily-intermediate',
    joinedDate: '2024-03-05',
    lastActive: '2024-04-18',
  },
  {
    id: '4',
    name: 'Mohammed Ali',
    email: 'mohammed.a@example.com',
    status: 'free',
    category: 'slang-intermediate',
    joinedDate: '2024-02-10',
    lastActive: '2024-04-15',
  },
  {
    id: '5',
    name: 'Jessica Kim',
    email: 'jessica.k@example.com',
    status: 'pro',
    category: 'business-advanced',
    joinedDate: '2024-01-25',
    lastActive: '2024-04-22',
  },
];

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const UserManagementTab = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
        <p className="text-muted-foreground">
          Manage and monitor user accounts.
        </p>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name, email, or category..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button className="ml-4">
              Export
            </Button>
          </div>
          
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={
                          user.status === 'pro' 
                            ? 'bg-vuilder-mint/10 text-vuilder-mint hover:bg-vuilder-mint/20 hover:text-vuilder-mint' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-700'
                        }
                      >
                        {user.status === 'pro' ? 'Pro' : 'Free'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[150px] truncate" title={user.category}>
                        {user.category}
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(user.joinedDate)}</TableCell>
                    <TableCell>{formatDate(user.lastActive)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm">View</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagementTab;
