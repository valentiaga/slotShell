import { Injectable } from '@angular/core';
import confetti from 'canvas-confetti';

@Injectable({
    providedIn: 'root'
})
export class ConfettiService {
    private readonly CONFETTI_DURATION = 5000;
    private readonly PARTICLE_INTERVAL = 250;

    constructor() {}

    /**
     * Lanza la animación de confetti
     */
    launchConfetti(): void {
      const animationEnd = Date.now() + this.CONFETTI_DURATION;
      const defaults = this.getConfettiDefaults();
  
      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        
        if (timeLeft <= 0) {
          clearInterval(interval);
          return;
        }
  
        this.emitConfettiParticles(timeLeft, defaults);
      }, this.PARTICLE_INTERVAL);
    }

    /**
     * Obtiene la configuración por defecto del confetti
     * @returns Configuración del confetti
     */
    private getConfettiDefaults(): any {
      return { 
        startVelocity: 30, 
        spread: 360, 
        ticks: 60, 
        zIndex: 9999, 
        position: 'fixed' 
      };
    }

    /**
     * Emite partículas de confetti desde ambos lados
     * @param timeLeft - Tiempo restante de la animación
     * @param defaults - Configuración por defecto
     */
    private emitConfettiParticles(timeLeft: number, defaults: any): void {
      const particleCount = this.calculateParticleCount(timeLeft);
  
      this.emitConfettiFromLeft(particleCount, defaults);
      this.emitConfettiFromRight(particleCount, defaults);
    }

    /**
     * Calcula la cantidad de partículas según el tiempo restante
     * @param timeLeft - Tiempo restante de la animación
     * @returns Cantidad de partículas
     */
    private calculateParticleCount(timeLeft: number): number {
      return 50 * (timeLeft / this.CONFETTI_DURATION);
    }

    /**
     * Emite confetti desde el lado izquierdo
     * @param particleCount - Cantidad de partículas
     * @param defaults - Configuración por defecto
     */
    private emitConfettiFromLeft(particleCount: number, defaults: any): void {
      confetti({
        ...defaults,
        particleCount,
        origin: { x: this.randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
    }

    /**
     * Emite confetti desde el lado derecho
     * @param particleCount - Cantidad de partículas
     * @param defaults - Configuración por defecto
     */
    private emitConfettiFromRight(particleCount: number, defaults: any): void {
      confetti({
        ...defaults,
        particleCount,
        origin: { x: this.randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }

    /**
     * Genera un número aleatorio en un rango
     * @param min - Valor mínimo
     * @param max - Valor máximo
     * @returns Número aleatorio en el rango
     */
    private randomInRange(min: number, max: number): number {
      return Math.random() * (max - min) + min;
    }
}