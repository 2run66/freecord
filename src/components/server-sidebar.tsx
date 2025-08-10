"use client";

import { Plus, Compass, Bell, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { useModal } from "@/hooks/use-modal-store";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import ServerSidebarButton from "@/components/ui/server-sidebar-button";
import { useEffect, useState } from "react";

interface Server {
  id: string;
  name: string;
  avatar?: string;
}

interface ServerSidebarProps {
  servers: Server[];
  currentServerId?: string;
}

export const ServerSidebar = ({ servers, currentServerId }: ServerSidebarProps) => {
  const { onOpen } = useModal();
  const router = useRouter();
  const [friendCount, setFriendCount] = useState<number>(0);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  useEffect(() => {
    // Lightweight fetch of friend count
    (async () => {
      try {
        const res = await fetch("/api/friends");
        if (res.ok) {
          const friends = await res.json();
          setFriendCount(Array.isArray(friends) ? friends.length : 0);
        }
      } catch {
        setFriendCount(0);
      }
    })();
  }, []);

  const handleServerClick = (serverId: string) => {
    router.push(`/servers/${serverId}`);
  };

  return (
    <div
      className={`relative bg-zinc-900 flex flex-col items-center py-3 space-y-2 transition-[width] duration-200 overflow-visible z-0 ${
        isCollapsed ? "w-8" : "w-[72px]"
      }`}
    >
      {/* Collapse/Expand handle */}
      <button
        type="button"
        aria-label={isCollapsed ? "Expand server sidebar" : "Collapse server sidebar"}
        onClick={() => setIsCollapsed((v) => !v)}
        className={`absolute top-1/2 -translate-y-1/2 -right-3 z-10 rounded-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 p-1 shadow`}
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4 text-zinc-300" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-zinc-300" />
        )}
      </button>

      {isCollapsed ? (
        <div className="flex-1" />
      ) : (
        <>
          {/* Freecord Home */}
          <div className="relative">
            <ServerSidebarButton
              label="Home"
              onClick={() => router.push("/")}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg hover:rounded-2xl shadow-lg"
            >
              F
            </ServerSidebarButton>
          </div>
          
          {/* Separator */}
          <Separator className="w-8 h-0.5 bg-zinc-700 rounded-full" />
          
          {/* Friends & Notifications quick slots (above first server) */}
          <div className="flex flex-col items-center gap-2 mb-1">
            <ServerSidebarButton
              label="Friends"
              onClick={() => onOpen("friends")}
              className="bg-zinc-700 hover:bg-zinc-600 text-zinc-300 hover:text-white hover:rounded-2xl"
              badgeCount={friendCount}
            >
              <Users className="w-5 h-5" />
            </ServerSidebarButton>
            <ServerSidebarButton
              label="Notifications"
              onClick={() => onOpen("notifications")}
              className="bg-zinc-700 hover:bg-zinc-600 text-zinc-300 hover:text-white hover:rounded-2xl"
            >
              <Bell className="w-5 h-5" />
            </ServerSidebarButton>
          </div>
          
          {/* Server List */}
          {servers.map((server) => {
            const isActive = currentServerId === server.id;
            return (
              <div key={server.id} className="relative">
                {/* Active indicator bar */}
                {isActive && (
                  <div className="absolute -left-3 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
                )}
                <ServerSidebarButton
                  label={server.name}
                  onClick={() => handleServerClick(server.id)}
                  className={`font-semibold ${
                    isActive
                      ? "bg-primary text-primary-foreground rounded-2xl shadow-lg ring-2 ring-primary/50"
                      : "bg-zinc-700 hover:bg-zinc-600 text-zinc-300 hover:rounded-2xl hover:bg-primary/20"
                  }`}
                >
                  {server.avatar ? (
                    <img
                      src={server.avatar}
                      alt={server.name}
                      className={`w-full h-full object-cover transition-all duration-200 ${
                        isActive ? "rounded-2xl" : "rounded-full hover:rounded-2xl"
                      }`}
                    />
                  ) : (
                    server.name.substring(0, 2).toUpperCase()
                  )}
                </ServerSidebarButton>
              </div>
            );
          })}
          
          {/* Add Server */}
          <ServerSidebarButton
            label="Create Server"
            onClick={() => onOpen("createServer")}
            className="bg-zinc-700 hover:bg-green-600 text-green-500 hover:text-white font-bold text-2xl hover:rounded-2xl"
          >
            <Plus className="w-6 h-6" />
          </ServerSidebarButton>

          {/* Discover Servers */}
          <ServerSidebarButton
            label="Discover Servers"
            onClick={() => onOpen("serverDiscovery")}
            className="bg-zinc-700 hover:bg-blue-600 text-blue-500 hover:text-white hover:rounded-2xl"
          >
            <Compass className="w-5 h-5" />
          </ServerSidebarButton>

          {/* Join Server */}
          <ServerSidebarButton
            label="Join Server"
            onClick={() => onOpen("joinServer")}
            className="bg-zinc-700 hover:bg-purple-600 text-purple-500 hover:text-white hover:rounded-2xl text-xl font-bold"
          >
            +
          </ServerSidebarButton>
        </>
      )}
    </div>
  );
};