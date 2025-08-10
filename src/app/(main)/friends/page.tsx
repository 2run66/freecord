"use client";

import { useEffect, useState } from "react";
import { UserAvatar } from "@/components/user-avatar";

interface FriendUser {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
}

export default function FriendsPage() {
  const [friends, setFriends] = useState<FriendUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/friends");
        if (res.ok) setFriends(await res.json());
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Friends</h1>
      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : friends.length === 0 ? (
        <p className="text-muted-foreground">No friends yet.</p>
      ) : (
        <div className="space-y-2">
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
    </div>
  );
}


