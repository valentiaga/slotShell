import { NgFor, NgStyle } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { SymbolsService } from '../../services/symbols.service';
import { ReelComponent } from '../../components/reel/reel.component';

@Component({
  selector: 'app-slot',
  standalone: true,
  imports: [NgFor, ReelComponent, NgStyle],
  templateUrl: './slot.component.html',
  styleUrls: ['./slot.component.css'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class SlotComponent {
  @ViewChildren(ReelComponent) reels!: QueryList<ReelComponent>; //Agarra todos los Reels que contiene
  randomSymbols: string[] = ['', '', ''];
  spinning: boolean[] = new Array<boolean>(3).fill(false);
  totalSpinCount: number = 0;
  targetSymbol?: string | null;
  back?: HTMLAudioElement;
  win?: HTMLAudioElement;

  constructor(private symbolsService: SymbolsService) {}

  ngOnInit() {
    this.back = document.getElementById('audio_back') as HTMLAudioElement;
    this.win = document.getElementById('audio_win') as HTMLAudioElement;
    this.initialRandomSymbols();
  }

  initialRandomSymbols() {
    for (let i = 0; i < 3; i++) {
      this.randomSymbols[i] = this.symbolsService.getRandomSymbol();
    }
  }

  generateRandomSymbols() {
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

  getSlotStyle(index: number): object {
    const positions = [
      { left: '0%', top: '15%' },
      { left: '0%', top: '15%' },
      { left: '0%', top: '15%' }
    ];

    return positions[index];
  }

  getDuration(index: number) {
    let duration = 0;
    
    // if (index>0){
    //   let match: boolean = .
    // }

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