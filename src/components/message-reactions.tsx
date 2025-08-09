"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EmojiPicker } from "@/components/emoji-picker";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface Reaction {
  emoji: string;
  count: number;
  userIds: string[];
}

interface MessageReactionsProps {
  messageId: string;
  reactions: Reaction[];
  currentUserId: string;
  onReactionAdd: (messageId: string, emoji: string) => void;
  onReactionRemove: (messageId: string, emoji: string) => void;
}

export const MessageReactions = ({
  messageId,
  reactions,
  currentUserId,
  onReactionAdd,
  onReactionRemove
}: MessageReactionsProps) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleReactionClick = (emoji: string) => {
    const reaction = reactions.find(r => r.emoji === emoji);
    if (reaction && reaction.userIds.includes(currentUserId)) {
      onReactionRemove(messageId, emoji);
    } else {
      onReactionAdd(messageId, emoji);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    onReactionAdd(messageId, emoji);
    setShowEmojiPicker(false);
  };

  if (reactions.length === 0 && !showEmojiPicker) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-1 mt-1 relative">
      {reactions.map((reaction) => {
        const hasReacted = reaction.userIds.includes(currentUserId);
        return (
          <Button
            key={reaction.emoji}
            variant="ghost"
            size="sm"
            className={cn(
              "h-6 px-2 text-xs border",
              hasReacted 
                ? "bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700" 
                : "border-muted hover:border-muted-foreground"
            )}
            onClick={() => handleReactionClick(reaction.emoji)}
          >
            <span className="mr-1">{reaction.emoji}</span>
            <span>{reaction.count}</span>
          </Button>
        );
      })}
      
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 border border-muted hover:border-muted-foreground"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        >
          <Plus className="h-3 w-3" />
        </Button>
        
        {showEmojiPicker && (
          <EmojiPicker
            onEmojiSelect={handleEmojiSelect}
            onClose={() => setShowEmojiPicker(false)}
          />
        )}
      </div>
    </div>
  );
};