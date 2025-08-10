"use client";

import { useEffect, useState } from "react";
import { Volume2, VolumeX, RotateCcw } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useModal } from "@/hooks/use-modal-store";
import { useAudio } from "@/components/providers/audio-provider";
import { UserAvatar } from "@/components/user-avatar";

export const ParticipantVolumeModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const { setParticipantVolume, getParticipantVolume, resetParticipantVolume } = useAudio();
  
  const isModalOpen = isOpen && type === "participantVolume";
  const { participant } = data;

  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);

  // Initialize volume when modal opens
  useEffect(() => {
    if (isModalOpen && participant) {
      const currentVolume = getParticipantVolume(participant.sid);
      setVolume(currentVolume);
      setIsMuted(currentVolume === 0);
    }
  }, [isModalOpen, participant, getParticipantVolume]);

  const handleVolumeChange = (newVolume: number) => {
    if (!participant) return;
    
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    setParticipantVolume(participant.sid, newVolume);
  };

  const handleToggleMute = () => {
    if (!participant) return;
    
    if (isMuted) {
      // Unmute - restore to 100% or previous volume
      const newVolume = volume === 0 ? 100 : volume;
      handleVolumeChange(newVolume);
    } else {
      // Mute
      handleVolumeChange(0);
    }
  };

  const handleReset = () => {
    if (!participant) return;
    
    resetParticipantVolume(participant.sid);
    setVolume(100);
    setIsMuted(false);
  };

  const getVolumeBadgeClass = () => {
    if (isMuted || volume === 0) return "bg-red-500/15 text-red-500 border border-red-500/30";
    if (volume < 50) return "bg-yellow-500/15 text-yellow-500 border border-yellow-500/30";
    if (volume > 150) return "bg-orange-500/15 text-orange-500 border border-orange-500/30";
    return "bg-green-500/15 text-green-500 border border-green-500/30";
  };

  const getVolumeDescription = () => {
    if (isMuted || volume === 0) return "Muted";
    if (volume < 50) return "Quiet";
    if (volume === 100) return "Normal";
    if (volume > 150) return "Loud";
    return "Normal";
  };

  if (!participant) {
    return null;
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card text-foreground border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            Adjust User Volume
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* User Info */}
          <div className="flex items-center justify-center space-x-3">
            <UserAvatar 
              src={participant.avatar} 
              name={participant.name} 
              size="lg"
            />
            <div className="text-center">
              <h3 className="font-semibold text-lg">{participant.name}</h3>
              <p className="text-sm text-muted-foreground">
                Volume: {volume}% ({getVolumeDescription()})
              </p>
            </div>
          </div>

          {/* Volume Controls */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Volume Level</Label>
              <div className={`flex items-center gap-2 px-2.5 py-1 rounded-full ${getVolumeBadgeClass()}`}>
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-current/20">
                  {isMuted ? (
                    <VolumeX className="h-3.5 w-3.5" />
                  ) : (
                    <Volume2 className="h-3.5 w-3.5" />
                  )}
                </span>
                <span className="font-mono text-xs min-w-[3rem] text-right">
                  {volume}%
                </span>
              </div>
            </div>

            {/* Volume Slider with Checkpoint Presets Aligned Below */}
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="200"
                step="5"
                value={volume}
                onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
                className="slider w-full"
              />
              <div className="relative h-9">
                <div className="absolute top-0 left-[15px] right-[15px] h-9">
                  {[25, 50, 100, 150].map((preset) => {
                    const leftPercent = (preset / 200) * 100;
                    const isActive = volume === preset;
                    return (
                      <button
                        key={preset}
                        type="button"
                        aria-label={`Set volume to ${preset}%`}
                        onClick={() => handleVolumeChange(preset)}
                        aria-pressed={isActive}
                        className={`absolute -translate-x-1/2 top-0 focus:outline-none rounded-full border px-2 py-0.5 text-[10px] leading-none transition-colors ${
                          isActive
                            ? "bg-primary text-primary-foreground border-primary shadow"
                            : "bg-muted/50 text-muted-foreground border-border hover:bg-primary/10"
                        }`}
                        style={{ left: `${leftPercent}%` }}
                      >
                        {preset}%
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleMute}
                className={`flex-1 ${isMuted ? 'text-red-500 border-red-500' : ''}`}
              >
                {isMuted ? (
                  <>
                    <VolumeX className="h-4 w-4 mr-2" />
                    Unmute
                  </>
                ) : (
                  <>
                    <VolumeX className="h-4 w-4 mr-2" />
                    Mute
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="flex-1"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>

            {/* Removed separate presets grid; presets are inline with slider above */}
          </div>

          {/* Info */}
          <div className="text-xs text-muted-foreground text-center p-3 bg-muted/30 rounded-lg">
            <p>
              <strong>Tip:</strong> Volume above 100% may cause distortion. 
              These settings only affect how loud {participant.name} sounds to you.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};