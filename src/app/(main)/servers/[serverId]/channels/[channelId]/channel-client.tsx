"use client";

import { Hash, Volume2, Settings, UserPlus, Plus, Crown, Mic, MicOff, Headphones, VolumeX, LogOut, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatMessages } from "@/components/chat/chat-messages";
import { MediaRoom } from "@/components/media-room";
import { useModal } from "@/hooks/use-modal-store";
import { useAudioControls } from "@/hooks/use-audio-controls";
import { UserAvatar } from "@/components/user-avatar";
import { DMSection } from "@/components/sidebar/dm-section";
import { ServerSidebar } from "@/components/server-sidebar";
import { ChannelItem } from "@/components/channel-item";
import type { User, Channel } from "@prisma/client";
import { useState, useEffect, useCallback } from "react";
import { useClerk } from "@clerk/nextjs";

interface ChannelPageClientProps {
  channel: Channel;
  profile: User;
  serverId: string;
}

const ChannelPageClient = ({ channel, profile, serverId }: ChannelPageClientProps) => {
  const { onOpen } = useModal();
  const { signOut } = useClerk();
  const {
    audioSettings,
    handleMicrophoneToggle,
    handleHeadphonesToggle,
    getMicrophoneIcon,
    getHeadphonesIcon,
    getMicrophoneTooltip,
    getHeadphonesTooltip,
    isRequesting,
  } = useAudioControls();
  const [servers, setServers] = useState<any[]>([]);
  const [channels, setChannels] = useState<any[]>([]);
  const [serverDetails, setServerDetails] = useState<any>(null);

  const fetchUserServers = useCallback(async () => {
    try {
      const response = await fetch("/api/servers/user");
      if (response.ok) {
        const userServers = await response.json();
        setServers(userServers);
      }
    } catch (error) {
      console.log("Error fetching user servers:", error);
    }
  }, []);

  const fetchServerChannels = useCallback(async () => {
    try {
      const response = await fetch(`/api/servers/${serverId}/channels`);
      if (response.ok) {
        const serverChannels = await response.json();
        setChannels(serverChannels);
      }
    } catch (error) {
      console.log("Error fetching server channels:", error);
    }
  }, [serverId]);

  const fetchServerDetails = useCallback(async () => {
    try {
      const response = await fetch(`/api/servers/${serverId}`);
      if (response.ok) {
        const server = await response.json();
        setServerDetails(server);
      }
    } catch (error) {
      console.log("Error fetching server details:", error);
    }
  }, [serverId]);

  useEffect(() => {
    fetchUserServers();
    fetchServerChannels();
    fetchServerDetails();
  }, [fetchUserServers, fetchServerChannels, fetchServerDetails]);

  const textChannels = channels.filter(ch => ch.type === "TEXT");
  const voiceChannels = channels.filter(ch => ch.type === "VOICE");
  const videoChannels = channels.filter(ch => ch.type === "VIDEO");

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.log("Error signing out:", error);
    }
  };

  const renderMicrophoneIcon = () => {
    const iconType = getMicrophoneIcon();
    if (iconType === "mic-off") {
      return <MicOff className="w-4 h-4" />;
    }
    return <Mic className="w-4 h-4" />;
  };

  const renderHeadphonesIcon = () => {
    const iconType = getHeadphonesIcon();
    if (iconType === "volume-x") {
      return <VolumeX className="w-4 h-4" />;
    }
    return <Headphones className="w-4 h-4" />;
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Server List Sidebar */}
      <ServerSidebar servers={servers} currentServerId={serverId} />

      {/* Channel Sidebar */}
      <div className="w-60 bg-card border-r border-border flex flex-col">
            {/* Server Header */}
    <div
      onClick={() => onOpen("serverSettings", { server: serverDetails })}
      className="h-12 border-b border-border flex items-center px-4 font-semibold hover:bg-muted cursor-pointer transition-colors"
    >
      <Crown className="w-4 h-4 text-yellow-500 mr-2" />
      <span>{serverDetails?.name || "Loading..."}</span>
    </div>

        {/* Channel List */}
        <div className="flex-1 p-2 overflow-y-auto">
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-2 flex items-center justify-between">
              Text Channels
              <Plus 
                onClick={() => onOpen("createChannel", { server: serverDetails })}
                className="w-4 h-4 hover:text-foreground cursor-pointer" 
              />
            </h3>
            <div className="space-y-0.5">
              {textChannels.map((ch) => (
                <ChannelItem
                  key={ch.id}
                  channel={ch}
                  server={serverDetails}
                  isActive={ch.id === channel.id}
                  userRole="ADMIN"
                />
              ))}
            </div>
          </div>

          <div className="mb-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-2 flex items-center justify-between">
              Voice Channels
              <Plus 
                onClick={() => onOpen("createChannel", { server: serverDetails })}
                className="w-4 h-4 hover:text-foreground cursor-pointer" 
              />
            </h3>
            <div className="space-y-0.5">
              {[...voiceChannels, ...videoChannels].map((ch) => (
                <ChannelItem
                  key={ch.id}
                  channel={ch}
                  server={serverDetails}
                  isActive={ch.id === channel.id}
                  userRole="ADMIN"
                />
              ))}
            </div>
          </div>

          {/* Direct Messages Section */}
          <div className="p-2 border-t border-border">
            <DMSection directMessages={[]} />
          </div>
        </div>

        {/* User Panel */}
        <div className="h-14 bg-zinc-800 border-t border-border flex items-center px-2 justify-between">
          <div className="flex items-center flex-1 min-w-0">
            <UserAvatar
              src={profile.avatar || undefined}
              name={profile.name || "User"}
              showStatus={true}
              isOnline={true}
              size="md"
            />
            <div className="ml-2 min-w-0 flex-1">
              <div className="text-sm font-semibold truncate">{profile.name}</div>
              <div className="text-xs text-muted-foreground">#{profile.id.slice(-4)}</div>
            </div>
          </div>
          <div className="flex space-x-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className={`w-8 h-8 p-0 hover:bg-muted transition-colors ${
                      audioSettings.microphoneMuted 
                        ? "text-red-500 hover:text-red-400" 
                        : "text-green-500 hover:text-green-400"
                    }`}
                    onClick={handleMicrophoneToggle}
                    disabled={isRequesting}
                  >
                    {renderMicrophoneIcon()}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>{getMicrophoneTooltip()}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className={`w-8 h-8 p-0 hover:bg-muted transition-colors ${
                      audioSettings.headphonesMuted 
                        ? "text-red-500 hover:text-red-400" 
                        : "text-foreground hover:text-foreground/80"
                    }`}
                    onClick={handleHeadphonesToggle}
                  >
                    {renderHeadphonesIcon()}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>{getHeadphonesTooltip()}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost" className="w-8 h-8 p-0 hover:bg-muted">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => onOpen("userSettings")}>
                  <Settings className="w-4 h-4 mr-2" />
                  User Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="text-red-600 focus:text-red-600 focus:bg-red-50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="h-12 border-b border-border flex items-center px-4 bg-background shadow-sm">
          {channel.type === "TEXT" && <Hash className="w-6 h-6 text-muted-foreground mr-2" />}
          {channel.type === "VOICE" && <Volume2 className="w-6 h-6 text-muted-foreground mr-2" />}
          {channel.type === "VIDEO" && <Volume2 className="w-6 h-6 text-muted-foreground mr-2" />}
          <span className="font-semibold">{channel.name}</span>
          {(channel.type === "VOICE" || channel.type === "VIDEO") && (
            <div className="ml-auto flex items-center">
              <span className="text-sm text-muted-foreground mr-2">
                {channel.type === "VOICE" ? "Voice Channel" : "Video Channel"}
              </span>
            </div>
          )}
          <div className="ml-auto flex items-center space-x-2">
            <Button size="sm" variant="ghost" className="hover:bg-muted">
              <UserPlus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content based on channel type */}
        {channel.type === "TEXT" && (
          <>
            {/* Chat Messages */}
            <ChatMessages
              user={profile}
              name={channel.name}
              chatId={channel.id}
              type="channel"
              apiUrl="/api/messages"
              socketUrl="/api/socket/messages"
              socketQuery={{
                channelId: channel.id,
                serverId: channel.serverId,
              }}
              paramKey="channelId"
              paramValue={channel.id}
            />

            {/* Message Input */}
            <ChatInput
              name={channel.name}
              type="channel"
              apiUrl="/api/socket/messages"
              query={{
                channelId: channel.id,
                serverId: channel.serverId,
              }}
            />
          </>
        )}

        {channel.type === "VOICE" && (
          <MediaRoom
            key={`voice-${channel.id}`}
            chatId={channel.id}
            video={false}
            audio={true}
          />
        )}
        {channel.type === "VIDEO" && (
          <MediaRoom
            key={`video-${channel.id}`}
            chatId={channel.id}
            video={true}
            audio={true}
          />
        )}
      </div>
    </div>
  );
}

export default ChannelPageClient;