"use client";

import { useEffect, useState } from "react";
import { UserAvatar } from "@/components/user-avatar";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import { useModal } from "@/hooks/use-modal-store";
import { useAudio } from "@/components/providers/audio-provider";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface VoiceParticipant {
  sid: string;
  identity: string;
  name: string;
  avatar?: string;
  joinedAt?: number;
}

interface VoiceChannelUsersProps {
  channelId: string;
  className?: string;
}

export const VoiceChannelUsers = ({ channelId, className }: VoiceChannelUsersProps) => {
  const [participants, setParticipants] = useState<VoiceParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const { onOpen } = useModal();
  const { getParticipantVolume } = useAudio();

  // Fetch participants for this voice channel
  const fetchParticipants = async () => {
    try {
      const response = await fetch(`/api/room-participants/${channelId}`);
      if (response.ok) {
        const data = await response.json();
        setParticipants(data.participants || []);
      } else {
        setParticipants([]);
      }
    } catch (error) {
      console.log("Error fetching participants:", error);
      setParticipants([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipants();
    
    // Listen for global LiveKit participant changes
    const handleParticipantChange = (event: CustomEvent) => {
      const { roomId } = event.detail;
      if (roomId === channelId) {
        // Refresh participants for this specific room
        setTimeout(fetchParticipants, 1000); // Small delay to ensure server state is updated
      }
    };

    window.addEventListener('livekit-participant-change', handleParticipantChange as EventListener);
    
    // Refresh participants every 10 seconds as backup
    const interval = setInterval(fetchParticipants, 10000);
    
    return () => {
      window.removeEventListener('livekit-participant-change', handleParticipantChange as EventListener);
      clearInterval(interval);
    };
  }, [channelId]);

  if (loading) {
    return null;
  }

  if (participants.length === 0) {
    return null;
  }

  const handleParticipantClick = (participant: VoiceParticipant) => {
    onOpen("participantVolume", { participant });
  };

  const getVolumeIndicator = (participant: VoiceParticipant) => {
    const volume = getParticipantVolume(participant.sid);
    if (volume === 0) {
      return { icon: VolumeX, color: "text-red-500", tooltip: "Muted", volume };
    } else if (volume < 50) {
      return { icon: Volume2, color: "text-yellow-500", tooltip: `${volume}% (Quiet)`, volume };
    } else if (volume > 150) {
      return { icon: Volume2, color: "text-orange-500", tooltip: `${volume}% (Loud)`, volume };
    } else if (volume !== 100) {
      return { icon: Volume2, color: "text-blue-500", tooltip: `${volume}%`, volume };
    }
    return { icon: Volume2, color: "text-green-500", tooltip: "100% (Normal)", volume };
  };

  return (
    <div className={cn("ml-6 mt-1 space-y-1", className)}>
      {participants.map((participant) => {
        const volumeInfo = getVolumeIndicator(participant);
        const VolumeIcon = volumeInfo.icon;
        
        const isMuted = volumeInfo.volume === 0;
        const isSpeaking = volumeInfo.volume > 120;
        const ringClass = isMuted
          ? "ring-2 ring-red-500/60"
          : isSpeaking
            ? "ring-2 ring-accent/60"
            : "ring-1 ring-border/70";

        return (
          <TooltipProvider key={participant.sid}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="group flex items-center gap-2 text-sm px-2.5 py-1.5 rounded-md border border-transparent hover:border-border hover:bg-muted cursor-pointer transition-colors"
                  onClick={() => handleParticipantClick(participant)}
                >
                  <UserAvatar
                    src={participant.avatar}
                    name={participant.name}
                    className={cn("h-6 w-6 rounded-full", ringClass)}
                  />
                  <span className="truncate flex-1 text-muted-foreground group-hover:text-foreground">
                    {participant.name}
                  </span>
                  <div className="flex items-center gap-1">
                    {isMuted ? (
                      <MicOff className="h-3.5 w-3.5 text-red-500" />
                    ) : (
                      <Mic className="h-3.5 w-3.5 text-green-500" />
                    )}
                    <VolumeIcon className={cn("h-3.5 w-3.5", volumeInfo.color)} />
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <div className="text-center">
                  <p className="font-medium">{participant.name}</p>
                  <p className="text-xs text-muted-foreground">Volume: {volumeInfo.tooltip}</p>
                  <p className="text-xs text-muted-foreground mt-1">Click to adjust volume</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      })}
    </div>
  );
};