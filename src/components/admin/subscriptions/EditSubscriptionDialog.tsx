
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { addDays } from 'date-fns';
import { SubscriptionForm, FormValues } from './dialog/SubscriptionForm';
import { DialogFooterActions } from './dialog/DialogFooterActions';

interface EditSubscriptionDialogProps {
  subscription: {
    id: string;
    phone_number: string;
    is_pro: boolean;
    category?: string;
    trial_ends_at?: string | null;
    subscription_ends_at?: string | null;
    user_id?: string | null;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubscriptionUpdated: () => void;
  onDelete?: () => void;
}

export function EditSubscriptionDialog({
  subscription,
  open,
  onOpenChange,
  onSubscriptionUpdated,
  onDelete
}: EditSubscriptionDialogProps) {
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();
  
  const handleSave = async (values: FormValues) => {
    if (!subscription) return;
    setIsLoading(true);
    
    try {
      const updateData: any = {
        is_pro: values.isPro,
        category: values.isPro ? (values.category || null) : null
      };

      // If changing to pro, set subscription end date to 30 days from now
      if (values.isPro && !subscription.is_pro) {
        updateData.subscription_ends_at = addDays(new Date(), 30).toISOString();
      }

      // If changing to free, clear subscription end date
      if (!values.isPro && subscription.is_pro) {
        updateData.subscription_ends_at = null;
      }
      
      console.log('Updating subscription:', subscription.id, 'with data:', updateData);
      
      const { error } = await supabase
        .from('user_subscriptions')
        .update(updateData)
        .eq('id', subscription.id);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Subscription updated successfully"
      });
      
      onOpenChange(false);
      onSubscriptionUpdated();
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast({
        title: "Error",
        description: "Failed to update subscription",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteError = (error: Error) => {
    setIsDeleting(false);
  };

  const handleSubscriptionDeleted = () => {
    if (onDelete) {
      onDelete();
    }
    onOpenChange(false);
  };

  if (!subscription) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-zinc-50">
        <DialogHeader>
          <DialogTitle>Edit Subscription</DialogTitle>
        </DialogHeader>
        
        <SubscriptionForm 
          subscription={subscription}
          isLoading={isLoading}
          isDeleting={isDeleting}
          onSubmit={handleSave}
        />
        
        <DialogFooter className="gap-2 flex-col sm:flex-row">
          <DialogFooterActions 
            subscription={subscription}
            isLoading={isLoading}
            isDeleting={isDeleting}
            onCancel={() => onOpenChange(false)}
            onDelete={handleSubscriptionDeleted}
            onDeleteError={handleDeleteError}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
