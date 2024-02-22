import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AudioService {

  private audio: HTMLAudioElement;

  constructor() {
    this.audio = new Audio();
  }

  playSound(soundFile: string): void {
    this.audio.src = `assets/${soundFile}`;
    this.audio.load();
    this.audio.play();
  }
}
