import { CommonModule, NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { SymbolsService } from '../../services/symbols.service';
import { ReelComponent } from '../../components/reel/reel.component';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { SocketService } from '../../services/socket/socket.service';
import { CounterService } from '../../services/counter/counter.service';
import { ConfettiService } from '../../services/confetti/confetti-service.service';

@Component({
  selector: 'app-slot',
  standalone: true,
  imports: [ReelComponent, RouterOutlet, NgClass, CommonModule],
  templateUrl: './slot.component.html',
  styleUrls: ['./slot.component.css'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class SlotComponent implements OnInit {
  @ViewChildren(ReelComponent) reels!: QueryList<ReelComponent>;
  estacionID!: number;
  randomSymbols: string[] = ['', '', ''];
  spinning: boolean[] = new Array<boolean>(3).fill(false);
  totalSpinCount: number = 0;
  targetSymbol?: string | null;
  back?: HTMLAudioElement;
  win?: HTMLAudioElement;
  socketService = inject(SocketService);
  isla: string = '';
  duration = 2400;
  winningPrize: string = '';
  showWinningMessage: boolean = false;
  isTestMode: boolean = false;

  constructor(private symbolsService: SymbolsService, private counterService: CounterService, private route: ActivatedRoute, private confettiService: ConfettiService) { }

  async ngOnInit() {
    await this.setEstacion();
    this.counterService.getCounter();
    this.loadSymbols();
    this.createSocket();

    this.checkTestMode()
  }

  checkTestMode() {
    const url = this.route.snapshot.url.map(segment => segment.path).join('/');
    this.isTestMode = url.includes('test');

    if (this.isTestMode)
      this.isla = 'Isla Test'
  }

  loadSymbols() {
    this.back = document.getElementById('audio_back') as HTMLAudioElement;
    this.win = document.getElementById('audio_win') as HTMLAudioElement;
    this.initialRandomSymbols();
  }

  async setEstacion() {
    this.estacionID = this.route.snapshot.data['id'];
    localStorage.setItem('idAuth', this.estacionID.toString());
    switch (this.estacionID) {
      case 1:
        console.log('Estación Garay seleccionada');
        break;
      case 2:
        console.log('Estación Matheu seleccionada');
        break;
      case 3:
        console.log('Estación Roca seleccionada');
        break;
      default:
        console.log('Estación no válida');
    }
  }

  createSocket() {
    this.socketService.joinRoom(this.estacionID.toString());

    // Escuchar el evento para accionar la ruleta
    this.socketService.onRuletaAccionada((data) => {
      console.log("🚀 ~ SlotComponent ~ this.socketService.onRuletaAccionada ~ data:", data)
      if (data.pinState === "LOW" && !this._isSpinning()) {
        this.generateRandomSymbols()
        
        switch (data.pin) {
          case 13:
            this.isla = 'Isla 1';
            break;
          case 26:
            this.isla = 'Isla 2';
            break;
          case 19:
            this.isla = 'Isla 3';
            break;
        }
      }
    });
  }

  private _isSpinning() {
    return this.spinning.some(reel => reel === true);
  }

  initialRandomSymbols() {
    this.symbolsService.updateSymbolsAndSpins(this.estacionID).subscribe((hasEnough) => {
      if (hasEnough) {
        for (let i = 0; i < 3; i++) {
          this.randomSymbols[i] = this.symbolsService.getRandomSymbol();
        }
      } else {
        alert('Asegúrese de tener al menos 3 premios activos');
      }
    });
  }

  generateRandomSymbols() {
    this.symbolsService.updateSymbolsAndSpins(this.estacionID).subscribe((hasEnough) => {
      if (!hasEnough) {
        alert('Asegúrese de tener al menos 3 premios activos');
        return;
      }

      let globalCounterValue = 0;
      this.counterService.incrementCounter(this.estacionID).subscribe({
        next: (response) => {
          globalCounterValue = response.body.globalCounterValue;
          this.spinning.fill(true);
          this.targetSymbol = this.symbolsService.checkTargetSymbol(globalCounterValue);
          let symbols: any = [];

          if (this.targetSymbol === null) {
            do {
              symbols = [
                this.symbolsService.getRandomSymbol(),
                this.symbolsService.getRandomSymbol(),
                this.symbolsService.getRandomSymbol()
              ];
            } while (symbols[0] === symbols[1] && symbols[1] === symbols[2]);
          } else {
            symbols = [this.targetSymbol, this.targetSymbol, this.targetSymbol];
          }

          this.back?.play();
          this.win?.pause();
          this.reels.forEach((reel, index) => {
            reel.blink = false;
            const direction = index === 1 ? 'down' : 'up';
            const delay = index === 1 ? 500 : index === 0 ? 0 : 250;
            setTimeout(() => {
              reel.startSpinning(symbols[index], direction, index === 1 ? 4000 : 3200);
            }, delay);
          });
        },
        error: (err) => {
          console.error('Hubo un error al incrementar el contador:', err);
        }
      });
    });
  }

  onReelStop(index: number) {
    this.spinning[index] = false;
    if (!this.spinning.includes(true)) {
      this.back?.pause();
      const match = this.reels.toArray().every((reel, index, array) => {
        return reel.currentSymbol === array[0].currentSymbol;
      });
      if (match) {
        this.win?.play();

        const symbol = this.reels.first.currentSymbol;  
        this.showPrizeMessage(symbol);

        this.reels.forEach((reel, index) => {
          reel.blink = true;
        });

        this.confettiService.launchConfetti();
      }
    }
  }

  private showPrizeMessage(symbol: any) {
    const prize = this.symbolsService.getPrizeBySymbol(symbol);
    if (prize)
      this.winningPrize = `🎉 ¡Has ganado $${prize.amount} en ${this.isla}! 🎉`;;

    this.showWinningMessage = true;
    
    setTimeout(() => {
      this.showWinningMessage = false;
      this.winningPrize = '';
    }, 4000); 
  }
}