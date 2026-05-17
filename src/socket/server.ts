import { Server, Socket } from "socket.io";
import http from "http";
import jwt, { JwtPayload } from "jsonwebtoken";
import CustomError from "../helpers/CustomError";
import config from "../config";

// 
let io: Server | null = null;

interface TokenPayload extends JwtPayload {
    userId: string;
    email: string;
}

interface JoinChatPayload {
    chatId: string;
}

export const initSocket = (httpServer: http.Server): Server => {
    if (io) return io;

    io = new Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    });

    io.on("connection", (socket: Socket) => {
        console.log(`🔌 Socket connected: ${socket.id}`);

        socket.on("joinChat", ({ chatId }: JoinChatPayload) => {
            if (!chatId) return;
            socket.join(chatId);
            console.log(`💬 Joined chat room: ${chatId}`);
        });

        socket.on("leaveChat", ({ chatId }: JoinChatPayload) => {
            if (!chatId) return;
            socket.leave(chatId);
        });

 

        socket.on("disconnect", () => {
            console.log(`🔌 Socket disconnected: ${socket.id}`);
        });
    }); 

    return io;
};

export const getIo = (): Server => {
    if (!io) throw new CustomError(500, "Socket not initialized");
    return io;
};