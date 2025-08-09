"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  onClose: () => void;
}

const popularEmojis = [
  "👍", "👎", "❤️", "😂", "😮", "😢", "😡", 
  "🎉", "🔥", "💯", "👀", "🤔", "😴", "🙄"
];

export const EmojiPicker = ({ onEmojiSelect, onClose }: EmojiPickerProps) => {
  return (
    <div className="absolute z-50 bg-background border border-border rounded-lg shadow-lg p-2 mt-2">
      <div className="grid grid-cols-7 gap-1">
        {popularEmojis.map((emoji) => (
          <Button
            key={emoji}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-lg hover:bg-muted"
            onClick={() => {
              onEmojiSelect(emoji);
              onClose();
            }}
          >
            {emoji}
          </Button>
        ))}
      </div>
    </div>
  );
};