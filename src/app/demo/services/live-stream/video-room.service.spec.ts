import { TestBed } from '@angular/core/testing';

import { VideoRoomService } from './video-room.service';

describe('VideoRoomService', () => {
  let service: VideoRoomService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VideoRoomService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
