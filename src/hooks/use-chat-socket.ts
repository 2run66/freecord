"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSocket } from "@/components/providers/socket-provider";
import { User, Message } from "@prisma/client";

type MessageWithUser = Message & {
  user: User;
};

type ChatSocketProps = {
  addKey: string;
  updateKey: string;
  queryKey: string;
}

export const useChatSocket = ({
  addKey,
  updateKey,
  queryKey
}: ChatSocketProps) => {
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) {
      return;
    }

    const handleNewMessage = (data: { message: MessageWithUser }) => {
      console.log("📨 Received new message:", data.message.id);
      
      queryClient.setQueryData([queryKey], (oldData: any) => {
        if (!oldData || !oldData.pages || oldData.pages.length === 0) {
          return oldData;
        }

        const newData = [...oldData.pages];
        
        // Add new message to the first page (most recent)
        newData[0] = {
          ...newData[0],
          items: [data.message, ...newData[0].items]
        };

        return {
          ...oldData,
          pages: newData,
        };
      });
    };

    const handleMessageUpdate = (data: { message: MessageWithUser }) => {
      console.log("📝 Received message update:", data.message.id);
      
      queryClient.setQueryData([queryKey], (oldData: any) => {
        if (!oldData || !oldData.pages || oldData.pages.length === 0) {
          return oldData;
        }

        const newData = [...oldData.pages];
        
        // Find and update the message in any page
        for (let i = 0; i < newData.length; i++) {
          const pageItemIndex = newData[i].items.findIndex(
            (item: MessageWithUser) => item.id === data.message.id
          );
          
          if (pageItemIndex !== -1) {
            newData[i] = {
              ...newData[i],
              items: newData[i].items.map((item: MessageWithUser) =>
                item.id === data.message.id ? data.message : item
              )
            };
            break;
          }
        }

        return {
          ...oldData,
          pages: newData,
        };
      });
    };

    const handleMessageDelete = (data: { messageId: string }) => {
      console.log("🗑️ Received message deletion:", data.messageId);
      
      queryClient.setQueryData([queryKey], (oldData: any) => {
        if (!oldData || !oldData.pages || oldData.pages.length === 0) {
          return oldData;
        }

        const newData = [...oldData.pages];
        
        // Find and remove the message from any page
        for (let i = 0; i < newData.length; i++) {
          const pageItemIndex = newData[i].items.findIndex(
            (item: MessageWithUser) => item.id === data.messageId
          );
          
          if (pageItemIndex !== -1) {
            newData[i] = {
              ...newData[i],
              items: newData[i].items.filter((item: MessageWithUser) => item.id !== data.messageId)
            };
            break;
          }
        }

        return {
          ...oldData,
          pages: newData,
        };
      });
    };

    // Listen for real-time message events
    socket.on("message-received", handleNewMessage);
    socket.on("message-changed", handleMessageUpdate); 
    socket.on("message-removed", handleMessageDelete);

    return () => {
      socket.off("message-received", handleNewMessage);
      socket.off("message-changed", handleMessageUpdate);
      socket.off("message-removed", handleMessageDelete);
    };
  }, [queryClient, queryKey, socket, addKey, updateKey]);
}