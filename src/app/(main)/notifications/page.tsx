"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";

interface FriendRequestItem {
  id: string;
  fromUser: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
  };
  createdAt: string;
}

export default function NotificationsPage() {
  const [incoming, setIncoming] = useState<FriendRequestItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const res = await fetch("/api/friends/requests");
    if (res.ok) {
      const data = await res.json();
      setIncoming(data.incoming || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAccept = async (id: string) => {
    await fetch(`/api/friends/requests/${id}/accept`, { method: "POST" });
    fetchData();
  };

  const handleDecline = async (id: string) => {
    await fetch(`/api/friends/requests/${id}/decline`, { method: "POST" });
    fetchData();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Notifications</h1>
      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : incoming.length === 0 ? (
        <p className="text-muted-foreground">No new friend requests.</p>
      ) : (
        <div className="space-y-3">
          {incoming.map((req) => (
            <div key={req.id} className="flex items-center justify-between border border-border rounded-md p-3">
              <div className="flex items-center gap-3 min-w-0">
                <UserAvatar src={req.fromUser.avatar || undefined} name={req.fromUser.name} />
                <div className="min-w-0">
                  <div className="font-medium truncate">{req.fromUser.name}</div>
                  <div className="text-sm text-muted-foreground truncate">{req.fromUser.email}</div>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button variant="primary" onClick={() => handleAccept(req.id)}>Accept</Button>
                <Button variant="outline" onClick={() => handleDecline(req.id)}>Decline</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


