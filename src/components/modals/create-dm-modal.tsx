"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useModal } from "@/hooks/use-modal-store";

export const CreateDMModal = () => {
  const { isOpen, onClose, type } = useModal();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState("");

  const isModalOpen = isOpen && type === "createDM";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    try {
      setIsLoading(true);
      
      const response = await fetch("/api/direct-messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      });

      if (response.ok) {
        const conversation = await response.json();
        console.log("DM created:", conversation);
        onClose();
        setUsername("");
        router.refresh();
      } else {
        const error = await response.text();
        console.error("Failed to create DM:", error);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setUsername("");
    onClose();
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-card text-foreground p-0 overflow-hidden border-border">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Start Direct Message
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Enter a username to start a conversation
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-8 px-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="uppercase text-xs font-bold text-muted-foreground">
                Username
              </Label>
              <Input
                id="username"
                disabled={isLoading}
                className="bg-input border-border focus-visible:ring-2 focus-visible:ring-ring text-foreground"
                placeholder="Enter username..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="bg-muted px-6 py-4">
            <Button variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button variant="primary" disabled={isLoading || !username.trim()}>
              Start Conversation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};