"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { UserStatus } from "@/components/user-status";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  src?: string;
  name: string;
  className?: string;
  showStatus?: boolean;
  isOnline?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-6 w-6",
  md: "h-8 w-8",
  lg: "h-12 w-12"
};

const textSizeClasses = {
  sm: "text-xs",
  md: "text-sm", 
  lg: "text-lg"
};

export const UserAvatar = ({ 
  src, 
  name, 
  className,
  showStatus = false,
  isOnline = false,
  size = "md"
}: UserAvatarProps) => {
  return (
    <div className="relative">
      <Avatar className={cn(sizeClasses[size], className)}>
        <AvatarImage 
          src={src || "/default-avatar.png"} 
          alt={name}
        />
        <AvatarFallback className={cn(
          "bg-primary text-primary-foreground font-semibold",
          textSizeClasses[size]
        )}>
          {name?.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      {showStatus && (
        <UserStatus 
          isOnline={isOnline}
          className="absolute -bottom-0.5 -right-0.5"
          size={size === "lg" ? "md" : "sm"}
        />
      )}
    </div>
  );
};