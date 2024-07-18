import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SymbolsService {
  totalSpinCount: number = 0;

  symbols: string[] = ['☕️', '⛽️', '⚽️', '🧉', '🏍️', '🍔', '🥐', '🚗'];
  symbolMaxSpins: { [symbol: string]: number } = {
    '☕️': 3,
    '⛽️': 13,
    '⚽️': 17,
    '🧉': 29,
    '🏍️': 37,
    '🍔': 59,
    '🥐': 67,
    '🚗': 79,
  };

  getRandomSymbol(): string {
    const randomIndex = Math.floor(Math.random() * this.symbols.length);
    return this.symbols[randomIndex];
  }

  checkTargetSymbol(): string | null {
    this.totalSpinCount > 99 ? 1 : this.totalSpinCount++;
    for (let symbol of this.symbols) {
      if (this.totalSpinCount % this.symbolMaxSpins[symbol] === 0) {
        return symbol;
      }
    }
    return null;
  }
}
