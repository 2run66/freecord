"use client";

import { useAudio } from "@/components/providers/audio-provider";
import { useCallback, useEffect, useState } from "react";

export const useAudioControls = () => {
  const {
    audioSettings,
    toggleMicrophone,
    toggleHeadphones,
    setInputVolume,
    setOutputVolume,
    setInputDevice,
    setOutputDevice,
    refreshDevices,
    requestMicrophonePermission,
  } = useAudio();

  const [hasPermission, setHasPermission] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  // Check if we already have permission
  useEffect(() => {
    const checkPermission = async () => {
      try {
        const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        setHasPermission(permission.state === 'granted');
        
        permission.addEventListener('change', () => {
          setHasPermission(permission.state === 'granted');
        });
      } catch (error) {
        // Fallback for browsers that don't support permissions API
        console.log("Permissions API not supported, will request on demand");
      }
    };

    checkPermission();
  }, []);

  const handleMicrophoneToggle = useCallback(async () => {
    if (!hasPermission && !isRequesting) {
      setIsRequesting(true);
      const granted = await requestMicrophonePermission();
      setHasPermission(granted);
      setIsRequesting(false);
      
      if (!granted) {
        return; // Don't toggle if permission denied
      }
    }
    
    toggleMicrophone();
  }, [hasPermission, isRequesting, requestMicrophonePermission, toggleMicrophone]);

  const handleHeadphonesToggle = useCallback(() => {
    toggleHeadphones();
  }, [toggleHeadphones]);

  const getMicrophoneIcon = useCallback(() => {
    if (isRequesting) return "mic-off"; // Show as muted while requesting
    return audioSettings.microphoneMuted ? "mic-off" : "mic";
  }, [audioSettings.microphoneMuted, isRequesting]);

  const getHeadphonesIcon = useCallback(() => {
    return audioSettings.headphonesMuted ? "volume-x" : "headphones";
  }, [audioSettings.headphonesMuted]);

  const getMicrophoneTooltip = useCallback(() => {
    if (isRequesting) return "Requesting microphone access...";
    if (!hasPermission) return "Click to enable microphone";
    return audioSettings.microphoneMuted ? "Unmute microphone" : "Mute microphone";
  }, [audioSettings.microphoneMuted, hasPermission, isRequesting]);

  const getHeadphonesTooltip = useCallback(() => {
    return audioSettings.headphonesMuted ? "Unmute headphones" : "Mute headphones";
  }, [audioSettings.headphonesMuted]);

  return {
    // State
    audioSettings,
    hasPermission,
    isRequesting,
    
    // Actions
    handleMicrophoneToggle,
    handleHeadphonesToggle,
    setInputVolume,
    setOutputVolume,
    setInputDevice,
    setOutputDevice,
    refreshDevices,
    
    // Helpers
    getMicrophoneIcon,
    getHeadphonesIcon,
    getMicrophoneTooltip,
    getHeadphonesTooltip,
  };
};