
import React from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { type User } from '../UserManagementDashboard';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface DeleteUserDialogProps {
  user: User | null;
  open: boolean;
  onClose: () => void;
  onDelete: () => Promise<void>;
  isDeleting?: boolean;
}

export const DeleteUserDialog: React.FC<DeleteUserDialogProps> = ({ 
  user, 
  open, 
  onClose, 
  onDelete,
  isDeleting = false
}) => {
  if (!user) return null;

  const handleDelete = async () => {
    try {
      // Call the delete function provided by the parent
      await onDelete();
      
      toast({
        title: "Success",
        description: `User ${user.email} has been deleted successfully.`,
      });
      
      // Close the dialog after successful deletion
      onClose();
    } catch (error) {
      console.error('Error during deletion:', error);
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action will permanently delete the user <span className="font-semibold">{user.email}</span> and all associated data. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-[#FF6B6B] hover:bg-red-600 text-white"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
