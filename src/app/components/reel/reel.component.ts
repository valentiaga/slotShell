import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SymbolsService } from '../../services/symbols.service';
import { PremiosService } from '../../services/premios/premios.service';

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
export class ReelComponent implements OnInit {
  @Input() duration: number = 4000;
  @Input() targetSymbol?: string | null;
  @Output() stop = new EventEmitter<number>();
  @Input() index: number = -1;
  direction = 'down';

  currentSymbol: string = this.symbolsService.getRandomSymbol();
  spinning: boolean = false;
  intervalId?: any;
  blink:boolean = false;

  reelSymbols: string[] = [];
  animationFrameId: number | null = null;

  constructor(private symbolsService: SymbolsService, private premiosService: PremiosService) {}

  ngOnInit () {
    this.premiosService.getActivePrizes().subscribe((response) => {
      this.reelSymbols = response.body.map(prize => prize.display);
    })
  }

  getClassObject() {
    return {
      [this.direction]: true,
      'blink': this.blink
    };
  }

  startSpinning(target: string, direction: 'up' | 'down', duration: number) {
    this.spinning = true;
    let startTime: number | null = null;
    this.direction = direction;
  
    const easeOut = (time: number, duration: number) => {
      // Función easeOut: reduce la velocidad conforme se acerca al final
      const t = time / duration;
      return t < 1 ? 1 - Math.pow(1 - t, 3) : 1;
    };
  
    const spin = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
  
      // Calculamos el tiempo de la animación usando easing
      const easedTime = easeOut(elapsed, duration);
  
      // Solo actualizamos el símbolo si ha pasado el tiempo necesario basado en easedTime
      if (elapsed < duration) {
        if (Math.random() < easedTime) {
          // Cambio rápido de símbolos mientras gira
          this.currentSymbol = this.reelSymbols[Math.floor(Math.random() * this.reelSymbols.length)];
        }

        this.animationFrameId = requestAnimationFrame(spin);
      } else {
        // Al final, detenemos el giro y mostramos el símbolo objetivo
        this.currentSymbol = target;
        this.direction = '';
        this.stopSpinning();
      }
    };
  
    this.animationFrameId = requestAnimationFrame(spin);
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
  
    this.stop.emit(this.index);
  }
  
  
}
