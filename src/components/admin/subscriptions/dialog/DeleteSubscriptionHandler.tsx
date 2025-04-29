
import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle } from 'lucide-react';

interface DeleteSubscriptionHandlerProps {
  subscription: {
    id: string;
    user_id?: string | null;
    phone_number: string;
  } | null;
  onDeleted: () => void;
  onError: (error: Error) => void;
  disabled?: boolean;
}

export function DeleteSubscriptionHandler({ 
  subscription, 
  onDeleted, 
  onError,
  disabled = false 
}: DeleteSubscriptionHandlerProps) {
  const [isDeleting, setIsDeleting] = React.useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!subscription) return;
    setIsDeleting(true);
    
    try {
      console.log("Starting deletion process for subscription:", subscription.id);
      
      // If this is linked to a user, we need to perform a full user deletion
      if (subscription.user_id) {
        console.log("Deleting user with ID:", subscription.user_id);
        
        // Delete the user's subscription first
        const { error: subError, data: subData } = await supabase
          .from('user_subscriptions')
          .delete()
          .eq('user_id', subscription.user_id)
          .select();
          
        if (subError) {
          console.error('Error deleting subscription:', subError);
          throw subError;
        }
        
        console.log("Successfully deleted subscription:", subData);
        
        // Delete the user's word history
        const { error: historyError } = await supabase
          .from('user_word_history')
          .delete()
          .eq('user_id', subscription.user_id);
        
        if (historyError) {
          console.error('Error deleting word history:', historyError);
          // Continue with deletion even if this fails
        }
        
        // Delete the user's roles
        const { error: roleError } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', subscription.user_id);
        
        if (roleError) {
          console.error('Error deleting roles:', roleError);
          // Continue with deletion even if this fails
        }
        
        // Delete the user's sent words
        const { error: sentWordsError } = await supabase
          .from('sent_words')
          .delete()
          .eq('user_id', subscription.user_id);
        
        if (sentWordsError) {
          console.error('Error deleting sent words:', sentWordsError);
          // Continue with deletion even if this fails
        }
        
        // Delete any scheduled messages
        const { error: scheduledError } = await supabase
          .from('scheduled_messages')
          .delete()
          .eq('user_id', subscription.user_id);
        
        if (scheduledError) {
          console.error('Error deleting scheduled messages:', scheduledError);
          // Continue with deletion even if this fails
        }
        
        // Finally delete the profile
        const { error: profileError } = await supabase
          .from('profiles')
          .delete()
          .eq('id', subscription.user_id);
          
        if (profileError) {
          console.error('Error deleting profile:', profileError);
          throw profileError;
        }
        
        console.log("User deleted successfully, dispatching event");
        
        // Dispatch a custom event with complete details to notify other components
        const event = new CustomEvent('userDeleted', { 
          detail: { 
            userId: subscription.user_id,
            subscriptionId: subscription.id,
            timestamp: new Date().getTime(),
            email: subscription.phone_number // Using phone as identifier since email isn't available
          } 
        });
        window.dispatchEvent(event);
        
        console.log("Event dispatched:", event);
      } else {
        console.log("Deleting standalone subscription with ID:", subscription.id);
        // Just delete the subscription entry
        const { error, data } = await supabase
          .from('user_subscriptions')
          .delete()
          .eq('id', subscription.id)
          .select();
          
        if (error) {
          console.error('Error deleting subscription:', error);
          throw error;
        }
        
        console.log("Successfully deleted subscription:", data);

        // Dispatch event for standalone subscription deletion
        const event = new CustomEvent('subscriptionDeleted', { 
          detail: { 
            subscriptionId: subscription.id,
            timestamp: new Date().getTime() 
          } 
        });
        window.dispatchEvent(event);
        console.log("Subscription deleted event dispatched", event);
      }
      
      toast({
        title: "Success",
        description: "Subscription deleted successfully"
      });
      
      // Call the onDeleted callback to update the parent component
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
      variant="destructive" 
      type="button"
      onClick={handleDelete} 
      disabled={disabled || isDeleting}
      className="w-full sm:w-auto"
    >
      {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <AlertTriangle className="mr-2 h-4 w-4" />}
      Delete Subscription
    </Button>
  );
}
