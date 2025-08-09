"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { LiveKitRoom, VideoConference } from "@livekit/components-react";
import "@livekit/components-styles";
import { Loader2 } from "lucide-react";

interface MediaRoomProps {
  chatId: string;
  video: boolean;
  audio: boolean;
}

export const MediaRoom = ({
  chatId,
  video,
  audio,
}: MediaRoomProps) => {
  const { user } = useUser();
  const [token, setToken] = useState("");

  useEffect(() => {
    if (!user) return;

    (async () => {
      try {
        // First get the current profile from database to use updated display name
        const profileResp = await fetch('/api/profile');
        let displayName = "User";
        let avatarUrl = user.imageUrl;

        if (profileResp.ok) {
          const profileData = await profileResp.json();
          displayName = profileData.name || displayName;
          avatarUrl = profileData.avatar || avatarUrl;
        } else {
          // Fallback to Clerk data if profile fetch fails
          const firstName = user.firstName || "";
          const lastName = user.lastName || "";
          displayName = `${firstName} ${lastName}`.trim() || user.emailAddresses?.[0]?.emailAddress?.split("@")[0] || "User";
        }
        
        const metadata = JSON.stringify({
          name: displayName,
          avatar: avatarUrl
        });

        const resp = await fetch(`/api/livekit`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            room: chatId,
            username: displayName,
            metadata: metadata,
          }),
        });
        const data = await resp.json();
        setToken(data.token);
      } catch (e) {
        console.log(e);
      }
    })();
  }, [user, chatId]);

  if (token === "") {
    return (
      <div className="flex flex-col flex-1 justify-center items-center">
        <Loader2 className="h-7 w-7 text-zinc-500 animate-spin my-4" />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Loading...
        </p>
      </div>
    )
  }

  const handleConnected = () => {
    console.log(`Connected to LiveKit room: ${chatId}`);
    // Trigger a global refresh of participant lists
    window.dispatchEvent(new CustomEvent('livekit-participant-change', { 
      detail: { roomId: chatId, type: 'connected' } 
    }));
  };

  const handleDisconnected = () => {
    console.log(`Disconnected from LiveKit room: ${chatId}`);
    // Trigger a global refresh of participant lists
    window.dispatchEvent(new CustomEvent('livekit-participant-change', { 
      detail: { roomId: chatId, type: 'disconnected' } 
    }));
  };

  return (
    <LiveKitRoom
      data-lk-theme="default"
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      token={token}
      connect={true}
      video={video}
      audio={audio}
      onConnected={handleConnected}
      onDisconnected={handleDisconnected}
    >
      <VideoConference />
    </LiveKitRoom>
  )
}