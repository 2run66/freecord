"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";
import io, { Socket } from "socket.io-client";

type SocketContextType = {
  socket: Socket | null;
  isConnected: boolean;
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ 
  children 
}: { 
  children: React.ReactNode 
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socketInstance = io(process.env.NODE_ENV === "development" ? "http://localhost:3000" : "", {
      path: "/api/socket/io",
      addTrailingSlash: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
      transports: ['websocket', 'polling']
    });

    socketInstance.on("connect", () => {
      console.log("🔌 Socket.io client connected", { socketId: socketInstance.id });
      setIsConnected(true);
    });

    socketInstance.on("disconnect", () => {
      console.log("🔌 Socket.io client disconnected");
      setIsConnected(false);
    });

    socketInstance.on("connect_error", (error) => {
      console.log("❌ Socket.io connection error:", error);
    });

    socketInstance.on("reconnect", (attemptNumber) => {
      console.log("🔄 Socket.io reconnected after", attemptNumber, "attempts");
      setIsConnected(true);
    });

    socketInstance.on("reconnect_attempt", (attemptNumber) => {
      console.log("🔁 Socket.io reconnection attempt", attemptNumber);
    });

    socketInstance.on("reconnect_error", (error) => {
      console.log("❌ Socket.io reconnection error:", error);
    });

    socketInstance.on("reconnect_failed", () => {
      console.log("💀 Socket.io reconnection failed");
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  )
}