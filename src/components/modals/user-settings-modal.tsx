"use client";

import { useState, useEffect } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { Camera, User, Bell, Shield, Palette, LogOut, Mic } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useModal } from "@/hooks/use-modal-store";
import { useAudioControls } from "@/hooks/use-audio-controls";
import { UserAvatar } from "@/components/user-avatar";

const settingsTabs = [
  { id: "profile", label: "My Account", icon: User },
  { id: "audio", label: "Voice & Video", icon: Mic },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "privacy", label: "Privacy & Safety", icon: Shield },
  { id: "appearance", label: "Appearance", icon: Palette },
];

export const UserSettingsModal = () => {
  const { isOpen, onClose, type } = useModal();
  const { user } = useUser();
  const { signOut } = useClerk();
  const {
    audioSettings,
    setInputVolume,
    setOutputVolume,
    setInputDevice,
    setOutputDevice,
    refreshDevices,
  } = useAudioControls();
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState({
    // Profile settings
    displayName: user?.fullName || "",
    
    // Notification settings
    messageNotifications: true,
    mentionNotifications: true,
    soundEnabled: true,
    
    // Privacy settings
    showOnlineStatus: true,
    allowDirectMessages: true,
    showActivity: true,
    
    // Appearance settings
    theme: "dark",
    compactMode: false,
    showAvatars: true,
  });

  const isModalOpen = isOpen && type === "userSettings";

  // Update settings when user data changes
  useEffect(() => {
    if (user) {
      setSettings(prev => ({
        ...prev,
        displayName: user.fullName || "",
      }));
    }
  }, [user]);

  const handleSettingChange = (key: string, value: boolean | string) => {
    setError(null); // Clear error when user makes changes
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    if (!settings.displayName.trim()) {
      setError("Display name cannot be empty");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Update profile in our database first
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          displayName: settings.displayName,
          imageUrl: user?.imageUrl,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to update profile');
      }

      // Try to update Clerk user data, but don't fail if it doesn't work
      if (user && settings.displayName.trim()) {
        try {
          // Split display name into first and last name for Clerk
          const nameParts = settings.displayName.trim().split(' ');
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ');
          
          // Only include lastName if it's not empty
          const updateData: { firstName: string; lastName?: string } = {
            firstName: firstName,
          };
          
          if (lastName) {
            updateData.lastName = lastName;
          }
          
          await user.update(updateData);
        } catch (clerkError) {
          // Log the Clerk error but don't fail the whole operation
          console.log("Clerk update failed (this is often okay):", clerkError);
        }
      }
      
      console.log("Settings saved successfully");
      onClose();
      
      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      console.log("Error saving settings:", error);
      setError(error instanceof Error ? error.message : "Failed to save settings. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      onClose();
    } catch (error) {
      console.log("Error signing out:", error);
    }
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <UserAvatar
          src={user?.imageUrl}
          name={user?.fullName || "User"}
          size="lg"
          className="relative"
        />
        <Button variant="outline" size="sm">
          <Camera className="h-4 w-4 mr-2" />
          Change Avatar
        </Button>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="displayName">Display Name</Label>
          <Input
            id="displayName"
            value={settings.displayName}
            onChange={(e) => handleSettingChange("displayName", e.target.value)}
            className="mt-1"
            placeholder="Enter your display name"
          />
          <p className="text-xs text-muted-foreground mt-1">
            This is how other users will see your name
          </p>
        </div>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label>Message Notifications</Label>
            <p className="text-sm text-muted-foreground">Get notified for new messages</p>
          </div>
          <Switch
            checked={settings.messageNotifications}
            onCheckedChange={(checked) => handleSettingChange("messageNotifications", checked)}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <Label>Mention Notifications</Label>
            <p className="text-sm text-muted-foreground">Get notified when someone mentions you</p>
          </div>
          <Switch
            checked={settings.mentionNotifications}
            onCheckedChange={(checked) => handleSettingChange("mentionNotifications", checked)}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <Label>Sound Effects</Label>
            <p className="text-sm text-muted-foreground">Play sounds for notifications</p>
          </div>
          <Switch
            checked={settings.soundEnabled}
            onCheckedChange={(checked) => handleSettingChange("soundEnabled", checked)}
          />
        </div>
      </div>
    </div>
  );

  const renderPrivacyTab = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label>Show Online Status</Label>
            <p className="text-sm text-muted-foreground">Let others see when you&apos;re online</p>
          </div>
          <Switch
            checked={settings.showOnlineStatus}
            onCheckedChange={(checked) => handleSettingChange("showOnlineStatus", checked)}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <Label>Allow Direct Messages</Label>
            <p className="text-sm text-muted-foreground">Allow others to send you direct messages</p>
          </div>
          <Switch
            checked={settings.allowDirectMessages}
            onCheckedChange={(checked) => handleSettingChange("allowDirectMessages", checked)}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <Label>Show Activity</Label>
            <p className="text-sm text-muted-foreground">Display what you&apos;re currently doing</p>
          </div>
          <Switch
            checked={settings.showActivity}
            onCheckedChange={(checked) => handleSettingChange("showActivity", checked)}
          />
        </div>
      </div>
    </div>
  );

  const renderAudioTab = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label>Input Device</Label>
          <Select 
            value={audioSettings.inputDevice || "default"} 
            onValueChange={setInputDevice}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select microphone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default Microphone</SelectItem>
              {audioSettings.availableInputDevices.map((device) => (
                <SelectItem key={device.deviceId} value={device.deviceId}>
                  {device.label || `Microphone ${device.deviceId.slice(0, 8)}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Output Device</Label>
          <Select 
            value={audioSettings.outputDevice || "default"} 
            onValueChange={setOutputDevice}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select speakers/headphones" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default Speakers</SelectItem>
              {audioSettings.availableOutputDevices.map((device) => (
                <SelectItem key={device.deviceId} value={device.deviceId}>
                  {device.label || `Speaker ${device.deviceId.slice(0, 8)}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Input Volume: {audioSettings.inputVolume}%</Label>
          <input
            type="range"
            min="0"
            max="100"
            value={audioSettings.inputVolume}
            onChange={(e) => setInputVolume(parseInt(e.target.value))}
            className="w-full mt-2"
          />
        </div>

        <div>
          <Label>Output Volume: {audioSettings.outputVolume}%</Label>
          <input
            type="range"
            min="0"
            max="100"
            value={audioSettings.outputVolume}
            onChange={(e) => setOutputVolume(parseInt(e.target.value))}
            className="w-full mt-2"
          />
        </div>

        <Button 
          variant="outline" 
          onClick={refreshDevices}
          className="w-full"
        >
          Refresh Devices
        </Button>
      </div>
    </div>
  );

  const renderAppearanceTab = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label>Compact Mode</Label>
            <p className="text-sm text-muted-foreground">Use a more compact message layout</p>
          </div>
          <Switch
            checked={settings.compactMode}
            onCheckedChange={(checked) => handleSettingChange("compactMode", checked)}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <Label>Show Avatars</Label>
            <p className="text-sm text-muted-foreground">Display user avatars in messages</p>
          </div>
          <Switch
            checked={settings.showAvatars}
            onCheckedChange={(checked) => handleSettingChange("showAvatars", checked)}
          />
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return renderProfileTab();
      case "audio":
        return renderAudioTab();
      case "notifications":
        return renderNotificationsTab();
      case "privacy":
        return renderPrivacyTab();
      case "appearance":
        return renderAppearanceTab();
      default:
        return renderProfileTab();
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card text-foreground p-0 overflow-hidden border-border h-[700px]" style={{ width: '95vw', maxWidth: 'none' }}>
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-64 bg-muted/30 p-4 border-r border-border">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-lg font-bold">User Settings</DialogTitle>
            </DialogHeader>
            
            <nav className="space-y-1">
              {settingsTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setError(null); // Clear error when changing tabs
                    }}
                    className={`w-full flex items-center space-x-3 px-3 py-2 text-left text-sm rounded-md transition-colors ${
                      activeTab === tab.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="mb-6">
              <h2 className="text-xl font-semibold">
                {settingsTabs.find(tab => tab.id === activeTab)?.label}
              </h2>
            </div>
            
            {renderTabContent()}
            
            <Separator className="my-6" />
            
            {error && (
              <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}
            
            <div className="flex justify-between">
              <Button 
                variant="destructive" 
                onClick={handleLogout}
                className="flex items-center space-x-2"
                disabled={isLoading}
              >
                <LogOut className="h-4 w-4" />
                <span>Log Out</span>
              </Button>
              <div className="flex space-x-3">
                <Button variant="outline" onClick={onClose} disabled={isLoading}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};