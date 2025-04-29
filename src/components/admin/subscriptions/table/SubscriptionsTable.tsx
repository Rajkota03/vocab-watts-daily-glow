
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Pencil } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type Subscription = Database['public']['Tables']['user_subscriptions']['Row'];

interface SubscriptionsTableProps {
  subscriptions: Subscription[];
  loading: boolean;
  onEdit: (subscription: Subscription) => void;
}

export function SubscriptionsTable({ subscriptions, loading, onEdit }: SubscriptionsTableProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  if (loading) {
    return (
      <div className="text-center py-8 flex justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading subscriptions...</p>
        </div>
      </div>
    );
  }
  
  if (subscriptions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">No subscriptions found</div>
    );
  }
  
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Phone</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Trial Ends</TableHead>
            <TableHead>Subscription Ends</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscriptions.map((sub) => (
            <TableRow key={sub.id} className="hover:bg-gray-50">
              <TableCell>{sub.phone_number}</TableCell>
              <TableCell>
                <Badge className={
                  sub.is_pro 
                    ? 'bg-[#3F3D56]/10 text-[#3F3D56]' 
                    : 'bg-[#2DCDA5]/10 text-[#2DCDA5]'
                }>
                  {sub.is_pro ? 'Pro' : 'Free Trial'}
                </Badge>
              </TableCell>
              <TableCell>{sub.category || '—'}</TableCell>
              <TableCell>{formatDate(sub.created_at)}</TableCell>
              <TableCell>{formatDate(sub.trial_ends_at)}</TableCell>
              <TableCell>{formatDate(sub.subscription_ends_at)}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(sub)}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
