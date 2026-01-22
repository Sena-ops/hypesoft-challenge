"use client"

import * as React from "react"
import { X, CheckCircle2, AlertCircle, Info, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export type ToastVariant = "default" | "success" | "error" | "warning" | "info"

export interface ToastProps {
  id: string
  title?: string
  description?: string
  variant?: ToastVariant
  duration?: number
  onClose?: () => void
}

interface ToastContextType {
  toasts: ToastProps[]
  toast: (props: Omit<ToastProps, "id">) => void
  dismiss: (id: string) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastProps[]>([])

  const toast = React.useCallback((props: Omit<ToastProps, "id">) => {
    const id = Math.random().toString(36).substring(7)
    const newToast: ToastProps = {
      ...props,
      id,
      duration: props.duration ?? 5000,
    }

    setToasts((prev) => [...prev, newToast])

    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, newToast.duration)
    }
  }, [])

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within ToastProvider")
  }
  return context
}

function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: ToastProps[]
  onDismiss: (id: string) => void
}) {
  return (
    <div className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px] pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastProps
  onDismiss: (id: string) => void
}) {
  const variant = toast.variant || "default"

  const variants = {
    default: "border bg-background text-foreground",
    success:
      "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-100",
    error:
      "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-100",
    warning:
      "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-900 dark:text-yellow-100",
    info: "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100",
  }

  const icons = {
    default: Info,
    success: CheckCircle2,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  }

  const Icon = icons[variant]

  return (
    <div
      className={cn(
        "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all toast-enter",
        variants[variant]
      )}
    >
      <div className="flex items-start gap-3 flex-1">
        <Icon className="h-5 w-5 shrink-0 mt-0.5" />
        <div className="flex-1 space-y-1">
          {toast.title && (
            <p className="text-sm font-semibold">{toast.title}</p>
          )}
          {toast.description && (
            <p className="text-sm opacity-90">{toast.description}</p>
          )}
        </div>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="absolute right-2 top-2 rounded-md p-1 opacity-0 transition-opacity hover:opacity-100 focus:opacity-100 focus:outline-none group-hover:opacity-100"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
