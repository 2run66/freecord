"use client";

import { useEffect, useMemo, useState } from "react";
import { UserAvatar } from "@/components/user-avatar";
import { useModal } from "@/hooks/use-modal-store";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSocket } from "@/components/providers/socket-provider";

type MemberRole = "ADMIN" | "MODERATOR" | "GUEST";

interface MemberUser {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
}

interface ServerMember {
  id: string;
  role: MemberRole;
  user: MemberUser;
}

interface ChannelMemberSidebarProps {
  serverId: string;
}

const ROLE_ORDER: MemberRole[] = ["ADMIN", "MODERATOR", "GUEST"];
const ROLE_LABEL: Record<MemberRole, string> = {
  ADMIN: "Admins",
  MODERATOR: "Moderators",
  GUEST: "Members",
};

const ROLE_TITLE_CLASS: Record<MemberRole, string> = {
  ADMIN: "text-sky-400",
  MODERATOR: "text-violet-400",
  GUEST: "text-cyan-400",
};

export function ChannelMemberSidebar({ serverId }: ChannelMemberSidebarProps) {
  const [members, setMembers] = useState<ServerMember[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [showContent, setShowContent] = useState<boolean>(true);
  const { onOpen } = useModal();
  const { socket } = useSocket();

  useEffect(() => {
    let isCancelled = false;
    const fetchMembers = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/servers/${serverId}/members`);
        if (res.ok) {
          const data: ServerMember[] = await res.json();
          if (!isCancelled) setMembers(data);
        }
      } catch (err) {
        console.log("Error fetching members:", err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };
    fetchMembers();
    return () => {
      isCancelled = true;
    };
  }, [serverId]);

  // Listen for server members updates and refetch
  useEffect(() => {
    if (!socket) return;
    const handler = (payload: { serverId: string }) => {
      if (payload?.serverId === serverId) {
        // Re-fetch members
        (async () => {
          try {
            const res = await fetch(`/api/servers/${serverId}/members`);
            if (res.ok) {
              const data: ServerMember[] = await res.json();
              setMembers(data);
            }
          } catch (err) {
            console.log("Error refreshing members:", err);
          }
        })();
      }
    };
    socket.on("server-members-updated", handler);
    return () => {
      socket.off("server-members-updated", handler);
    };
  }, [socket, serverId]);

  // Delay mounting content until expand animation finishes
  useEffect(() => {
    if (isCollapsed) {
      setShowContent(false);
      return;
    }
    const timer = setTimeout(() => setShowContent(true), 220); // match transition duration-200
    return () => clearTimeout(timer);
  }, [isCollapsed]);

  const membersByRole = useMemo(() => {
    const grouped: Record<MemberRole, ServerMember[]> = {
      ADMIN: [],
      MODERATOR: [],
      GUEST: [],
    };
    for (const m of members) {
      grouped[m.role].push(m);
    }
    return grouped;
  }, [members]);

  return (
    <div
      className={`relative bg-card border-l border-border flex flex-col transition-[width] duration-200 overflow-visible shrink-0 z-0 ${
        isCollapsed ? "w-8" : "w-60"
      }`}
    >
      <button
        type="button"
        aria-label={isCollapsed ? "Expand members sidebar" : "Collapse members sidebar"}
        onClick={() => setIsCollapsed((v) => !v)}
        className={`absolute top-1/2 -translate-y-1/2 -left-3 z-10 rounded-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 p-1 shadow`}
      >
        {isCollapsed ? (
          <ChevronLeft className="w-4 h-4 text-zinc-300" />
        ) : (
          <ChevronRight className="w-4 h-4 text-zinc-300" />
        )}
      </button>

      {showContent ? (
        <>
          <div className="h-12 border-b border-border flex items-center px-4 font-semibold">
            Members {loading ? "" : `(${members.length})`}
          </div>
          <div className="flex-1 p-2 overflow-y-auto space-y-6">
            {ROLE_ORDER.map((role) => {
              const list = membersByRole[role];
              if (!loading && list.length === 0) return null;
              return (
                <div key={role}>
                  <h3 className={`text-xs font-semibold uppercase tracking-wide mb-2 px-2 ${ROLE_TITLE_CLASS[role]}`}>
                    {ROLE_LABEL[role]} {loading ? "" : `(${list.length})`}
                  </h3>
                  <div className="space-y-1">
                    {loading ? (
                      Array.from({ length: 5 }).map((_, idx) => (
                        <div key={idx} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-muted/60">
                          <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
                          <div className="min-w-0">
                            <div className="text-sm font-medium truncate">
                              <span className="inline-block w-24 h-3 bg-muted animate-pulse rounded" />
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              <span className="inline-block w-20 h-2 bg-muted animate-pulse rounded" />
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      list.map((m: ServerMember) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() =>
                            onOpen("userPublic", {
                              user: {
                                id: m.user.id,
                                name: m.user.name,
                                email: m.user.email,
                                avatar: m.user.avatar || undefined,
                                role: m.role,
                              },
                            })
                          }
                          className="w-full text-left flex items-center gap-2 px-2 py-1 rounded hover:bg-muted/60"
                        >
                          <UserAvatar
                            src={m.user.avatar || undefined}
                            name={m.user.name}
                            size="sm"
                            showStatus={false}
                          />
                          <div className="min-w-0">
                            <div className="text-sm font-medium truncate">
                              {m.user.name}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              @{m.user.id.slice(-6)}
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : null}
    </div>
  );
}

export default ChannelMemberSidebar;


