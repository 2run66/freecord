"use client";

import { Fragment, useRef, ElementRef, useEffect } from "react";
import { format } from "date-fns";
import { User, Message } from "@prisma/client";
import { Loader2, ServerCrash } from "lucide-react";

import { useChatQuery } from "@/hooks/use-chat-query";
import { useChatSocket } from "@/hooks/use-chat-socket";
import { useSocket } from "@/components/providers/socket-provider";
import { ChatWelcome } from "./chat-welcome";
import { ChatItem } from "./chat-item";

const DATE_FORMAT = "d MMM yyyy, HH:mm";

type MessageWithUser = Message & {
  user: User;
};

interface ChatMessagesProps {
  name: string;
  user: User;
  chatId: string;
  apiUrl: string;
  socketUrl: string;
  socketQuery: Record<string, string>;
  paramKey: "channelId" | "conversationId";
  paramValue: string;
  type: "channel" | "conversation";
}

export const ChatMessages = ({
  name,
  user,
  chatId,
  apiUrl,
  socketUrl,
  socketQuery,
  paramKey,
  paramValue,
  type,
}: ChatMessagesProps) => {
  const queryKey = `chat:${chatId}`;
  const addKey = `chat:${chatId}:messages`;
  const updateKey = `chat:${chatId}:messages:update`;

  const chatRef = useRef<ElementRef<"div">>(null);
  const { socket } = useSocket();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useChatQuery({
    queryKey,
    apiUrl,
    paramKey,
    paramValue,
  });

  useChatSocket({ queryKey, addKey, updateKey });

  // Auto-join chat room when component mounts
  useEffect(() => {
    if (socket && chatId && user.id) {
      console.log(`🚪 Joining chat room: ${chatId}`);
      socket.emit("chat-join", { chatId, userId: user.id });

      return () => {
        console.log(`🚪 Leaving chat room: ${chatId}`);
        socket.emit("chat-leave", { chatId, userId: user.id });
      };
    }
  }, [socket, chatId, user.id]);

  if (status === "pending") {
    return (
      <div className="flex flex-col flex-1 justify-center items-center">
        <Loader2 className="h-7 w-7 text-zinc-500 animate-spin my-4" />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Loading messages...
        </p>
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="flex flex-col flex-1 justify-center items-center">
        <ServerCrash className="h-7 w-7 text-zinc-500 my-4" />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Something went wrong!
        </p>
      </div>
    )
  }

  return (
    <div ref={chatRef} className="flex-1 flex flex-col py-4 overflow-y-auto">
      {!hasNextPage && <div className="flex-1" />}
      {!hasNextPage && (
        <ChatWelcome
          type={type}
          name={name}
        />
      )}
      {hasNextPage && (
        <div className="flex justify-center">
          {isFetchingNextPage ? (
            <Loader2 className="h-6 w-6 text-zinc-500 animate-spin my-4" />
          ) : (
            <button
              onClick={() => fetchNextPage()}
              className="text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 text-xs my-4 dark:hover:text-zinc-300 transition"
            >
              Load previous messages
            </button>
          )}
        </div>
      )}
      <div className="flex flex-col-reverse mt-auto">
        {data?.pages?.map((group, i) => (
          <Fragment key={i}>
            {group.items.map((message: MessageWithUser) => (
              <ChatItem
                key={message.id}
                id={message.id}
                user={message.user}
                content={message.content}
                fileUrl={message.fileUrl}
                deleted={message.deleted}
                timestamp={format(new Date(message.createdAt), DATE_FORMAT)}
                isUpdated={Boolean((message as any).isEdited)}
                socketUrl={socketUrl}
                socketQuery={socketQuery}
                currentUserId={user.id}
              />
            ))}
          </Fragment>
        ))}
      </div>
    </div>
  )
}