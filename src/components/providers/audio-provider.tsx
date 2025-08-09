"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AudioSettings {
  microphoneMuted: boolean;
  headphonesMuted: boolean;
  inputVolume: number;
  outputVolume: number;
  inputDevice: string | null;
  outputDevice: string | null;
  availableInputDevices: MediaDeviceInfo[];
  availableOutputDevices: MediaDeviceInfo[];
  participantVolumes: Record<string, number>; // participantId -> volume (0-200)
}

interface AudioContextType {
  audioSettings: AudioSettings;
  toggleMicrophone: () => void;
  toggleHeadphones: () => void;
  setInputVolume: (volume: number) => void;
  setOutputVolume: (volume: number) => void;
  setInputDevice: (deviceId: string) => void;
  setOutputDevice: (deviceId: string) => void;
  refreshDevices: () => Promise<void>;
  requestMicrophonePermission: () => Promise<boolean>;
  setParticipantVolume: (participantId: string, volume: number) => void;
  getParticipantVolume: (participantId: string) => number;
  resetParticipantVolume: (participantId: string) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

interface AudioProviderProps {
  children: ReactNode;
}

export const AudioProvider = ({ children }: AudioProviderProps) => {
  const [audioSettings, setAudioSettings] = useState<AudioSettings>({
    microphoneMuted: false,
    headphonesMuted: false,
    inputVolume: 100,
    outputVolume: 100,
    inputDevice: null,
    outputDevice: null,
    availableInputDevices: [],
    availableOutputDevices: [],
    participantVolumes: {},
  });

  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  // Load settings from localStorage on initialization
  useEffect(() => {
    const savedSettings = localStorage.getItem("freecord-audio-settings");
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setAudioSettings(prev => ({
          ...prev,
          ...parsed,
          // Don't restore device arrays from localStorage
          availableInputDevices: [],
          availableOutputDevices: [],
        }));
      } catch (error) {
        console.log("Failed to parse audio settings from localStorage:", error);
      }
    }
    
    // Initialize device enumeration
    refreshDevices();
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    const settingsToSave = {
      microphoneMuted: audioSettings.microphoneMuted,
      headphonesMuted: audioSettings.headphonesMuted,
      inputVolume: audioSettings.inputVolume,
      outputVolume: audioSettings.outputVolume,
      inputDevice: audioSettings.inputDevice,
      outputDevice: audioSettings.outputDevice,
      participantVolumes: audioSettings.participantVolumes,
    };
    localStorage.setItem("freecord-audio-settings", JSON.stringify(settingsToSave));
  }, [audioSettings]);

  const refreshDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const inputDevices = devices.filter(device => device.kind === 'audioinput');
      const outputDevices = devices.filter(device => device.kind === 'audiooutput');
      
      setAudioSettings(prev => ({
        ...prev,
        availableInputDevices: inputDevices,
        availableOutputDevices: outputDevices,
        // Set default devices if none selected
        inputDevice: prev.inputDevice || (inputDevices[0]?.deviceId || null),
        outputDevice: prev.outputDevice || (outputDevices[0]?.deviceId || null),
      }));
    } catch (error) {
      console.log("Failed to enumerate devices:", error);
    }
  };

  const requestMicrophonePermission = async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          deviceId: audioSettings.inputDevice ? { exact: audioSettings.inputDevice } : undefined,
        }
      });
      
      setMediaStream(stream);
      
      // Apply mute state to the stream
      const audioTracks = stream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !audioSettings.microphoneMuted;
      });
      
      // Refresh devices after getting permission
      await refreshDevices();
      return true;
    } catch (error) {
      console.log("Failed to get microphone permission:", error);
      return false;
    }
  };

  const toggleMicrophone = () => {
    setAudioSettings(prev => {
      const newMuted = !prev.microphoneMuted;
      
      // Update media stream if available
      if (mediaStream) {
        const audioTracks = mediaStream.getAudioTracks();
        audioTracks.forEach(track => {
          track.enabled = !newMuted;
        });
      }
      
      return {
        ...prev,
        microphoneMuted: newMuted,
      };
    });
  };

  const toggleHeadphones = () => {
    setAudioSettings(prev => ({
      ...prev,
      headphonesMuted: !prev.headphonesMuted,
    }));
  };

  const setInputVolume = (volume: number) => {
    setAudioSettings(prev => ({
      ...prev,
      inputVolume: Math.max(0, Math.min(100, volume)),
    }));
  };

  const setOutputVolume = (volume: number) => {
    setAudioSettings(prev => ({
      ...prev,
      outputVolume: Math.max(0, Math.min(100, volume)),
    }));
  };

  const setInputDevice = (deviceId: string) => {
    setAudioSettings(prev => ({
      ...prev,
      inputDevice: deviceId,
    }));
    
    // If we have an active stream, restart with new device
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      requestMicrophonePermission();
    }
  };

  const setOutputDevice = (deviceId: string) => {
    setAudioSettings(prev => ({
      ...prev,
      outputDevice: deviceId,
    }));
  };

  const setParticipantVolume = (participantId: string, volume: number) => {
    const clampedVolume = Math.max(0, Math.min(200, volume)); // 0-200% range
    setAudioSettings(prev => ({
      ...prev,
      participantVolumes: {
        ...prev.participantVolumes,
        [participantId]: clampedVolume,
      },
    }));
  };

  const getParticipantVolume = (participantId: string): number => {
    return audioSettings.participantVolumes[participantId] ?? 100; // Default to 100%
  };

  const resetParticipantVolume = (participantId: string) => {
    setAudioSettings(prev => {
      const newVolumes = { ...prev.participantVolumes };
      delete newVolumes[participantId];
      return {
        ...prev,
        participantVolumes: newVolumes,
      };
    });
  };

  // Listen for device changes
  useEffect(() => {
    const handleDeviceChange = () => {
      refreshDevices();
    };
    
    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
    };
  }, []);

  // Cleanup media stream on unmount
  useEffect(() => {
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [mediaStream]);

  const contextValue: AudioContextType = {
    audioSettings,
    toggleMicrophone,
    toggleHeadphones,
    setInputVolume,
    setOutputVolume,
    setInputDevice,
    setOutputDevice,
    refreshDevices,
    requestMicrophonePermission,
    setParticipantVolume,
    getParticipantVolume,
    resetParticipantVolume,
  };

  return (
    <AudioContext.Provider value={contextValue}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
};