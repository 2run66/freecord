"use client";

import { cn } from "@/lib/utils";

interface UserStatusProps {
  isOnline?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-2 w-2",
  md: "h-3 w-3", 
  lg: "h-4 w-4"
};

export const UserStatus = ({ 
  isOnline = false, 
  className,
  size = "sm" 
}: UserStatusProps) => {
  return (
    <div 
      className={cn(
        "rounded-full border-2 border-background",
        sizeClasses[size],
        isOnline 
          ? "bg-green-500" 
          : "bg-gray-400 dark:bg-gray-600",
        className
      )}
      title={isOnline ? "Online" : "Offline"}
    />
  );
};