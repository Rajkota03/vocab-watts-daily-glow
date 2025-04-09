
// This is our toast hook implementation
import { useState, useCallback, useEffect } from 'react'

type ToastProps = {
  id: string
  title?: string
  description?: string
  action?: React.ReactNode
  variant?: 'default' | 'destructive'
}

const TOAST_TIMEOUT = 5000

const useToast = () => {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const addToast = useCallback(
    (props: Omit<ToastProps, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9)
      setToasts((prevToasts) => [...prevToasts, { id, ...props }])
      return id
    },
    [setToasts]
  )

  const removeToast = useCallback(
    (id: string) => {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
    },
    [setToasts]
  )

  const toast = useCallback(
    (props: Omit<ToastProps, 'id'>) => {
      const id = addToast(props)
      return id
    },
    [addToast]
  )

  // Auto-dismiss toasts
  useEffect(() => {
    const timers = toasts.map((toast) => {
      const timer = setTimeout(() => {
        removeToast(toast.id)
      }, TOAST_TIMEOUT)
      return { id: toast.id, timer }
    })

    return () => {
      timers.forEach((timer) => clearTimeout(timer.timer))
    }
  }, [toasts, removeToast])

  return {
    toasts,
    toast,
    removeToast,
  }
}

export { useToast, type ToastProps }

// For compatibility with the existing app
export const toast = (props: Omit<ToastProps, 'id'>) => {
  // This creates a temporary toast handler
  // In a real implementation, this would use a global context
  const { toast: addToast } = useToast()
  return addToast(props)
}
