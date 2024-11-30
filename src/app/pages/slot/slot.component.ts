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
  imports: [NgFor, ReelComponent, RouterOutlet, NgClass],
  templateUrl: './slot.component.html',
  styleUrls: ['./slot.component.css'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class SlotComponent implements OnInit{
  @ViewChildren(ReelComponent) reels!: QueryList<ReelComponent>;
  estacionId!: number;
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
    this.setEstacion();
    this.loadSymbols();
    this.createSocket();
  }

  loadSymbols(){
    this.back = document.getElementById('audio_back') as HTMLAudioElement;
    this.win = document.getElementById('audio_win') as HTMLAudioElement;
    this.initialRandomSymbols();
  }

  setEstacion() {
    this.estacionId = this.route.snapshot.data['id'];
    switch (this.estacionId) {
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
    // await this.socketService.connectToRaspberryPi();
    this.socketService.onPinChange().subscribe(data => {
      console.log('Cambia el pin!', data); 
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
      }
    });
  }

  initialRandomSymbols() {
    for (let i = 0; i < 3; i++) {
      this.randomSymbols[i] = this.symbolsService.getRandomSymbol();
    }
  }

  generateRandomSymbols() {
    this.counterService.incrementCounter().subscribe({
      next: () => {
        console.log('El contador fue incrementado correctamente');
      },
      error: (err) => {
        console.error('Hubo un error al incrementar el contador:', err);
      }
    });
    this.spinning.fill(true);
    this.targetSymbol = this.symbolsService.checkTargetSymbol();
    this.back?.play();
    this.win?.pause();
    this.reels.forEach((reel, index) => {
      reel.startSpinning();
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