
import React from 'react';
import { Button } from "@/components/ui/button";
import { Loader2 } from 'lucide-react';
import { DeleteSubscriptionHandler } from './DeleteSubscriptionHandler';

interface DialogFooterActionsProps {
  subscription: {
    id: string;
    user_id?: string | null;
    phone_number: string;
  } | null;
  isLoading: boolean;
  isDeleting: boolean;
  onCancel: () => void;
  onDelete: () => void;
  onDeleteError: (error: Error) => void;
}

export function DialogFooterActions({
  subscription,
  isLoading,
  isDeleting,
  onCancel,
  onDelete,
  onDeleteError
}: DialogFooterActionsProps) {
  return (
    <div className="gap-2 flex-col sm:flex-row">
      <DeleteSubscriptionHandler 
        subscription={subscription}
        onDeleted={onDelete}
        onError={onDeleteError}
        disabled={isLoading || isDeleting}
      />
      <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
        <Button 
          variant="outline" 
          type="button" 
          onClick={onCancel} 
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
    </div>
  );
}
