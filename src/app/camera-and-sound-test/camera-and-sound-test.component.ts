import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import DC_API from "../../DC-API";

@Component({
  selector: 'app-camera-and-sound-test',
  templateUrl: './camera-and-sound-test.component.html',
  styleUrls: ['./camera-and-sound-test.component.css']
})
export class CameraAndSoundTestComponent implements AfterViewInit {
  @ViewChild("cameraTest") cameraTest: ElementRef;
  @ViewChild("soundTest") soundTest: ElementRef;
  videoStream: MediaStream;
  soundRecord: any = null;
  constructor() { }

  ngAfterViewInit(): void {
  }

  startRecordSound() {
    DC_API.recordSound(10)
      .then((stopFunction) => {
        this.soundRecord = stopFunction;
      })
  }

  startRecordVideo() {
    DC_API.getVideoStream(640, 480)
      .then((stream) => {
        this.videoStream = stream;
        this.cameraTest.nativeElement.srcObject = stream;
      })
  }

  stopRecordSound() {
    if (this.soundRecord !== null) {
      const URLSRC: string = this.soundRecord();
      const soundTest = this.soundTest.nativeElement;
      soundTest.src = URLSRC;
      this.soundRecord = null;
    }
  }

  stopRecordVideo() {
    this.videoStream.getTracks().forEach((track) => track.stop());
  }

}
