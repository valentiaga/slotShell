import { NgClass, NgFor, NgStyle } from '@angular/common';
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

@Component({
  selector: 'app-slot',
  standalone: true,
  imports: [ReelComponent, RouterOutlet, NgClass],
  templateUrl: './slot.component.html',
  styleUrls: ['./slot.component.css'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class SlotComponent implements OnInit{
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

  constructor(private symbolsService: SymbolsService, private counterService: CounterService, private route: ActivatedRoute) {}

  async ngOnInit() {
    await this.setEstacion();
    this.counterService.getCounter();
    this.loadSymbols();
    this.createSocket();
  }

  loadSymbols(){
    this.back = document.getElementById('audio_back') as HTMLAudioElement;
    this.win = document.getElementById('audio_win') as HTMLAudioElement;
    this.symbolsService.loadSymbols(this.estacionID);
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
      console.log(data);
      if (data.state === "HIGH"){
        this.generateRandomSymbols()
      }
      switch(data.pin){
        case 13:
          this.isla = 'Isla 1';
        break;
        case 26:
          this.isla = 'Isla 2';
        break;
        case 19:
          this.isla = 'Isla 3';
        break;
    }});
  }

  initialRandomSymbols() {
    for (let i = 0; i < 3; i++) {
      this.randomSymbols[i] = this.symbolsService.getRandomSymbol();
    }
  }

  generateRandomSymbols() {
    let globalCounterValue = 0;
    this.counterService.incrementCounter(this.estacionID).subscribe({
      next: (response) => {
        globalCounterValue = response.body.globalCounterValue;
        this.spinning.fill(true);
        this.targetSymbol = this.symbolsService.checkTargetSymbol(globalCounterValue);
        let symbols: any = [];

        if (this.targetSymbol === null && this.symbolsService.hasSymbols()) {
          do {
            symbols = [
              this.symbolsService.getRandomSymbol(),
              this.symbolsService.getRandomSymbol(),
              this.symbolsService.getRandomSymbol()
            ];
          } while (symbols[0] === symbols[1] && symbols[1] === symbols[2]);
        } else {
          // Si targetSymbol no es null, lo usamos para los tres
          symbols = [this.targetSymbol, this.targetSymbol, this.targetSymbol];
        }
        
        this.back?.play();
        this.win?.pause();
        this.reels.forEach((reel, index) => {
          reel.startSpinning(symbols[index]);  // Le pasamos el símbolo correspondiente a cada reel
        });
      },
      error: (err) => {
        console.error('Hubo un error al incrementar el contador:', err);
      }
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
        this.reels.forEach((reel, index) => {
          reel.blink = true;
        });
      }
    }
  }

  getDuration(index: number) {
    let duration = 0;

    switch (index) {
      case 0: 
        duration = 600;
        break;
      case 1: duration = 1800;
        break;
      case 2:  duration = 2400;
        break;
    }
    return duration;
  }
}