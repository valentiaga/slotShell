import { Injectable } from '@angular/core';
import confetti from 'canvas-confetti';

@Injectable({
    providedIn: 'root'
})
export class ConfettiService {

    constructor() { }

    launchConfetti() {
      const duration = 5 * 1000; // 5 segundos
      const animationEnd = Date.now() + duration;
      const defaults = { 
        startVelocity: 30, 
        spread: 360, 
        ticks: 60, 
        zIndex: 9999, 
        position: 'fixed' 
    };
  
      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) {
          clearInterval(interval);
          return;
        }
  
        const particleCount = 50 * (timeLeft / duration);
  
        confetti({
          ...defaults,
          particleCount,
          origin: { x: this._randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
  
        confetti({
          ...defaults,
          particleCount,
          origin: { x: this._randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);
    }

    private _randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }
}