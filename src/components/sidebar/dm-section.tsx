"use client";

import { Plus, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal-store";
import { UserAvatar } from "@/components/user-avatar";

interface DirectMessage {
  id: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  lastMessage?: string;
  isOnline?: boolean;
}

interface DMSectionProps {
  directMessages: DirectMessage[];
}

export const DMSection = ({ directMessages }: DMSectionProps) => {
  const { onOpen } = useModal();

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Direct Messages
        </h3>
        <Button
          onClick={() => onOpen("createDM")}
          variant="ghost"
          size="sm"
          className="h-auto p-0 text-muted-foreground hover:text-foreground"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="space-y-0.5">
        {directMessages.length === 0 ? (
          <div className="text-center py-4">
            <MessageCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">No direct messages yet</p>
            <Button
              onClick={() => onOpen("createDM")}
              variant="ghost"
              size="sm"
              className="text-xs mt-1"
            >
              Start a conversation
            </Button>
          </div>
        ) : (
          directMessages.map((dm) => (
            <div
              key={dm.id}
              className="flex items-center px-2 py-2 rounded hover:bg-muted cursor-pointer group"
            >
              <UserAvatar
                src={dm.user.avatar}
                name={dm.user.name}
                showStatus={true}
                isOnline={dm.isOnline}
                size="sm"
                className="mr-2"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{dm.user.name}</p>
                {dm.lastMessage && (
                  <p className="text-xs text-muted-foreground truncate">
                    {dm.lastMessage}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};