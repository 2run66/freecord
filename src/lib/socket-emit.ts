// Utility to emit socket events from API routes
// This works with our custom server.js setup

declare global {
  var socketIO: any;
}

// Helper function to get the global socket instance
const getSocketIO = () => {
  return global.socketIO;
};

// Helper functions for specific message events
export const emitNewMessage = (chatId: string, message: any) => {
  const io = getSocketIO();
  if (io) {
    io.to(`chat:${chatId}`).emit("message-received", { message });
    console.log(`📨 Emitted new message to chat:${chatId}`);
  } else {
    console.log("⚠️ Socket instance not available for message broadcast");
  }
};

export const emitMessageUpdate = (chatId: string, message: any) => {
  const io = getSocketIO();
  if (io) {
    io.to(`chat:${chatId}`).emit("message-changed", { message });
    console.log(`📝 Emitted message update to chat:${chatId}`);
  } else {
    console.log("⚠️ Socket instance not available for message update");
  }
};

export const emitMessageDelete = (chatId: string, messageId: string) => {
  const io = getSocketIO();
  if (io) {
    io.to(`chat:${chatId}`).emit("message-removed", { messageId });
    console.log(`🗑️ Emitted message deletion to chat:${chatId}`);
  } else {
    console.log("⚠️ Socket instance not available for message deletion");
  }
};