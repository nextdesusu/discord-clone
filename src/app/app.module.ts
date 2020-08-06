import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { CameraAndSoundTestComponent } from './camera-and-sound-test/camera-and-sound-test.component';

@NgModule({
  declarations: [
    AppComponent,
    CameraAndSoundTestComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
