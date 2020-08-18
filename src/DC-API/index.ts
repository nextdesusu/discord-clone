import io from 'socket.io-client';
import { getRecordedSoundFunction, Call, callbackFunction } from "./types";
import { ɵConsole } from '@angular/core';

class ChatConnection {
    private socket;
    private channel;
    private user;
    private messages;
    private onUpdate: callbackFunction;
    constructor(user: string, onUpdate: callbackFunction, channel?: string) {
        this.channel = channel;
        this.onUpdate = onUpdate;
        this.user = user;
        this.socket = io.connect("http://localhost:3030");
    }

    public start(): void {
        this.socket.on("connect", (): void => {
            this.socket.emit("chat-start", { chatRoom: this.channel, nickname: this.user });
            this.socket.on("chat-new-user", (data) => {
                console.log("chat-new-user", data.nickname);
            });
            this.socket.on("chat-fetch-messages", (data) => {
                this.messages = data.messages;
                this.onUpdate(this.messages);
                console.log("chat-fetch-messages", data.messages);
            });
            this.socket.on("chat-message", (data) => {
                this.messages.push(data.message);
                this.onUpdate(this.messages);
                console.log("chat-message", data.message);
            });
        });
    }

    public sendMessage(text: string): void {
        const message = {
            date: new Date(),
            message: text,
            author: this.user,
        };
        const data = { chatRoom: this.channel, nickname: this.user, message };
        this.socket.emit("chat-message", data);
        this.messages.push(message);
        this.onUpdate(this.messages);
    }
}

export default class DC_API {
    public static recordSound(updTime): Promise<getRecordedSoundFunction> {
        return new Promise((resolve) => {
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then((stream) => {
                    const recorder: MediaRecorder = new MediaRecorder(stream);
                    const sound: Array<Blob> = [];
                    recorder.start(updTime);
                    recorder.addEventListener("dataavailable", (event: BlobEvent) => {
                        sound.push(event.data);
                    });
                    resolve((): string => {
                        recorder.stop();
                        stream.getTracks().forEach((track) => track.stop());
                        const soundBlob = new Blob(sound, {
                            type: 'audio/wav'
                        });
                        return URL.createObjectURL(soundBlob);
                    });
                });
        });
    }

    public static getVideoStream(width: number, height: number): Promise<MediaStream> {
        const constraints = {
            video: { width: { exact: width }, height: { exact: height } }
        };
        return navigator.mediaDevices.getUserMedia(constraints);
    }

    public static async call(localVideo: any, remoteVide: any, roomJoined?: string): Promise<void>/*Promise<Array<RTCPeerConnection>>*/ {
        const onTrack = (ev) => {
            console.log("new track!", ev);
        }
        //const CC = new ChannelCall('http://localhost:3030', onTrack, roomJoined);
    }

    public static hangup(connections: Array<RTCPeerConnection>) {
        for (const connection of connections) {
            connection.close();
        }
    }

    public static joinChat(nickname: string, onUpdate: callbackFunction, channel?: string) {
        return new ChatConnection(nickname, onUpdate, channel);
    }
}