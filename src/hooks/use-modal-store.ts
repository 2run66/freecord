"use client";

import { create } from "zustand";
import { ChannelType } from "@prisma/client";

export type ModalType = "messageFile" | "createChannel" | "editChannel" | "editMessage" | "deleteMessage" | "createDM" | "serverDiscovery" | "joinServer" | "userSettings" | "serverSettings" | "createServer" | "participantVolume" | "userPublic" | "friends" | "notifications";

interface ModalData {
  apiUrl?: string;
  query?: Record<string, any>;
  message?: any;
  server?: any;
  channel?: any;
  participant?: any;
  user?: any;
  channelType?: ChannelType;
}

interface ModalStore {
  type: ModalType | null;
  data: ModalData;
  isOpen: boolean;
  setupCompleted: boolean;
  onOpen: (type: ModalType, data?: ModalData) => void;
  onClose: () => void;
  setSetupCompleted: (completed: boolean) => void;
}

export const useModal = create<ModalStore>((set) => ({
  type: null,
  data: {},
  isOpen: false,
  setupCompleted: false,
  onOpen: (type, data = {}) => set({ isOpen: true, type, data }),
  onClose: () => set({ type: null, isOpen: false }),
  setSetupCompleted: (completed: boolean) => set({ setupCompleted: completed }),
}));