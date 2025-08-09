"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export interface ServerSidebarButtonProps {
  label: string
  onClick?: () => void
  className?: string
  children: React.ReactNode
}

export function ServerSidebarButton({ label, onClick, className, children }: ServerSidebarButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          onClick={onClick}
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all duration-100",
            className,
          )}
        >
          {children}
        </div>
      </TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  )
}

export default ServerSidebarButton


