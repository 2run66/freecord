const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");
const { PrismaClient } = require("@prisma/client");

// Global socket instance for API routes
let globalIO = null;

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = process.env.PORT || 3000;

// Initialize Prisma for voice channel tracking
const prisma = new PrismaClient();

// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer, {
    path: "/api/socket/io",
    addTrailingSlash: false,
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    },
    // CRITICAL: Prevent rapid disconnections
    pingTimeout: 60000,    // Wait 60s before considering connection dead
    pingInterval: 25000,   // Send ping every 25s
    upgradeTimeout: 30000, // Allow 30s for upgrade attempts
    transports: ['websocket', 'polling']
  });

  // Store global reference
  globalIO = io;
  
  // Export for API routes
  global.socketIO = io;

  // Handle connections for both voice channels and chat messages
  io.on("connection", (socket) => {
    console.log(`👤 User connected: ${socket.id}`);

    // Join voice channel
    socket.on("voice-channel-join", (data) => {
      try {
        const { channelId, userId, userName, userAvatar } = data;
        
        console.log(`🎤 User ${userName} (${userId}) joining voice channel ${channelId}`);

        // Store user info in socket data first
        socket.data.userId = userId;
        socket.data.userName = userName;
        socket.data.userAvatar = userAvatar;
        socket.data.currentVoiceChannel = channelId;

        // Join socket room for this voice channel
        socket.join(`voice-channel:${channelId}`);
        
        // Broadcast to ALL sockets in this voice channel room (including the joiner)
        io.in(`voice-channel:${channelId}`).emit("voice-channel-user-joined", {
          userId,
          userName,
          userAvatar,
          channelId
        });

        console.log(`✅ User ${userName} joined voice channel ${channelId} - broadcasted to all`);
      } catch (error) {
        console.log("❌ Error joining voice channel:", error);
      }
    });

    // Leave voice channel
    socket.on("voice-channel-leave", (data) => {
      try {
        const { channelId, userId, userName } = data;

        console.log(`👋 User ${userName} (${userId}) leaving voice channel ${channelId}`);

        // Broadcast to ALL sockets in this voice channel room BEFORE leaving
        io.in(`voice-channel:${channelId}`).emit("voice-channel-user-left", {
          userId,
          channelId
        });

        // Leave socket room AFTER broadcasting
        socket.leave(`voice-channel:${channelId}`);
        
        // Clear socket data
        socket.data.currentVoiceChannel = null;

        console.log(`✅ User ${userName} left voice channel ${channelId} - broadcasted to all`);
      } catch (error) {
        console.log("❌ Error leaving voice channel:", error);
      }
    });

    // Get current participants in a voice channel
    socket.on("voice-channel-get-participants", ({ channelId }) => {
      try {
        const roomName = `voice-channel:${channelId}`;
        const socketsInRoom = io.sockets.adapter.rooms.get(roomName) || new Set();
        const participants = [];
        
        for (let socketId of socketsInRoom) {
          const sock = io.sockets.sockets.get(socketId);
          if (sock?.data?.userId) {
            participants.push({
              userId: sock.data.userId,
              userName: sock.data.userName,
              userAvatar: sock.data.userAvatar || undefined
            });
          }
        }
        
        console.log(`📋 Sending ${participants.length} participants for channel ${channelId} to ${socket.id}`);
        socket.emit("voice-channel-participants", { channelId, participants });
      } catch (error) {
        console.log("❌ Error getting participants:", error);
      }
    });

    // Heartbeat to keep connection alive (no database storage needed)
    socket.on("voice-channel-heartbeat", (data) => {
      // Just acknowledge the heartbeat - no database storage needed
      // console.log(`💓 Heartbeat from ${data.userId} in ${data.channelId}`);
    });

    // ================== CHAT MESSAGE EVENTS ==================

    // Join a chat room (channel or conversation)
    socket.on("chat-join", (data) => {
      try {
        const { chatId, userId } = data;
        console.log(`💬 User ${userId} joining chat ${chatId}`);
        
        socket.data.userId = userId;
        socket.join(`chat:${chatId}`);
        
        console.log(`✅ User ${userId} joined chat ${chatId}`);
      } catch (error) {
        console.log("❌ Error joining chat:", error);
      }
    });

    // Leave a chat room
    socket.on("chat-leave", (data) => {
      try {
        const { chatId, userId } = data;
        console.log(`👋 User ${userId} leaving chat ${chatId}`);
        
        socket.leave(`chat:${chatId}`);
        
        console.log(`✅ User ${userId} left chat ${chatId}`);
      } catch (error) {
        console.log("❌ Error leaving chat:", error);
      }
    });

    // Broadcast new message to chat room
    socket.on("message-sent", (data) => {
      try {
        const { chatId, message } = data;
        console.log(`📨 Broadcasting new message to chat ${chatId}`);
        
        // Broadcast to all users in this chat room
        socket.to(`chat:${chatId}`).emit("message-received", { message });
        
        console.log(`✅ Message broadcasted to chat ${chatId}`);
      } catch (error) {
        console.log("❌ Error broadcasting message:", error);
      }
    });

    // Broadcast message update to chat room
    socket.on("message-updated", (data) => {
      try {
        const { chatId, message } = data;
        console.log(`📝 Broadcasting message update to chat ${chatId}`);
        
        // Broadcast to all users in this chat room
        socket.to(`chat:${chatId}`).emit("message-changed", { message });
        
        console.log(`✅ Message update broadcasted to chat ${chatId}`);
      } catch (error) {
        console.log("❌ Error broadcasting message update:", error);
      }
    });

    // Broadcast message deletion to chat room
    socket.on("message-deleted", (data) => {
      try {
        const { chatId, messageId } = data;
        console.log(`🗑️ Broadcasting message deletion to chat ${chatId}`);
        
        // Broadcast to all users in this chat room
        socket.to(`chat:${chatId}`).emit("message-removed", { messageId });
        
        console.log(`✅ Message deletion broadcasted to chat ${chatId}`);
      } catch (error) {
        console.log("❌ Error broadcasting message deletion:", error);
      }
    });

    // Handle disconnect (browser close, network issues, etc.)
    socket.on("disconnect", () => {
      try {
        const userId = socket.data.userId;
        const userName = socket.data.userName;
        const channelId = socket.data.currentVoiceChannel;

        if (userId && channelId) {
          console.log(`🔌 User ${userName} (${userId}) disconnected from voice channel ${channelId}`);

          // Broadcast to ALL sockets in this voice channel room that user left
          io.in(`voice-channel:${channelId}`).emit("voice-channel-user-left", {
            userId,
            channelId
          });
        }

        console.log(`👤 User disconnected: ${socket.id}`);
      } catch (error) {
        console.log("❌ Error handling disconnect:", error);
      }
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`🚀 Server ready on http://${hostname}:${port}`);
      console.log(`🔌 Socket.io server ready on http://${hostname}:${port}/api/socket/io`);
    });
});