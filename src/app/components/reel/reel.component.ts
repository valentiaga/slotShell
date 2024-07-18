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

  currentSymbol: string = this.symbolsService.getRandomSymbol();
  spinning: boolean = false;
  intervalId?: any;
  blink:boolean = false;

  constructor(private symbolsService: SymbolsService) {}

  startSpinning() {
    this.spinning = true;
    this.blink = false;
    this.intervalId = setInterval(() => {
      this.currentSymbol = this.symbolsService.getRandomSymbol();
    }, 150);
    setTimeout(() =>{
      console.log('ejecuto', this.duration);
      this.stopSpinning();
    }, this.duration);
  }

  stopSpinning() {
    let audio = document.getElementById('audio_stop') as HTMLAudioElement;
    audio.play();
    clearInterval(this.intervalId);
    if (this.targetSymbol) {
      this.currentSymbol = this.targetSymbol;
    }
    this.spinning = false;
    this.stop.emit();
  }
}
