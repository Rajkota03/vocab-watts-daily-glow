
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Loader2, Trash2 } from 'lucide-react';
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { addDays } from 'date-fns';
import { DeleteSubscriptionHandler } from './dialog/DeleteSubscriptionHandler';

const formSchema = z.object({
  isPro: z.boolean(),
  category: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

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
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      isPro: false,
      category: 'daily-intermediate',
    },
  });
  
  // Reset form when subscription changes
  React.useEffect(() => {
    if (subscription) {
      form.reset({
        isPro: subscription.is_pro,
        category: subscription.category || 'daily-intermediate',
      });
    }
  }, [subscription, form]);
  
  const handleSave = async (values: FormValues) => {
    if (!subscription) return;
    setIsLoading(true);
    
    try {
      const updateData: any = {
        is_pro: values.isPro,
        category: values.category || 'daily-intermediate'
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
            
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="daily-intermediate" 
                      disabled={isLoading || isDeleting} 
                    />
                  </FormControl>
                  <FormMessage />
                  <div className="text-sm text-muted-foreground">
                    Default: daily-intermediate
                  </div>
                </FormItem>
              )}
            />
            
            <Alert>
              <AlertDescription>
                Phone Number: {subscription.phone_number}
              </AlertDescription>
            </Alert>
            
            <div className="flex gap-2 justify-between pt-4">
              <DeleteSubscriptionHandler 
                subscription={subscription}
                onDeleted={handleSubscriptionDeleted}
                onError={handleDeleteError}
                disabled={isLoading || isDeleting}
              />
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => onOpenChange(false)} 
                  disabled={isLoading || isDeleting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading || isDeleting}
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
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
