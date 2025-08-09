"use client";

import { useState, useEffect } from "react";
import { Settings, Users, Shield, Trash2, Copy, Eye } from "lucide-react";

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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useModal } from "@/hooks/use-modal-store";

const settingsTabs = [
  { id: "general", label: "Overview", icon: Settings },
  { id: "members", label: "Members", icon: Users },
  { id: "roles", label: "Roles", icon: Shield },
];

interface ServerMember {
  id: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  role: "ADMIN" | "MODERATOR" | "GUEST";
  joinedAt: Date;
}

interface ServerRole {
  id: string;
  name: string;
  color: string;
  permissions: string[];
  memberCount: number;
}

export const ServerSettingsModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const [activeTab, setActiveTab] = useState("general");
  const [serverSettings, setServerSettings] = useState({
    name: data?.server?.name || "",
    description: "",
    isPublic: false,
    allowInvites: true,
    inviteCode: "",
  });

  const [members, setMembers] = useState<ServerMember[]>([]);

  useEffect(() => {
    const fetchServerData = async () => {
      try {
        // Fetch server details including invite code
        const serverResponse = await fetch(`/api/servers/${data?.server?.id}/invite`);
        if (serverResponse.ok) {
          const serverData = await serverResponse.json();
          setServerSettings(prev => ({
            ...prev,
            name: serverData.name,
            inviteCode: serverData.inviteCode,
          }));
        }

        // Fetch server members
        const membersResponse = await fetch(`/api/servers/${data?.server?.id}/members`);
        if (membersResponse.ok) {
          const memberData = await membersResponse.json();
          setMembers(memberData);
        }
      } catch (error) {
        console.log("Error fetching server data:", error);
      }
    };

    if (isOpen && type === "serverSettings" && data?.server?.id) {
      fetchServerData();
    }
  }, [isOpen, type, data?.server?.id]);

  // Calculate roles from actual member data
  const roles = [
    {
      id: "ADMIN",
      name: "Admin",
      color: "#ff6b6b",
      permissions: ["MANAGE_SERVER", "MANAGE_CHANNELS", "MANAGE_MEMBERS", "KICK_MEMBERS", "MANAGE_MESSAGES"],
      memberCount: members.filter(m => m.role === "ADMIN").length
    },
    {
      id: "MODERATOR",
      name: "Moderator", 
      color: "#4ecdc4",
      permissions: ["MANAGE_MESSAGES", "KICK_MEMBERS"],
      memberCount: members.filter(m => m.role === "MODERATOR").length
    },
    {
      id: "GUEST",
      name: "Member",
      color: "#95a5a6",
      permissions: ["SEND_MESSAGES", "READ_MESSAGES"],
      memberCount: members.filter(m => m.role === "GUEST").length
    }
  ];

  const isModalOpen = isOpen && type === "serverSettings";

  const handleSettingChange = (key: string, value: any) => {
    setServerSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };



  const copyInviteCode = async () => {
    try {
      if (serverSettings.inviteCode) {
        await navigator.clipboard.writeText(serverSettings.inviteCode);
        console.log("Invite code copied to clipboard:", serverSettings.inviteCode);
        // TODO: Show success toast
      }
    } catch (error) {
      console.log("Error copying invite code:", error);
    }
  };

  const generateNewInviteCode = async () => {
    try {
      const response = await fetch(`/api/servers/${data?.server?.id}/invite`, {
        method: "POST",
      });
      if (response.ok) {
        const serverData = await response.json();
        setServerSettings(prev => ({
          ...prev,
          inviteCode: serverData.inviteCode
        }));
        console.log("New invite code generated:", serverData.inviteCode);
      }
    } catch (error) {
      console.log("Error generating invite code:", error);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: "ADMIN" | "MODERATOR" | "GUEST") => {
    try {
      const response = await fetch(`/api/servers/${data?.server?.id}/members`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ memberId, role: newRole }),
      });

      if (response.ok) {
        // Refresh members list
        const membersResponse = await fetch(`/api/servers/${data?.server?.id}/members`);
        if (membersResponse.ok) {
          const memberData = await membersResponse.json();
          setMembers(memberData);
        }
      } else {
        const errorData = await response.json();
        console.log("Error changing role:", errorData.message || "Failed to change role");
      }
    } catch (error) {
      console.log("Error changing member role:", error);
    }
  };

  // Get current user's role to determine permissions
  const getCurrentUserRole = () => {
    // In a real app, you'd get this from your auth context
    // For now, assuming the first admin is the current user
    const currentUser = members.find(m => m.role === "ADMIN");
    return currentUser?.role || "GUEST";
  };

  const canManageRoles = (memberRole: string) => {
    const currentUserRole = getCurrentUserRole();
    
    // Only admins can change roles
    if (currentUserRole !== "ADMIN") return false;
    
    // Can't change other admin roles (prevent lockout)
    if (memberRole === "ADMIN") return false;
    
    return true;
  };

  const handleKickMember = async (memberId: string) => {
    try {
      const response = await fetch(`/api/servers/${data?.server?.id}/members`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ memberId }),
      });

      if (response.ok) {
        // Refresh members list
        const membersResponse = await fetch(`/api/servers/${data?.server?.id}/members`);
        if (membersResponse.ok) {
          const memberData = await membersResponse.json();
          setMembers(memberData);
        }
      }
    } catch (error) {
      console.log("Error kicking member:", error);
    }
  };

  const renderGeneralTab = () => (
    <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
      <div className="space-y-4">
        <div>
          <Label htmlFor="serverName">Server Name</Label>
          <Input
            id="serverName"
            value={serverSettings.name}
            onChange={(e) => handleSettingChange("name", e.target.value)}
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="serverDescription">Description</Label>
          <Input
            id="serverDescription"
            value={serverSettings.description}
            onChange={(e) => handleSettingChange("description", e.target.value)}
            placeholder="Tell people what this server is about..."
            className="mt-1"
          />
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex-1">
            <Label>Public Server</Label>
            <p className="text-sm text-muted-foreground">Allow anyone to discover and join</p>
          </div>
          <Switch
            checked={serverSettings.isPublic}
            onCheckedChange={(checked) => handleSettingChange("isPublic", checked)}
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex-1">
            <Label>Allow Invites</Label>
            <p className="text-sm text-muted-foreground">Let members create invite links</p>
          </div>
          <Switch
            checked={serverSettings.allowInvites}
            onCheckedChange={(checked) => handleSettingChange("allowInvites", checked)}
          />
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <Label>Invite Code</Label>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
          <Input
            value={serverSettings.inviteCode}
            readOnly
            className="flex-1"
          />
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={copyInviteCode} className="whitespace-nowrap">
              <Copy className="h-4 w-4 mr-1" />
              Copy
            </Button>
            <Button variant="outline" size="sm" onClick={generateNewInviteCode} className="whitespace-nowrap">
              Regenerate
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMembersTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Server Members ({members.length})</h3>
      </div>
      
      <div className="max-h-96 overflow-y-auto pr-2 space-y-2">
        {members.map((member) => (
          <div key={member.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm flex-shrink-0">
                {member.user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium truncate">{member.user.name}</p>
                <p className="text-sm text-muted-foreground">
                  Joined {new Date(member.joinedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 flex-shrink-0">
              {canManageRoles(member.role) ? (
                <div className="flex items-center gap-2">
                  <Select
                    value={member.role}
                    onValueChange={(newRole: "ADMIN" | "MODERATOR" | "GUEST") => 
                      handleRoleChange(member.id, newRole)
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">
                        <span className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          Admin
                        </span>
                      </SelectItem>
                      <SelectItem value="MODERATOR">
                        <span className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          Moderator
                        </span>
                      </SelectItem>
                      <SelectItem value="GUEST">
                        <span className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                          Member
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleKickMember(member.id)}
                    className="px-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Badge variant={member.role === "ADMIN" ? "destructive" : member.role === "MODERATOR" ? "default" : "secondary"}>
                    {member.role}
                  </Badge>
                  {member.role === "ADMIN" && (
                    <span className="text-xs text-muted-foreground">Server Owner</span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderRolesTab = () => (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h3 className="font-semibold">Server Roles ({members.length} total members)</h3>
        <p className="text-sm text-muted-foreground">Role permissions are managed automatically</p>
      </div>
      
      <div className="max-h-80 overflow-y-auto pr-2 space-y-2">
        {roles.map((role) => (
          <div key={role.id} className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-4 border border-border rounded-lg gap-3">
            <div className="flex items-start space-x-3 min-w-0 flex-1">
              <div 
                className="h-4 w-4 rounded-full flex-shrink-0 mt-1" 
                style={{ backgroundColor: role.color }}
              />
              <div className="min-w-0 flex-1">
                <p className="font-medium">{role.name}</p>
                <p className="text-sm text-muted-foreground">
                  {role.memberCount} {role.memberCount === 1 ? 'member' : 'members'} • {role.permissions.length} permissions
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {role.permissions.slice(0, 4).map((permission) => (
                    <span key={permission} className="text-xs bg-muted px-2 py-1 rounded">
                      {permission.replace(/_/g, ' ').toLowerCase()}
                    </span>
                  ))}
                  {role.permissions.length > 4 && (
                    <span className="text-xs text-muted-foreground py-1">
                      +{role.permissions.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end lg:justify-start space-x-2 flex-shrink-0">
              <Badge variant={
                role.id === "ADMIN" ? "destructive" : 
                role.id === "MODERATOR" ? "default" : "secondary"
              }>
                {role.name}
              </Badge>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 p-4 bg-muted/50 rounded-lg">
        <p className="text-sm text-muted-foreground">
          <strong>Role Hierarchy:</strong> Admin &gt; Moderator &gt; Member
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Admins can manage everything. Moderators can manage messages and kick members. Members have basic chat permissions.
        </p>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "general":
        return renderGeneralTab();
      case "members":
        return renderMembersTab();
      case "roles":
        return renderRolesTab();
      default:
        return renderGeneralTab();
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card text-foreground p-0 overflow-hidden border-border h-[700px]" style={{ width: '95vw', maxWidth: 'none' }}>
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-64 bg-muted/30 p-4 border-r border-border">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-lg font-bold">Server Settings</DialogTitle>
            </DialogHeader>
            
            <nav className="space-y-1">
              {settingsTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};