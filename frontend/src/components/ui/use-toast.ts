"use client"

import { useToast as useToastContext } from "@/components/ui/toast"

export function useToast() {
  return useToastContext()
}
