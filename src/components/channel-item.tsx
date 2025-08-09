"use client";

import { Hash, Volume2, Video, Lock, Settings, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal-store";
import { VoiceChannelUsers } from "@/components/voice-channel-users";

interface ChannelItemProps {
  channel: {
    id: string;
    name: string;
    type: "TEXT" | "VOICE" | "VIDEO";
    isPrivate?: boolean;
    description?: string;
  };
  server: {
    id: string;
    name: string;
  };
  isActive?: boolean;
  userRole?: "ADMIN" | "MODERATOR" | "GUEST";
}

const iconMap = {
  "TEXT": Hash,
  "VOICE": Volume2,
  "VIDEO": Video,
};

export const ChannelItem = ({
  channel,
  server,
  isActive = false,
  userRole = "GUEST"
}: ChannelItemProps) => {
  const { onOpen } = useModal();
  const params = useParams();
  const router = useRouter();
  
  const Icon = iconMap[channel.type];
  const canManageChannel = userRole === "ADMIN" || userRole === "MODERATOR";

  const onClick = () => {
    router.push(`/servers/${server.id}/channels/${channel.id}`);
  };

  const onEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpen("editChannel", { channel, server });
  };

  return (
    <div className="mb-1">
      <div
        onClick={onClick}
        className={cn(
          "group flex items-center justify-between px-2 py-1.5 rounded hover:bg-muted cursor-pointer transition-colors",
          isActive && "bg-muted/50"
        )}
      >
        <div className="flex items-center flex-1 min-w-0">
          <Icon className={cn(
            "w-5 h-5 text-muted-foreground mr-2 flex-shrink-0",
            isActive && "text-foreground"
          )} />
          
          <span className={cn(
            "text-sm truncate",
            isActive ? "text-foreground font-medium" : "text-muted-foreground group-hover:text-foreground"
          )}>
            {channel.name}
          </span>
          
          {channel.isPrivate && (
            <Lock className="w-3 h-3 text-muted-foreground ml-1 flex-shrink-0" />
          )}
        </div>

        {canManageChannel && (
          <div className="hidden group-hover:flex items-center">
            <Button
              onClick={onEdit}
              variant="ghost"
              size="sm"
              className="h-auto p-1 text-muted-foreground hover:text-foreground"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
      
      {/* Show connected users for voice/video channels */}
      {(channel.type === "VOICE" || channel.type === "VIDEO") && (
        <VoiceChannelUsers channelId={channel.id} />
      )}
    </div>
  );
};