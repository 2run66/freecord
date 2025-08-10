"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useModal } from "@/hooks/use-modal-store";
import { UserAvatar } from "@/components/user-avatar";

interface FriendUser {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
}

export const FriendsModal = () => {
  const { isOpen, type, onClose } = useModal();
  const isModalOpen = isOpen && type === "friends";

  const [friends, setFriends] = useState<FriendUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isModalOpen) return;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/friends");
        if (res.ok) setFriends(await res.json());
      } finally {
        setLoading(false);
      }
    })();
  }, [isModalOpen]);

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card text-foreground border-border max-w-lg">
        <DialogHeader>
          <DialogTitle>Friends</DialogTitle>
        </DialogHeader>
        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : friends.length === 0 ? (
          <p className="text-muted-foreground">No friends yet.</p>
        ) : (
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {friends.map((u) => (
              <div key={u.id} className="flex items-center gap-3 border border-border rounded-md p-2">
                <UserAvatar src={u.avatar || undefined} name={u.name} />
                <div className="min-w-0">
                  <div className="font-medium truncate">{u.name}</div>
                  <div className="text-sm text-muted-foreground truncate">{u.email}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};


