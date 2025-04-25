
import * as React from "react";
import { toast as sonnerToast } from "sonner";

const toastQueue = new Set<string>();

const generateId = () => {
  return Math.random().toString(36).substring(2, 9);
};

type ToastProps = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  variant?: "default" | "destructive" | "success";
};

const toast = (props: ToastProps) => {
  const id = generateId();
  if (toastQueue.has(id)) return;
  toastQueue.add(id);
  setTimeout(() => toastQueue.delete(id), 5000); // Clean up after 5s

  // Also trigger sonner toast for better visibility
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
  
  return { ...props, id };
};

const useToast = () => {
  return { toast };
};

export { useToast, toast };
