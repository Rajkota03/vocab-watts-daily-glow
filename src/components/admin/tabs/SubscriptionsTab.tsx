
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from "@/hooks/use-toast";
import { Database } from '@/integrations/supabase/types';
import { EditSubscriptionDialog } from '../subscriptions/EditSubscriptionDialog';
import { SubscriptionMetricsGrid } from '../subscriptions/metrics/SubscriptionMetricsGrid';
import { SubscriptionChartsGrid } from '../subscriptions/charts/SubscriptionChartsGrid';
import { SubscriptionsTable } from '../subscriptions/table/SubscriptionsTable';
import { useSubscriptionsData } from '@/hooks/useSubscriptionsData';

type Subscription = Database['public']['Tables']['user_subscriptions']['Row'];

const SubscriptionsTab = () => {
  const { 
    subscriptions, 
    metrics, 
    conversionData, 
    loading, 
    refreshData 
  } = useSubscriptionsData();
  
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  useEffect(() => {
    // Listen for user deletion events
    const handleUserDeleted = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      console.log("User deleted event received in SubscriptionsTab", detail);
      
      if (detail && detail.userId) {
        console.log("Removing subscription for user:", detail.userId);
        
        // Close the dialog if it was open for the deleted subscription
        if (selectedSubscription && selectedSubscription.user_id === detail.userId) {
          setEditDialogOpen(false);
          setSelectedSubscription(null);
        }
        
        // Refresh data to ensure consistency
        refreshData();
        
        // Show confirmation toast
        toast({
          title: "Success",
          description: `User and subscription deleted successfully`,
          variant: "success"
        });
      }
    };
    
    // Listen for standalone subscription deletion events
    const handleSubscriptionDeleted = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      console.log("Subscription deleted event received in SubscriptionsTab", detail);
      
      if (detail && detail.subscriptionId) {
        console.log("Subscription deleted:", detail.subscriptionId);
        
        // Close the dialog if it was open for the deleted subscription
        if (selectedSubscription && selectedSubscription.id === detail.subscriptionId) {
          setEditDialogOpen(false);
          setSelectedSubscription(null);
        }
        
        // Refresh data to ensure consistency
        refreshData();
        
        // Show confirmation toast
        toast({
          title: "Success",
          description: "Subscription deleted successfully",
          variant: "success"
        });
      }
    };
    
    window.addEventListener('userDeleted', handleUserDeleted);
    window.addEventListener('subscriptionDeleted', handleSubscriptionDeleted);
    
    return () => {
      window.removeEventListener('userDeleted', handleUserDeleted);
      window.removeEventListener('subscriptionDeleted', handleSubscriptionDeleted);
    };
  }, [selectedSubscription, refreshData]);

  const handleEditSubscription = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setEditDialogOpen(true);
  };

  const handleSubscriptionUpdated = () => {
    refreshData();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Subscription Analytics</h2>
        <p className="text-muted-foreground">
          Track subscription metrics and conversion rates.
        </p>
      </div>

      <SubscriptionMetricsGrid metrics={metrics} />
      
      <SubscriptionChartsGrid 
        conversionData={conversionData} 
        proSubscriptions={subscriptions.filter(s => s.is_pro).length} 
        totalSubscriptions={subscriptions.length} 
      />

      <Card>
        <CardHeader className="flex justify-between">
          <CardTitle>Subscriptions</CardTitle>
        </CardHeader>
        <CardContent>
          <SubscriptionsTable 
            subscriptions={subscriptions}
            loading={loading}
            onEdit={handleEditSubscription}
          />
        </CardContent>
      </Card>

      <EditSubscriptionDialog
        subscription={selectedSubscription}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSubscriptionUpdated={handleSubscriptionUpdated}
        onDelete={handleSubscriptionUpdated}
      />
    </div>
  );
};

export default SubscriptionsTab;
