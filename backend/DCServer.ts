import express, { Application } from "express";
import socketIO, { Server as SocketIOServer } from "socket.io";
import { createServer, Server as HTTPServer, Server } from "http";
import { StringifyOptions } from "querystring";

interface chatMessage {
    date: Date;
    message: string;
    author: string;
}

interface chatRooms {
    [key: string]: Array<chatMessage>;
}

const MAIN_ROUTE = "http://localhost";

export default class DCServer {
    private app: Application;
    private httpServer: HTTPServer;
    private socketIO: SocketIOServer;
    private port: number;
    private chatChannels: chatRooms;

    constructor(port: number) {
        this.app = express();
        this.httpServer = createServer(this.app);
        this.socketIO = new socketIO(this.httpServer);
        this.port = port;
        this.chatChannels = {};

        this.handleSocketConnection();
        this.handleChatSockets();
    }

    private getChatChannel(chatRoomName: string): Array<chatMessage> {
        if (this.chatChannels[chatRoomName] === undefined) {
            this.chatChannels[chatRoomName] = [];
        }
        return this.chatChannels[chatRoomName];
    }

    private sendMessage(chatRoomName: string, message: chatMessage): void {
        this.chatChannels[chatRoomName].push(message);
    }

    private handleChatSockets(): void {
        this.socketIO.on("connect", (socket) => {
            console.log("connect chat");
            socket.on("chat-start", (data) => {
                const chatMessages = this.getChatChannel(data.chatRoom);
                socket.join(data.chatRoom);
                socket.broadcast.to(data.charRoom).emit("chat-new-user", { nickname: data.nickname });
                this.socketIO.to(socket.id).emit("chat-fetch-messages", { messages: chatMessages });
                console.log("chat-start", data)
            });
            socket.on("chat-message", (data) => {
                const { message, nickname } = data;
                this.sendMessage(data.chatRoom, {
                    date: new Date(),
                    message,
                    author: nickname
                });
                socket.broadcast.to(data.chatRoom).emit("chat-message", {
                    nickname,
                    message
                });
            });
        });
    }

    private handleSocketConnection(): void {
        this.socketIO.on("connect", (socket: SocketIO.Socket) => {
            socket.on("channel", (data): void => {
                socket.join(data.channel);
                socket.to(data.channel).emit("new-user", { socketId: socket.id });
            });
            socket.on("webrtc", (data) => {
                console.log("type", data.webRtcData.type);
                socket.to(data.channel).emit("webrtc", data);
            });
            socket.on("ICE-message", (data) => {
                socket.to(data.channel).emit("ICE-message", data);
            })
            socket.on("disconnect", (data) => {
            });
        });
    }

    public listen(callback: (port: number) => void): void {
        this.httpServer.listen(this.port, () =>
            callback(this.port)
        );
    }
}