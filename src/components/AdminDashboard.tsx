
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Database } from '@/integrations/supabase/types';

// Define types based on our database schema
type Subscription = Database['public']['Tables']['user_subscriptions']['Row'];

const AdminDashboard = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching subscriptions:', error);
        toast({
          title: "Failed to load subscriptions",
          description: error.message,
          variant: "destructive"
        });
      } else {
        setSubscriptions(data || []);
      }
    } catch (error) {
      console.error('Error in fetchSubscriptions:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: "Error loading data",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Subscriptions</h2>
        <Button 
          onClick={fetchSubscriptions} 
          variant="outline" 
          size="sm"
          disabled={loading}
        >
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading subscriptions...</div>
      ) : subscriptions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No subscriptions found</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Phone</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Plan</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Category</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Created</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Trial Ends</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {subscriptions.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{sub.phone_number}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${sub.is_pro ? 'bg-vocab-purple/10 text-vocab-purple' : 'bg-vocab-teal/10 text-vocab-teal'}`}>
                      {sub.is_pro ? 'Pro' : 'Free Trial'}
                    </span>
                  </td>
                  <td className="px-4 py-3">{sub.category || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(sub.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {sub.trial_ends_at ? new Date(sub.trial_ends_at).toLocaleDateString() : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
