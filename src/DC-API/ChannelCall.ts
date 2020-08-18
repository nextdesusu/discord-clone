import io from 'socket.io-client';

const s4 = () => Math.floor(Math.random() * 0x10000).toString(16);
const uuid = () => `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;

const rtcOfferOptions: RTCOfferOptions = { offerToReceiveAudio: true, offerToReceiveVideo: true };
const RTCPeerConnectionConfig = { 'iceServers': [{ 'urls': 'stun:stun.l.google.com:19302' }] };

export default class ChannelCall {
    private rtcPeerConnection = new RTCPeerConnection();
    private userId: string = uuid();

    private socket: SocketIOClient.Socket;
    private channel: string;
    private onTrack: any;
    constructor(address: string, onTrack: any, channel?: string) {
        this.socket = io.connect(address);
        this.channel = channel ? channel : uuid();
        this.onTrack = onTrack;
        this.rtcPeerConnection.ontrack = () => {
            console.log("@@@TRACK@@@");
        };
        this.handleSockets();
    }

    private sendViaSocket(webRtcData: RTCSessionDescriptionInit, to: string) {
        this.socket.emit("webrtc", { channel: this.channel, userId: this.userId, webRtcData, to });
    }

    private async sendOffer(to: string): Promise<void> {
        const offer: RTCSessionDescriptionInit = await this.rtcPeerConnection.createOffer(rtcOfferOptions);
        this.rtcPeerConnection.setLocalDescription(offer);
        this.sendViaSocket(offer, to);
    }

    private async sendAnswer(to: string): Promise<void> {
        const answer: RTCSessionDescriptionInit = await this.rtcPeerConnection.createAnswer();
        await this.rtcPeerConnection.setLocalDescription(answer);
        this.sendViaSocket(answer, to);
    }

    private handleSockets() {
        const { socket, userId, channel } = this;
        socket.on("connect", (): void => {
            console.log("my socket is", socket.id);
            socket.emit("channel", { userId, channel });
            socket.on("new-user", (data) => {
                console.log("new-user", data);
                this.sendOffer(data.socketId);
            });
            socket.on("webrtc", (data) => {
                console.log("webrtc", data);
                if (data.webRtcData.type === "offer") {
                    console.log("setting offer");
                    this.rtcPeerConnection.setRemoteDescription(
                        new RTCSessionDescription(data.webRtcData)
                    ).then(() => {
                        this.sendAnswer(data.to);
                    })
                } else if (data.webRtcData.type === "answer") {
                    console.log("setting answer");
                    this.rtcPeerConnection.setRemoteDescription(data.webRtcData);
                } else {
                    throw Error(`Unknown webrtc type! ${data.webRtcData.type}`);
                }
            });
            socket.on('ICE-message', async (data) => {
                console.log("firing", 'ICE-message', data);
                if (data.candidate) {
                    try {
                        console.log("ICE-message", "ICE-message");
                        await this.rtcPeerConnection.addIceCandidate(data.candidate);
                    } catch (e) {
                        console.error('Error adding received ice candidate', e);
                    }
                }
            });
            this.rtcPeerConnection.addEventListener('icecandidate', (event) => {
                if (event.candidate) {
                    console.log("event candidate", event.candidate);
                    socket.emit('ICE-message', { channel: this.channel, candidate: event.candidate });
                }
            });
            this.rtcPeerConnection.addEventListener('connectionstatechange', async (event) => {
                console.log("connectionstatechange");
                if (this.rtcPeerConnection.connectionState === 'connected') {
                    console.log("connection ESTABLISHED!", event);
                    await navigator.getUserMedia({ video: true, audio: true }, (stream) => {
                        const tracks = stream.getTracks();
                        for (const track of tracks) {
                            this.rtcPeerConnection.addTrack(track);
                        }
                        //this.onTrack(tracks);
                        console.log("rtc now:", this.rtcPeerConnection);
                    }, (error) => {
                        console.warn(error.message);
                    });
                }
            });
        });
    }
}