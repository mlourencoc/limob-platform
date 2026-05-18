"use client"

import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

export function Toaster() {
  const { toasts } = useToast()

  if (!toasts.length) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-80">
      {toasts
        .filter((t) => t.open)
        .map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "rounded-lg border p-4 shadow-lg bg-background text-sm transition-all",
              toast.variant === "destructive" && "border-destructive bg-destructive text-destructive-foreground"
            )}
          >
            {toast.title && <p className="font-medium">{toast.title}</p>}
            {toast.description && <p className="text-muted-foreground mt-0.5">{toast.description}</p>}
          </div>
        ))}
    </div>
  )
}
