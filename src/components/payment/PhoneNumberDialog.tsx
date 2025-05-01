import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from 'lucide-react';
interface PhoneNumberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  phoneNumber: string;
  onPhoneNumberChange: (value: string) => void;
  onSubmit: () => void;
  isProcessing: boolean;
}
export const PhoneNumberDialog = ({
  open,
  onOpenChange,
  phoneNumber,
  onPhoneNumberChange,
  onSubmit,
  isProcessing
}: PhoneNumberDialogProps) => {
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-gray-50">
        <DialogHeader>
          <DialogTitle>Enter Your WhatsApp Number</DialogTitle>
          <DialogDescription>
            Please enter your WhatsApp number with country code to receive vocabulary words.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Input placeholder="e.g. +919876543210" value={phoneNumber} onChange={e => onPhoneNumberChange(e.target.value)} className="w-full" />
          <p className="text-xs text-gray-500 mt-1">
            Format: Include country code (e.g., +91 for India)
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isProcessing}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={isProcessing || !phoneNumber.trim()}>
            {isProcessing ? <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </> : "Continue"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>;
};