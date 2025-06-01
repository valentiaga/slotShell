import { Injectable } from '@angular/core';
import { map, Observable, of, tap } from 'rxjs';
import { environments } from '../../assets/environment';
import { HttpClient } from '@angular/common/http';
import { PremiosService } from './premios/premios.service';
import { Premio } from '../interfaces/premio';
import { CounterService } from './counter/counter.service';

@Injectable({
  providedIn: 'root',
})
export class SymbolsService {
  totalSpinCount: number = 0;
  symbols: string[] = [];
  symbolMaxSpins: { [symbol: string]: number } = {};
  private readonly baseUrl: string = environments.BASE_URL
  globalCounterValue = -1;
  activePrizes: Premio[] = [];

  constructor(
    private http: HttpClient,
    private premiosService: PremiosService,
    private counterService: CounterService
  ) {}

  getRandomSymbol(): string {
    const randomIndex = Math.floor(Math.random() * this.symbols.length);
    return this.symbols[randomIndex];
  }

  checkTargetSymbol(globalCounterValue: number): string | null {
    // Filtrar símbolos que cumplen con la condición de spins
    const validSymbols = this.symbols.filter((symbol) => {
      const maxSpins = this.symbolMaxSpins[symbol];
      return maxSpins > 0 && globalCounterValue % maxSpins === 0;
    });

    if (validSymbols.length === 0) {
      return null;
    }

    // Encontrar el símbolo con el mayor valor de spins
    let targetSymbol = validSymbols[0];
    let maxSpins = this.symbolMaxSpins[validSymbols[0]];

    for (let symbol of validSymbols) {
      const spins = this.symbolMaxSpins[symbol];
      if (spins > maxSpins) {
        maxSpins = spins;
        targetSymbol = symbol;
      }
    }

    return targetSymbol;
  }

  public hasEnoughPrizes(): boolean {
    return this.activePrizes.length >= 3;
  }

  updateSymbolsAndSpins(activePrizes: Premio[]): Observable<boolean> {
    this.activePrizes = activePrizes;
    this.symbols = activePrizes.map((premio: Premio) => premio.display);
    this.symbolMaxSpins = activePrizes.reduce((acc: { [key: string]: number }, premio: Premio) => {
      acc[premio.display] = premio.spins;
      return acc;
    }, {});

    return of(this.hasEnoughPrizes());
  }

  getPrizeBySymbol(symbol: string): Premio | null {
    return this.activePrizes.find(premio => premio.display === symbol) || null;
  }
}
