import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { SymbolsService } from '../../services/symbols.service';

@Component({
    selector: 'app-reel',
    standalone: true,
    imports: [
        CommonModule,
    ],
    templateUrl: './reel.component.html',
    styleUrl: './reel.component.css',
    changeDetection: ChangeDetectionStrategy.Default,
})
export class ReelComponent {
  @Input() duration: number = 1000;
  @Input() targetSymbol?: string | null;
  @Output() stop = new EventEmitter<void>();
  @Input() index: number = -1;

  currentSymbol: string = this.symbolsService.getRandomSymbol();
  spinning: boolean = false;
  intervalId?: any;
  blink:boolean = false;

  constructor(private symbolsService: SymbolsService) {}

  startSpinning(symbol: string) {
    this.spinning = true;
    this.blink = false;
    let intervalTime = 100;  // Tiempo inicial del intervalo (rápido al principio)
    let speedUp = true;  // Indicador para acelerar o desacelerar la animación
  
    this.intervalId = setInterval(() => {
      this.currentSymbol = this.symbolsService.getRandomSymbol();
  
      // Acelera al principio
      if (speedUp && intervalTime > 50) {
        intervalTime -= 10;  // Acelera el intervalo
      }
  
      // Desacelera hacia el final
      if (!speedUp && intervalTime < 150) {
        intervalTime += 30;  // Desacelera el intervalo
      }
  
      if (intervalTime <= 50) {
        speedUp = false;
      }
  
      clearInterval(this.intervalId);
      this.intervalId = setInterval(() => {
        this.currentSymbol = this.symbolsService.getRandomSymbol();
      }, intervalTime);
    }, intervalTime);
  
    setTimeout(() => {
      this.currentSymbol = symbol;
      this.stopSpinning();
    }, this.duration);
  }

  isImageUrl(url: string): boolean {
    const regex = /\bprizes\/\b/;
    return regex.test(url);
  }

  stopSpinning() {
    let audio = document.getElementById('audio_stop') as HTMLAudioElement;
    audio.play();
    clearInterval(this.intervalId);
    this.spinning = false;
  
    // Obtiene el contenedor de símbolos específico
    const reelElement = document.querySelectorAll('.reel .content')[this.index];
    
    // Aplicar la animación de sacudida al símbolo específico
    if (reelElement) {
      reelElement.classList.add('stop-shake');
      
      // Eliminar la animación después de que haya terminado
      setTimeout(() => reelElement.classList.remove('stop-shake'), 500);
    }
  
    this.stop.emit();
  }
  
  
}
