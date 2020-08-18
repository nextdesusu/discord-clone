import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import DC_API from "../../DC-API";
import { getRecordedSoundFunction } from "../../DC-API/types";

@Component({
  selector: 'app-camera-and-sound-test',
  templateUrl: './camera-and-sound-test.component.html',
  styleUrls: ['./camera-and-sound-test.component.css']
})
export class CameraAndSoundTestComponent implements AfterViewInit {
  @ViewChild("cameraTest") cameraTest: ElementRef;
  @ViewChild("soundTest") soundTest: ElementRef;
  videoStream: MediaStream;
  stopSoundRecord: getRecordedSoundFunction | null = null;
  constructor() { }

  ngAfterViewInit(): void {
  }

  startRecordSound() {
    DC_API.recordSound(10)
      .then((stopFunction) => {
        this.stopSoundRecord = stopFunction;
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
    if (this.stopSoundRecord !== null) {
      const URLSRC: string = this.stopSoundRecord();
      const soundTest = this.soundTest.nativeElement;
      soundTest.src = URLSRC;
      this.stopSoundRecord = null;
    }
  }

  stopRecordVideo() {
    this.videoStream.getTracks().forEach((track) => track.stop());
  }

}
