"use client";

import { User } from "@prisma/client";
import { Edit, FileIcon, ShieldAlert, ShieldCheck, Trash } from "lucide-react";
import Image from "next/image";
import { useModal } from "@/hooks/use-modal-store";
import { MessageReactions } from "@/components/message-reactions";
import { UserAvatar } from "@/components/user-avatar";

interface Reaction {
  emoji: string;
  count: number;
  userIds: string[];
}

interface ChatItemProps {
  id: string;
  content: string;
  user: User;
  timestamp: string;
  fileUrl: string | null;
  deleted: boolean;
  isUpdated: boolean;
  socketUrl: string;
  socketQuery: Record<string, string>;
  currentUserId: string;
  reactions?: Reaction[];
  isUserOnline?: boolean;
}

const roleIconMap = {
  "GUEST": null,
  "MODERATOR": <ShieldCheck className="h-4 w-4 ml-2 text-indigo-500" />,
  "ADMIN": <ShieldAlert className="h-4 w-4 ml-2 text-rose-500" />,
}

export const ChatItem = ({
  id,
  content,
  user,
  timestamp,
  fileUrl,
  deleted,
  isUpdated,
  socketUrl,
  socketQuery,
  currentUserId,
  reactions = [],
  isUserOnline = false
}: ChatItemProps) => {
  const { onOpen } = useModal();
  
  const handleReactionAdd = async (messageId: string, emoji: string) => {
    try {
      const response = await fetch(`/api/messages/${messageId}/reactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ emoji }),
      });

      if (response.ok) {
        console.log("Reaction added successfully");
      } else {
        console.error("Failed to add reaction");
      }
    } catch (error) {
      console.log("Error adding reaction:", error);
    }
  };

  const handleReactionRemove = async (messageId: string, emoji: string) => {
    try {
      const response = await fetch(`/api/messages/${messageId}/reactions?emoji=${emoji}`, {
        method: "DELETE",
      });

      if (response.ok) {
        console.log("Reaction removed successfully");
      } else {
        console.error("Failed to remove reaction");
      }
    } catch (error) {
      console.log("Error removing reaction:", error);
    }
  };
  const fileType = fileUrl?.split(".").pop()?.toLowerCase();

  const isAdmin = false; // We'll implement role checking later
  const isModerator = false;
  const isOwner = currentUserId === user.id;
  const canDeleteMessage = !deleted && (isAdmin || isModerator || isOwner);
  const canEditMessage = !deleted && isOwner && !fileUrl;
  
  // Check for different file types
  const isPDF = fileType === "pdf" && fileUrl;
  const isImage = fileUrl && ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(fileType || "");
  const isDocument = fileUrl && ["doc", "docx", "txt", "rtf", "odt"].includes(fileType || "");
  const isSpreadsheet = fileUrl && ["xls", "xlsx", "csv", "ods"].includes(fileType || "");
  const isArchive = fileUrl && ["zip", "rar", "7z", "tar", "gz"].includes(fileType || "");
  const isVideo = fileUrl && ["mp4", "avi", "mov", "wmv", "flv", "webm"].includes(fileType || "");
  const isAudio = fileUrl && ["mp3", "wav", "ogg", "m4a", "flac"].includes(fileType || "");
  const isOtherFile = fileUrl && !isImage && !isPDF && !isDocument && !isSpreadsheet && !isArchive && !isVideo && !isAudio;

  return (
    <div className="relative group flex items-center hover:bg-black/5 p-4 transition w-full">
      <div className="group flex gap-x-2 items-start w-full">
        <div className="cursor-pointer hover:drop-shadow-md transition">
          <UserAvatar
            src={user.avatar || undefined}
            name={user.name || "User"}
            showStatus={true}
            isOnline={isUserOnline}
            size="md"
          />
        </div>
        <div className="flex flex-col w-full">
          <div className="flex items-center gap-x-2">
            <div className="flex items-center">
              <p className="font-semibold text-sm hover:underline cursor-pointer">
                {user.name}
              </p>
              {/* We'll add role icons later */}
            </div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {timestamp}
            </span>
          </div>
          {isImage && (
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative aspect-square rounded-md mt-2 overflow-hidden border flex items-center bg-secondary h-48 w-48"
            >
              <Image
                src={fileUrl}
                alt={content}
                fill
                className="object-cover"
              />
            </a>
          )}
          {isPDF && (
            <div className="relative flex items-center p-2 mt-2 rounded-md bg-background/10">
              <FileIcon className="h-10 w-10 fill-red-200 stroke-red-400" />
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-sm text-red-500 dark:text-red-400 hover:underline"
              >
                PDF Document
              </a>
            </div>
          )}
          {isDocument && (
            <div className="relative flex items-center p-2 mt-2 rounded-md bg-background/10">
              <FileIcon className="h-10 w-10 fill-blue-200 stroke-blue-400" />
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-sm text-blue-500 dark:text-blue-400 hover:underline"
              >
                Document ({fileType?.toUpperCase()})
              </a>
            </div>
          )}
          {isSpreadsheet && (
            <div className="relative flex items-center p-2 mt-2 rounded-md bg-background/10">
              <FileIcon className="h-10 w-10 fill-green-200 stroke-green-400" />
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-sm text-green-500 dark:text-green-400 hover:underline"
              >
                Spreadsheet ({fileType?.toUpperCase()})
              </a>
            </div>
          )}
          {isArchive && (
            <div className="relative flex items-center p-2 mt-2 rounded-md bg-background/10">
              <FileIcon className="h-10 w-10 fill-yellow-200 stroke-yellow-400" />
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-sm text-yellow-500 dark:text-yellow-400 hover:underline"
              >
                Archive ({fileType?.toUpperCase()})
              </a>
            </div>
          )}
          {isVideo && (
            <div className="relative flex items-center p-2 mt-2 rounded-md bg-background/10">
              <FileIcon className="h-10 w-10 fill-purple-200 stroke-purple-400" />
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-sm text-purple-500 dark:text-purple-400 hover:underline"
              >
                Video File ({fileType?.toUpperCase()})
              </a>
            </div>
          )}
          {isAudio && (
            <div className="relative flex items-center p-2 mt-2 rounded-md bg-background/10">
              <FileIcon className="h-10 w-10 fill-pink-200 stroke-pink-400" />
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-sm text-pink-500 dark:text-pink-400 hover:underline"
              >
                Audio File ({fileType?.toUpperCase()})
              </a>
            </div>
          )}
          {isOtherFile && (
            <div className="relative flex items-center p-2 mt-2 rounded-md bg-background/10">
              <FileIcon className="h-10 w-10 fill-gray-200 stroke-gray-400" />
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-sm text-gray-500 dark:text-gray-400 hover:underline"
              >
                File ({fileType?.toUpperCase()})
              </a>
            </div>
          )}
          {!fileUrl && !deleted && content && (
            <p className="text-sm text-zinc-600 dark:text-zinc-300">
              {content}
              {isUpdated && !deleted && (
                <span className="text-[10px] mx-2 text-zinc-500 dark:text-zinc-400">
                  (edited)
                </span>
              )}
            </p>
          )}
          {!fileUrl && deleted && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400 italic">
              This message has been deleted.
            </p>
          )}
          {!deleted && (
            <MessageReactions
              messageId={id}
              reactions={reactions}
              currentUserId={currentUserId}
              onReactionAdd={handleReactionAdd}
              onReactionRemove={handleReactionRemove}
            />
          )}
        </div>
      </div>
      {canDeleteMessage && (
        <div className="hidden group-hover:flex items-center gap-x-2 absolute p-1 -top-2 right-5 bg-white dark:bg-zinc-800 border rounded-sm">
          {canEditMessage && (
            <button
              onClick={() => onOpen("editMessage", {
                apiUrl: `${socketUrl}/${id}`,
                query: socketQuery,
                message: { id, content }
              })}
              className="h-4 w-4 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition"
            >
              <Edit className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => onOpen("deleteMessage", {
              apiUrl: `${socketUrl}/${id}`,
              query: socketQuery,
            })}
            className="h-4 w-4 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition"
          >
            <Trash className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}