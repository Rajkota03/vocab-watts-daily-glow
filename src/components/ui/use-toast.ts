
import { Toast } from "@/components/ui/toast"

const toastQueue = new Set<string>();

const generateId = () => {
  return Math.random().toString(36).substring(2, 9);
};

const useToast = () => {
  const toast = (props: Omit<Toast, "id">) => {
    const id = generateId();
    if (toastQueue.has(id)) return;
    toastQueue.add(id);
    setTimeout(() => toastQueue.delete(id), 5000); // Clean up after 5s
    return { ...props, id };
  };

  return { toast };
};

export { useToast };
