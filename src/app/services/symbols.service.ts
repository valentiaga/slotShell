import { Injectable } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { environments } from '../../assets/environment';
import { HttpClient } from '@angular/common/http';
import { PremiosService } from './premios/premios.service';
import { Premio } from '../interfaces/premio';

@Injectable({
  providedIn: 'root',
})
export class SymbolsService {
  totalSpinCount: number = 0;
  symbols: string[] = [];
  symbolMaxSpins: { [symbol: string]: number } = {};
  private readonly baseUrl: string = environments.BASE_URL

  constructor(private http: HttpClient, private premiosService: PremiosService) {
    this.loadSymbols();
  }

  private loadSymbols(): void {
    this.premiosService.getPremios(1).subscribe({
      next: (response) => {
        if (response.error) {
          console.error('Error al obtener premios');
        } else {          
          this.updateSymbolsAndSpins(response.body);
        }
      },
      error: (error) => {
        console.error('Error al obtener premios:', error);
      }
    });
  }

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

  private updateSymbolsAndSpins(premios: Premio[]): void {
    const now = new Date();
    let currentDay = now.getDay();
    currentDay = (currentDay === 0) ? 6 : currentDay - 1;
  
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    // Función para verificar si un premio es válido
    const isValidPremio = (premio: Premio): boolean => {
      // Verificar que el premio esté activo
      if (!premio.is_active) return false;
  
      // Verificar que la hora actual esté entre start_time y end_time
      if (currentTime < premio.start_time || currentTime > premio.end_time) return false;
  
      // Verificar si el día actual está activo según active_days
      const activeDays = premio.active_days;
      return activeDays[currentDay] === '1';
    };
  
    const filteredPremios = premios.filter(isValidPremio);
      this.symbols = filteredPremios.map((premio: Premio) => premio.display); 
  
    this.symbolMaxSpins = filteredPremios.reduce((acc: { [key: string]: number }, premio: Premio) => {
      acc[premio.display] = premio.spins;
      return acc;
    }, {});
  }  
}
