import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { addDays } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
interface EditSubscriptionDialogProps {
  subscription: {
    id: string;
    phone_number: string;
    is_pro: boolean;
    category?: string;
    trial_ends_at?: string | null;
    subscription_ends_at?: string | null;
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
  const [isPro, setIsPro] = React.useState(false);
  const [category, setCategory] = React.useState<string>('');
  const [isLoading, setIsLoading] = React.useState(false);
  const {
    toast
  } = useToast();
  React.useEffect(() => {
    if (subscription) {
      setIsPro(subscription.is_pro);
      setCategory(subscription.category || '');
    }
  }, [subscription]);
  const handleSave = async () => {
    if (!subscription) return;
    setIsLoading(true);
    try {
      const updateData: any = {
        is_pro: isPro,
        category: category || null
      };

      // If changing to pro, set subscription end date to 30 days from now
      if (isPro && !subscription.is_pro) {
        updateData.subscription_ends_at = addDays(new Date(), 30).toISOString();
      }

      // If changing to free, clear subscription end date
      if (!isPro && subscription.is_pro) {
        updateData.subscription_ends_at = null;
        updateData.category = null;
      }
      const {
        error
      } = await supabase.from('user_subscriptions').update(updateData).eq('id', subscription.id);
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
  if (!subscription) return null;
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-zinc-50">
        <DialogHeader>
          <DialogTitle>Edit Subscription</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label>Pro Subscription</Label>
              <div className="text-sm text-muted-foreground">
                Enable or disable pro features
              </div>
            </div>
            <Switch checked={isPro} onCheckedChange={setIsPro} disabled={isLoading} />
          </div>

          {isPro && <div className="flex flex-col gap-2">
              <Label htmlFor="category">Category</Label>
              <Input id="category" value={category} onChange={e => setCategory(e.target.value)} placeholder="Enter category" disabled={isLoading} />
            </div>}
          
          <Alert>
            <AlertDescription>
              Phone Number: {subscription.phone_number}
            </AlertDescription>
          </Alert>
        </div>
        <DialogFooter className="gap-2">
          {onDelete && <Button variant="destructive" onClick={onDelete} disabled={isLoading}>
              Delete User
            </Button>}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </> : 'Save Changes'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>;
}