"use client"

// Minimal toast �?" suficiente para o MVP
import * as React from "react"

type ToastProps = {
  title?: string
  description?: string
  variant?: "default" | "destructive"
}

type ToastState = ToastProps & { id: number; open: boolean }

let toastId = 0
const listeners: Array<(toasts: ToastState[]) => void> = []
let toasts: ToastState[] = []

function dispatch(toast: ToastProps) {
  const id = ++toastId
  toasts = [...toasts, { ...toast, id, open: true }]
  listeners.forEach((l) => l(toasts))
  setTimeout(() => {
    toasts = toasts.map((t) => (t.id === id ? { ...t, open: false } : t))
    listeners.forEach((l) => l(toasts))
    setTimeout(() => {
      toasts = toasts.filter((t) => t.id !== id)
      listeners.forEach((l) => l(toasts))
    }, 300)
  }, 3000)
}

export function toast(props: ToastProps) {
  dispatch(props)
}

export function useToast() {
  const [state, setState] = React.useState<ToastState[]>(toasts)
  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const idx = listeners.indexOf(setState)
      if (idx > -1) listeners.splice(idx, 1)
    }
  }, [])
  return { toasts: state, toast }
}
