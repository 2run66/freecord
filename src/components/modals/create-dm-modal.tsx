"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
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
  const [friends, setFriends] = useState<Array<{ id: string; name: string; avatar?: string | null }>>([]);

  const isModalOpen = isOpen && type === "createDM";

  useEffect(() => {
    if (!isModalOpen) return;
    (async () => {
      try {
        const res = await fetch("/api/friends");
        if (res.ok) {
          const data = await res.json();
          setFriends(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        setFriends([]);
      }
    })();
  }, [isModalOpen]);

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
              <div className="relative">
                <Input
                  id="username"
                  disabled={isLoading}
                  className="bg-input border-border focus-visible:ring-2 focus-visible:ring-ring text-foreground pr-9"
                  placeholder="Enter username..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <button
                  type="button"
                  aria-label="Clear username"
                  onClick={() => setUsername("")}
                  disabled={isLoading || username.length === 0}
                  className="absolute inset-y-0 right-2 my-auto h-6 w-6 grid place-items-center rounded hover:bg-muted disabled:opacity-40"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            {friends.length > 0 && (
              <div>
                <div className="uppercase text-xs font-bold text-muted-foreground mb-2">Your Friends</div>
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {friends.map((f) => (
                    <button
                      type="button"
                      key={f.id}
                      onClick={() => setUsername(f.name)}
                      className="group w-full flex items-center gap-2 px-2 py-1.5 rounded-md border border-transparent hover:border-border hover:bg-muted/60 transition-colors text-left"
                    >
                      <img
                        src={f.avatar || "/default-avatar.png"}
                        alt={f.name}
                        className="h-6 w-6 rounded-full object-cover ring-0 transition group-hover:ring-2 group-hover:ring-border"
                      />
                      <span className="truncate group-hover:text-foreground">{f.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
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