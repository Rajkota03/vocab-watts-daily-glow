
import * as React from "react";
import { toast as sonnerToast } from "sonner";

type ToastProps = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  variant?: "default" | "destructive" | "success";
};

const toast = (props: ToastProps) => {
  // Use sonner toast directly for better reliability
  if (props.variant === "success") {
    sonnerToast.success(props.title as string, {
      description: props.description as string,
    });
  } else if (props.variant === "destructive") {
    sonnerToast.error(props.title as string, {
      description: props.description as string,
    });
  } else {
    sonnerToast(props.title as string, {
      description: props.description as string,
    });
  }
  
  return { 
    id: Math.random().toString(36).substring(2, 9),
    dismiss: () => {},
    update: () => {}
  };
};

const useToast = () => {
  return { 
    toast,
    toasts: [], // Empty array for compatibility
    dismiss: () => {}
  };
};

export { useToast, toast };
