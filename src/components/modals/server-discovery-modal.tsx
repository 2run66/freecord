"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Users, Globe, Plus } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useModal } from "@/hooks/use-modal-store";

interface PublicServer {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  memberCount: number;
  isPublic: boolean;
  inviteCode: string;
}

export const ServerDiscoveryModal = () => {
  const { isOpen, onClose, type } = useModal();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [servers, setServers] = useState<PublicServer[]>([]);

  const isModalOpen = isOpen && type === "serverDiscovery";

  useEffect(() => {
    if (isModalOpen) {
      fetchPublicServers();
    }
  }, [isModalOpen, searchQuery]);

  const fetchPublicServers = async () => {
    try {
      const url = new URL("/api/servers/public", window.location.origin);
      if (searchQuery) {
        url.searchParams.set("search", searchQuery);
      }

      const response = await fetch(url.toString());
      if (response.ok) {
        const publicServers = await response.json();
        setServers(publicServers);
      } else {
        setServers([]);
      }
    } catch (error) {
      console.log("Error fetching servers:", error);
      setServers([]);
    }
  };

  const handleJoinServer = async (server: PublicServer) => {
    try {
      setIsLoading(true);
      
      const response = await fetch("/api/servers/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inviteCode: server.inviteCode,
        }),
      });

      if (response.ok) {
        const joinedServer = await response.json();
        onClose();
        router.push(`/servers/${joinedServer.id}`);
        router.refresh();
      } else {
        console.error("Failed to join server");
      }
    } catch (error) {
      console.log("Error joining server:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredServers = servers.filter(server =>
    server.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    server.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card text-foreground p-0 overflow-hidden border-border max-w-2xl">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Discover Servers
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Find and join public communities
          </DialogDescription>
        </DialogHeader>
        
        <div className="px-6 pb-6">
          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              className="pl-10 bg-input border-border"
              placeholder="Search servers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Server List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredServers.length === 0 ? (
              <div className="text-center py-8">
                <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No servers found</p>
              </div>
            ) : (
              filteredServers.map((server) => (
                <div
                  key={server.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                      {server.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold">{server.name}</h3>
                      {server.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {server.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          <Users className="h-3 w-3 mr-1" />
                          {server.memberCount.toLocaleString()}
                        </Badge>
                        {server.isPublic && (
                          <Badge variant="outline" className="text-xs">
                            <Globe className="h-3 w-3 mr-1" />
                            Public
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => handleJoinServer(server)}
                    disabled={isLoading}
                    size="sm"
                    className="flex items-center space-x-1"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Join</span>
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};