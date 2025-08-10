"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export interface ServerSidebarButtonProps {
  label: string
  onClick?: () => void
  className?: string
  children: React.ReactNode
  badgeCount?: number
}

export function ServerSidebarButton({ label, onClick, className, children, badgeCount }: ServerSidebarButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          onClick={onClick}
          className={cn(
            "relative w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all duration-100",
            className,
          )}
        >
          {children}
          {!!badgeCount && badgeCount > 0 && (
            <span className="absolute -bottom-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-yellow-400 text-black text-[10px] leading-[18px] text-center shadow ring-1 ring-yellow-300">
              {badgeCount > 99 ? '99+' : badgeCount}
            </span>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  )
}

export default ServerSidebarButton


