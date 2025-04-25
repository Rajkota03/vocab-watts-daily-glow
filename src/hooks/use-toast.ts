
import * as React from "react";
import { toast as sonnerToast } from "sonner";

type ToasterToast = {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactElement;
  variant?: "default" | "destructive" | "success";
};

const TOAST_LIMIT = 3;
const TOAST_REMOVE_DELAY = 5000;

type Toast = {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  variant?: "default" | "destructive" | "success";
};

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const;

// Toast ID counter
let count = 0;

// Track active toast IDs to prevent duplicates
const activeToastIds = new Set<string>();

function generateId() {
  return `${count++}`;
}

type ActionType = typeof actionTypes;

type Action =
  | {
      type: ActionType["ADD_TOAST"];
      toast: Toast;
    }
  | {
      type: ActionType["UPDATE_TOAST"];
      toast: Partial<Toast>;
      id: string;
    }
  | {
      type: ActionType["DISMISS_TOAST"];
      toastId?: string;
    }
  | {
      type: ActionType["REMOVE_TOAST"];
      toastId?: string;
    };

interface State {
  toasts: Toast[];
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return;
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    activeToastIds.delete(toastId);
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    });
  }, TOAST_REMOVE_DELAY);

  toastTimeouts.set(toastId, timeout);
};

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.id ? { ...t, ...action.toast } : t
        ),
      };

    case "DISMISS_TOAST": {
      const { toastId } = action;

      if (toastId === undefined) {
        return {
          ...state,
          toasts: state.toasts.map((t) => ({
            ...t,
          })),
        };
      }

      addToRemoveQueue(toastId);

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId
            ? {
                ...t,
              }
            : t
        ),
      };
    }

    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };
  }
};

const listeners: Array<(state: State) => void> = [];

let memoryState: State = { toasts: [] };

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

// Prevent duplicate toast content
function isDuplicateToast(title: string, description?: string): boolean {
  for (const toast of memoryState.toasts) {
    if (
      toast.title === title && 
      toast.description === description
    ) {
      return true;
    }
  }
  return false;
}

type ToastProps = Omit<Toast, "id">;

function toast(props: ToastProps) {
  // Check for duplicate toasts
  if (
    typeof props.title === "string" && 
    isDuplicateToast(props.title, props.description as string | undefined)
  ) {
    return { id: "", dismiss: () => {}, update: () => {} };
  }

  const id = generateId();
  activeToastIds.add(id);

  const update = (props: ToastProps) =>
    dispatch({
      type: "UPDATE_TOAST",
      id,
      toast: { ...props },
    });

  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id });

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      title: props.title,
      description: props.description,
      action: props.action,
    },
  });

  // Also trigger sonner toast for better visibility
  if (props.variant === "success") {
    sonnerToast.success(props.title as string, {
      description: props.description as string,
      id,
    });
  } else if (props.variant === "destructive") {
    sonnerToast.error(props.title as string, {
      description: props.description as string,
      id,
    });
  } else {
    sonnerToast(props.title as string, {
      description: props.description as string,
      id,
    });
  }

  return {
    id,
    dismiss,
    update,
  };
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  };
}

export { useToast, toast };
