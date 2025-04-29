
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";

interface DeleteSubscriptionHandlerProps {
  subscription: {
    id: string;
    user_id?: string | null;
  };
  onDeleted: () => void;
  onError: (error: Error) => void;
}

export const DeleteSubscriptionHandler = ({ 
  subscription, 
  onDeleted,
  onError
}: DeleteSubscriptionHandlerProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  
  const handleDeleteClick = async () => {
    if (!confirm('Are you sure you want to delete this subscription? This action cannot be undone.')) {
      return;
    }
    
    setIsDeleting(true);
    
    try {
      // Delete the subscription
      const { error } = await supabase
        .from('user_subscriptions')
        .delete()
        .eq('id', subscription.id);
        
      if (error) throw error;
      
      console.log(`Subscription with ID ${subscription.id} deleted successfully`);
      
      // Dispatch a custom event that SubscriptionsTab can listen to
      const event = new CustomEvent('subscriptionDeleted', {
        detail: { subscriptionId: subscription.id }
      });
      window.dispatchEvent(event);
      
      toast({
        title: "Success",
        description: "Subscription deleted successfully"
      });
      
      onDeleted();
    } catch (error: any) {
      console.error('Error deleting subscription:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete subscription",
        variant: "destructive"
      });
      onError(error);
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <Button 
      onClick={handleDeleteClick}
      variant="destructive"
      size="sm"
      disabled={isDeleting}
    >
      {isDeleting ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Deleting...
        </>
      ) : (
        <>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </>
      )}
    </Button>
  );
};
