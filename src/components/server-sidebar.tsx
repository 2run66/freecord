"use client";

import { Plus, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal-store";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";

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

  const handleServerClick = (serverId: string) => {
    router.push(`/servers/${serverId}`);
  };

  return (
    <div className="w-[72px] bg-zinc-900 flex flex-col items-center py-3 space-y-2">
      {/* Freecord Home */}
      <div className="relative">
        <div 
          onClick={() => router.push("/")}
          className="w-12 h-12 rounded-full bg-primary hover:bg-primary/90 flex items-center justify-center text-primary-foreground font-bold text-lg cursor-pointer transition-all duration-200 hover:rounded-2xl shadow-lg"
          title="Home"
        >
          F
        </div>
      </div>
      
      {/* Separator */}
      <Separator className="w-8 h-0.5 bg-zinc-700 rounded-full" />
      
      {/* Server List */}
      {servers.map((server) => {
        const isActive = currentServerId === server.id;
        return (
          <div key={server.id} className="relative">
            {/* Active indicator bar */}
            {isActive && (
              <div className="absolute -left-3 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
            )}
            <div
              onClick={() => handleServerClick(server.id)}
              className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold cursor-pointer transition-all duration-200 ${
                isActive 
                  ? "bg-primary text-primary-foreground rounded-2xl shadow-lg ring-2 ring-primary/50" 
                  : "bg-zinc-700 hover:bg-zinc-600 text-zinc-300 hover:rounded-2xl hover:bg-primary/20"
              }`}
              title={server.name}
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
            </div>
          </div>
        );
      })}
      
      {/* Add Server */}
      <div 
        onClick={() => onOpen("createServer")}
        className="w-12 h-12 rounded-full bg-zinc-700 hover:bg-green-600 flex items-center justify-center text-green-500 hover:text-white font-bold text-2xl cursor-pointer transition-all duration-200 hover:rounded-2xl"
      >
        <Plus className="w-6 h-6" />
      </div>

      {/* Discover Servers */}
      <div 
        onClick={() => onOpen("serverDiscovery")}
        className="w-12 h-12 rounded-full bg-zinc-700 hover:bg-blue-600 flex items-center justify-center text-blue-500 hover:text-white cursor-pointer transition-all duration-200 hover:rounded-2xl"
      >
        <Compass className="w-5 h-5" />
      </div>

      {/* Join Server */}
      <div 
        onClick={() => onOpen("joinServer")}
        className="w-12 h-12 rounded-full bg-zinc-700 hover:bg-purple-600 flex items-center justify-center text-purple-500 hover:text-white cursor-pointer transition-all duration-200 hover:rounded-2xl text-xl font-bold"
      >
        +
      </div>
    </div>
  );
};