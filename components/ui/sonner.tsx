"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CheckCircle, Info, Warning, WarningOctagon, CircleNotch } from "@phosphor-icons/react"
// This project has its own ThemeProvider (components/ThemeProvider), not
// next-themes — use that instead so toasts actually follow the site's real
// dark-mode state rather than an unmounted, unrelated theme provider.
import { useTheme } from "@/components/ThemeProvider"

const Toaster = ({ ...props }: ToasterProps) => {
  const { actualTheme: theme } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: (
          <CheckCircle className="size-4" />
        ),
        info: (
          <Info className="size-4" />
        ),
        warning: (
          <Warning className="size-4" />
        ),
        error: (
          <WarningOctagon className="size-4" />
        ),
        loading: (
          <CircleNotch className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
