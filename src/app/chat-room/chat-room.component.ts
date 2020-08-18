import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import DC_API from "../../DC-API";
import { Call } from "../../DC-API/types";

@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.css']
})
export class ChatRoomComponent implements OnInit {
  @ViewChild("localVideo") localVideo: ElementRef;
  @ViewChild("remoteVideo") remoteVideo: ElementRef;
  public chatInput: string;
  public messages: Array<any>

  chat: any;
  connections: Array<RTCPeerConnection>;

  src: Blob;
  constructor() { }

  getChatInput(event): void {
    const val = event.target.value;
    this.chatInput = val;
  }

  ngOnInit(): void {
  }

  joinChat(): void {
    console.log("hosting");
    const localVideo = this.localVideo.nativeElement;
    const remoteVideo = this.remoteVideo.nativeElement;

    const nickname = "desu";
    const vf = (msgs): void => {
      this.messages = msgs;
      console.log("msgs", msgs);
    };
    const channel = "54f1946b-7661-de11-ce83-c269885b2d5c";
    this.chat = DC_API.joinChat(nickname, vf, channel);
    this.chat.start();
  }

  sendMessage(text: string): void {
    this.chat.sendMessage(text);
  }

  hangup(): void {
    DC_API.hangup(this.connections);
  }

}
