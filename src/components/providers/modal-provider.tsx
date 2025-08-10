"use client";

import { useEffect, useState } from "react";

import { useModal } from "@/hooks/use-modal-store";
import { MessageFileModal } from "@/components/modals/message-file-modal";
import { CreateChannelModal } from "@/components/modals/create-channel-modal";
import { EditChannelModal } from "@/components/modals/edit-channel-modal";
import { EditMessageModal } from "@/components/modals/edit-message-modal";
import { DeleteMessageModal } from "@/components/modals/delete-message-modal";
import { CreateDMModal } from "@/components/modals/create-dm-modal";
import { ServerDiscoveryModal } from "@/components/modals/server-discovery-modal";
import { JoinServerModal } from "@/components/modals/join-server-modal";
import { UserSettingsModal } from "@/components/modals/user-settings-modal";
import { ServerSettingsModal } from "@/components/modals/server-settings-modal";
import { InitialModal } from "@/components/modals/initial-modal";
import { ParticipantVolumeModal } from "@/components/modals/participant-volume-modal";
import { UserPublicModal } from "@/components/modals/user-public-modal";
import { FriendsModal } from "@/components/modals/friends-modal";
import { NotificationsModal } from "@/components/modals/notifications-modal";

export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);
  const { type, isOpen, onClose, data } = useModal();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <MessageFileModal 
        apiUrl={data?.apiUrl || ""}
        query={data?.query || {}}
        isOpen={isOpen && type === "messageFile"}
        onClose={onClose}
      />
      <CreateChannelModal />
      <EditChannelModal />
      <EditMessageModal />
      <DeleteMessageModal />
      <CreateDMModal />
      <ServerDiscoveryModal />
      <JoinServerModal />
      <UserSettingsModal />
      <ServerSettingsModal />
      <ParticipantVolumeModal />
      <UserPublicModal />
      <FriendsModal />
      <NotificationsModal />
      <InitialModal autoOpen={false} />
    </>
  );
}