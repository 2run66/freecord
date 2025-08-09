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

  const getVolumeColor = () => {
    if (isMuted || volume === 0) return "text-red-500";
    if (volume < 50) return "text-yellow-500";
    if (volume > 150) return "text-orange-500";
    return "text-green-500";
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
              <div className={`flex items-center space-x-2 ${getVolumeColor()}`}>
                {isMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
                <span className="font-mono text-sm min-w-[3rem] text-right">
                  {volume}%
                </span>
              </div>
            </div>

            {/* Volume Slider */}
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="200"
                step="5"
                value={volume}
                onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
                className="w-full slider"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span>100%</span>
                <span>200%</span>
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

            {/* Volume Presets */}
            <div className="grid grid-cols-4 gap-2">
              {[25, 50, 100, 150].map((preset) => (
                <Button
                  key={preset}
                  variant={volume === preset ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleVolumeChange(preset)}
                  className="text-xs"
                >
                  {preset}%
                </Button>
              ))}
            </div>
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