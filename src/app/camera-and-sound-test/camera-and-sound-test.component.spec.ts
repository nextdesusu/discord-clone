import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CameraAndSoundTestComponent } from './camera-and-sound-test.component';

describe('CameraAndSoundTestComponent', () => {
  let component: CameraAndSoundTestComponent;
  let fixture: ComponentFixture<CameraAndSoundTestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CameraAndSoundTestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CameraAndSoundTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
