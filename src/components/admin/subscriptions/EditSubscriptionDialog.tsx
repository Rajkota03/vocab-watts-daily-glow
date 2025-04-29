
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { addDays } from 'date-fns';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

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

const formSchema = z.object({
  isPro: z.boolean(),
  category: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

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
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      isPro: subscription?.is_pro || false,
      category: subscription?.category || '',
    },
  });
  
  // Reset form when subscription changes
  React.useEffect(() => {
    if (subscription) {
      form.reset({
        isPro: subscription.is_pro,
        category: subscription.category || '',
      });
    }
  }, [subscription, form]);

  const handleSave = async (values: FormValues) => {
    if (!subscription) return;
    setIsLoading(true);
    
    try {
      const updateData: any = {
        is_pro: values.isPro,
        category: values.category || null
      };

      // If changing to pro, set subscription end date to 30 days from now
      if (values.isPro && !subscription.is_pro) {
        updateData.subscription_ends_at = addDays(new Date(), 30).toISOString();
      }

      // If changing to free, clear subscription end date
      if (!values.isPro && subscription.is_pro) {
        updateData.subscription_ends_at = null;
        updateData.category = null;
      }
      
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
  
  const handleDelete = async () => {
    if (!subscription) return;
    setIsDeleting(true);
    
    try {
      // If this is linked to a user, we need to perform a full user deletion
      if (subscription.user_id) {
        console.log("Deleting user with ID:", subscription.user_id);
        
        // Delete the user's subscription first
        const { error: subError } = await supabase
          .from('user_subscriptions')
          .delete()
          .eq('user_id', subscription.user_id);
          
        if (subError) throw subError;
        
        // Delete the user's word history
        const { error: historyError } = await supabase
          .from('user_word_history')
          .delete()
          .eq('user_id', subscription.user_id);
        
        if (historyError) {
          console.error('Error deleting word history:', historyError);
        }
        
        // Delete the user's roles
        const { error: roleError } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', subscription.user_id);
        
        if (roleError) {
          console.error('Error deleting roles:', roleError);
        }
        
        // Delete the user's sent words
        const { error: sentWordsError } = await supabase
          .from('sent_words')
          .delete()
          .eq('user_id', subscription.user_id);
        
        if (sentWordsError) {
          console.error('Error deleting sent words:', sentWordsError);
        }
        
        // Delete any scheduled messages
        const { error: scheduledError } = await supabase
          .from('scheduled_messages')
          .delete()
          .eq('user_id', subscription.user_id);
        
        if (scheduledError) {
          console.error('Error deleting scheduled messages:', scheduledError);
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
        
        // Dispatch a custom event to notify other components
        const event = new CustomEvent('userDeleted', { 
          detail: { 
            userId: subscription.user_id,
            timestamp: new Date().getTime() 
          } 
        });
        window.dispatchEvent(event);
      } else {
        // Just delete the subscription entry
        const { error } = await supabase
          .from('user_subscriptions')
          .delete()
          .eq('id', subscription.id);
          
        if (error) throw error;
      }
      
      toast({
        title: "Success",
        description: "Subscription deleted successfully"
      });
      
      onOpenChange(false);
      
      if (onDelete) {
        onDelete();
      }
    } catch (error) {
      console.error('Error deleting subscription:', error);
      toast({
        title: "Error",
        description: "Failed to delete subscription",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!subscription) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-zinc-50">
        <DialogHeader>
          <DialogTitle>Edit Subscription</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
            <FormField
              control={form.control}
              name="isPro"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Pro Subscription</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Enable or disable pro features
                    </div>
                  </div>
                  <FormControl>
                    <Switch 
                      checked={field.value} 
                      onCheckedChange={field.onChange} 
                      disabled={isLoading || isDeleting} 
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            {form.watch("isPro") && (
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter category" disabled={isLoading || isDeleting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <Alert>
              <AlertDescription>
                Phone Number: {subscription.phone_number}
              </AlertDescription>
            </Alert>
            
            <DialogFooter className="gap-2 flex-col sm:flex-row">
              <Button 
                variant="destructive" 
                type="button"
                onClick={handleDelete} 
                disabled={isLoading || isDeleting}
                className="w-full sm:w-auto order-1 sm:order-none"
              >
                {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <AlertTriangle className="mr-2 h-4 w-4" />}
                Delete Subscription
              </Button>
              <div className="flex gap-2 w-full sm:w-auto order-0 sm:order-none">
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => onOpenChange(false)} 
                  disabled={isLoading || isDeleting}
                  className="flex-1 sm:flex-none"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading || isDeleting}
                  className="flex-1 sm:flex-none"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
