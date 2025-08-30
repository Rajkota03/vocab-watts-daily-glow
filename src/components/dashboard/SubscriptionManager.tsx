import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Loader2, Calendar, CreditCard, AlertTriangle } from 'lucide-react';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { format } from 'date-fns';

interface SubscriptionManagerProps {
  userId: string | null;
  showManageLink?: boolean;
}

export const SubscriptionManager = ({ userId, showManageLink = true }: SubscriptionManagerProps) => {
  const [isCancelling, setIsCancelling] = useState(false);
  const { 
    is_pro, 
    subscription_ends_at, 
    subscription_status, 
    loading, 
    cancelSubscription 
  } = useSubscriptionStatus(userId);

  const handleCancelSubscription = async () => {
    setIsCancelling(true);
    try {
      await cancelSubscription();
    } finally {
      setIsCancelling(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading subscription status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!is_pro) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Subscription Status
          </CardTitle>
          <CardDescription>Manage your subscription plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Badge variant="secondary">Free Trial</Badge>
              <p className="text-sm text-muted-foreground mt-2">
                Upgrade to Pro for unlimited features
              </p>
            </div>
            <Button>Upgrade to Pro</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isActive = subscription_status === 'active';
  const isCancelled = subscription_status === 'cancelled';
  const subscriptionEndDate = subscription_ends_at ? new Date(subscription_ends_at) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Subscription Status
        </CardTitle>
        <CardDescription>Your Pro subscription details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={isActive ? "default" : isCancelled ? "destructive" : "secondary"}>
                {isActive ? "Pro Active" : isCancelled ? "Pro Cancelled" : "Pro"}
              </Badge>
              {isCancelled && (
                <Badge variant="outline" className="text-orange-600">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Auto-renewal disabled
                </Badge>
              )}
            </div>
            {subscriptionEndDate && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  {isCancelled 
                    ? `Access ends: ${format(subscriptionEndDate, 'PPP')}`
                    : `Next billing: ${format(subscriptionEndDate, 'PPP')}`
                  }
                </span>
              </div>
            )}
          </div>
        </div>

        {showManageLink && (
          <div className="pt-2 border-t">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button 
                  className="text-sm text-blue-600 hover:text-blue-800 underline cursor-pointer"
                  disabled={isCancelling}
                >
                  Manage subscription
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Manage Subscription</AlertDialogTitle>
                  <AlertDialogDescription>
                    {isActive ? (
                      <>
                        Your Pro subscription is currently active. Cancelling will stop auto-renewal, but you'll continue to have access to Pro features until the end of your current billing period
                        {subscriptionEndDate && ` (${format(subscriptionEndDate, 'PPP')})`}.
                      </>
                    ) : isCancelled ? (
                      'Your subscription has been cancelled and will not auto-renew.'
                    ) : (
                      'Manage your subscription settings.'
                    )}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Close</AlertDialogCancel>
                  {isActive && (
                    <AlertDialogAction
                      onClick={handleCancelSubscription}
                      disabled={isCancelling}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      {isCancelling ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Cancelling...
                        </>
                      ) : (
                        'Cancel Auto-Renewal'
                      )}
                    </AlertDialogAction>
                  )}
                  {isCancelled && (
                    <AlertDialogAction
                      onClick={() => {
                        // Reactivation logic would go here
                        console.log('Reactivate subscription');
                      }}
                    >
                      Reactivate Subscription
                    </AlertDialogAction>
                  )}
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}

        {isCancelled && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-orange-800">Subscription Cancelled</h4>
                <p className="text-sm text-orange-700 mt-1">
                  Your subscription has been cancelled and won't auto-renew, but you'll continue to have Pro access until {subscriptionEndDate && format(subscriptionEndDate, 'MMMM d, yyyy')}.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          <p>• Auto-renewing monthly subscription</p>
          <p>• Cancel anytime - no questions asked</p>
          <p>• Continue access until the end of billing period</p>
        </div>
      </CardContent>
    </Card>
  );
};