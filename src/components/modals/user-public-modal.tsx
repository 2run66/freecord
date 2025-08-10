"use client";

import { Mail, Shield, UserPlus, Flag, UserCheck } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal-store";
import { UserAvatar } from "@/components/user-avatar";
import { useEffect, useState } from "react";

export const UserPublicModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const isModalOpen = isOpen && type === "userPublic";

  const { user } = data || {};
  const [meId, setMeId] = useState<string | null>(null);
  const [isFriend, setIsFriend] = useState<boolean>(false);

  useEffect(() => {
    if (!isModalOpen) return;
    (async () => {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const me = await res.json();
          setMeId(me.id);
        }
      } catch {}
    })();
  }, [isModalOpen]);

  // Check friendship status
  useEffect(() => {
    if (!isModalOpen || !user) return;
    (async () => {
      try {
        const res = await fetch("/api/friends");
        if (res.ok) {
          const friends = await res.json();
          const found = Array.isArray(friends) && friends.some((f: any) => f.id === user.id);
          setIsFriend(!!found);
        }
      } catch {
        setIsFriend(false);
      }
    })();
  }, [isModalOpen, user]);

  if (!user) return null;

  const handleAddFriend = async () => {
    try {
      const res = await fetch("/api/friends/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toUserId: user.id }),
      });
      if (!res.ok) {
        console.error("Failed to send friend request");
      }
    } catch (e) {
      console.error(e);
    } finally {
      onClose();
    }
  };

  const handleReport = async () => {
    // Still mock for now
    console.log("Report clicked for", user.id);
    onClose();
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card text-foreground border-border max-w-md p-0 overflow-hidden">
        <div className="p-6">
          <DialogHeader className="items-center">
            <DialogTitle className="text-xl font-semibold">User Profile</DialogTitle>
            <DialogDescription>Public info</DialogDescription>
          </DialogHeader>

          <div className="mt-4 flex items-center gap-4">
            <UserAvatar src={user.avatar} name={user.name} size="lg" showStatus={false} />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold truncate">{user.name}</h3>
                {user.role && (
                  <span className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground">
                    <Shield className="h-3.5 w-3.5" />
                    {user.role}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate">@{String(user.id).slice(-6)}</p>
              {user.email && (
                <p className="mt-1 inline-flex items-center gap-2 text-sm text-muted-foreground truncate">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </p>
              )}
            </div>
          </div>

          {meId && meId !== user.id && (
            <div className="mt-6 grid grid-cols-2 gap-3">
              {isFriend ? (
                <div className="col-span-2 inline-flex items-center justify-center gap-2 rounded-md border border-green-500/40 bg-green-500/10 text-green-500 px-3 py-2 text-sm">
                  <UserCheck className="h-4 w-4" />
                  You are friends
                </div>
              ) : (
                <>
                  <Button variant="primary" onClick={handleAddFriend} className="w-full inline-flex items-center justify-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Add Friend
                  </Button>
                  <Button variant="outline" onClick={handleReport} className="w-full inline-flex items-center justify-center gap-2">
                    <Flag className="h-4 w-4" />
                    Report
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};


