import { Injectable } from '@angular/core';
import { map, Observable, of, tap } from 'rxjs';
import { environments } from '../../assets/environment';
import { HttpClient } from '@angular/common/http';
import { PremiosService } from './premios/premios.service';
import { Premio } from '../interfaces/premio';
import { CloudinaryService } from './cloudinary/cloudinary.service';

@Injectable({
  providedIn: 'root',
})
export class SymbolsService {
  totalSpinCount: number = 0;
  symbols: string[] = [];
  symbolMaxSpins: { [symbol: string]: number } = {};
  globalCounterValue = -1;
  activePrizes: Premio[] = [];
  
  private readonly baseUrl: string = environments.BASE_URL;

  constructor(
    private readonly http: HttpClient,
    private readonly premiosService: PremiosService,
    private readonly cloudinaryService: CloudinaryService
  ) {}

  /**
   * Obtiene un símbolo aleatorio de los disponibles
   * @returns Símbolo aleatorio
   */
  getRandomSymbol(): string {
    const randomIndex = Math.floor(Math.random() * this.symbols.length);
    return this.symbols[randomIndex];
  }

  /**
   * Verifica si hay un símbolo objetivo basado en el contador global
   * @param globalCounterValue - Valor del contador global
   * @returns Símbolo objetivo o null si no hay coincidencia
   */
  checkTargetSymbol(globalCounterValue: number): string | null {
    const validSymbols = this.getValidSymbols(globalCounterValue);
  
    if (validSymbols.length === 0) {
      return null;
    }
  
    return this.getSymbolWithMaxSpins(validSymbols);
  }

  /**
   * Obtiene los símbolos válidos para el contador actual
   * @param globalCounterValue - Valor del contador global
   * @returns Array de símbolos válidos
   */
  private getValidSymbols(globalCounterValue: number): string[] {
    return this.symbols.filter((symbol) => {
      const maxSpins = this.symbolMaxSpins[symbol];
      return maxSpins > 0 && globalCounterValue % maxSpins === 0;
    });
  }

  /**
   * Obtiene el símbolo con el mayor número de spins
   * @param symbols - Array de símbolos
   * @returns Símbolo con mayor número de spins
   */
  private getSymbolWithMaxSpins(symbols: string[]): string {
    let targetSymbol = symbols[0];
    let maxSpins = this.symbolMaxSpins[symbols[0]];
  
    for (const symbol of symbols) {
      const spins = this.symbolMaxSpins[symbol];
      if (spins > maxSpins) {
        maxSpins = spins;
        targetSymbol = symbol;
      }
    }
  
    return targetSymbol;
  }

  /**
   * Verifica si hay suficientes premios activos
   * @returns true si hay al menos 3 premios activos
   */
  public hasEnoughPrizes(): boolean {
    return this.activePrizes.length >= 3;
  }

  /**
   * Actualiza los símbolos y spins con los premios activos
   * @param activePrizes - Array de premios activos
   * @returns Observable indicando si hay suficientes premios
   */
  updateSymbolsAndSpins(activePrizes: Premio[]): Observable<boolean> {
    this.activePrizes = activePrizes;
    this.updateSymbols(activePrizes);
    this.updateSymbolMaxSpins(activePrizes);
    this.preloadPrizeImages();
    
    return of(this.hasEnoughPrizes());
  }

  /**
   * Actualiza el array de símbolos
   * @param activePrizes - Array de premios activos
   */
  private updateSymbols(activePrizes: Premio[]): void {
    this.symbols = activePrizes.map((prize: Premio) => prize.display);
  }

  /**
   * Actualiza el mapeo de símbolos a spins máximos
   * @param activePrizes - Array de premios activos
   */
  private updateSymbolMaxSpins(activePrizes: Premio[]): void {
    this.symbolMaxSpins = activePrizes.reduce(
      (acc: { [key: string]: number }, prize: Premio) => {
        acc[prize.display] = prize.spins;
        return acc;
      }, 
      {}
    );
  }

  /**
   * Pre-carga las imágenes de los premios activos
   */
  private preloadPrizeImages(): void {
    const imageUrls = this.symbols.filter(symbol => this.isImageUrl(symbol));
    
    if (imageUrls.length > 0) {
      this.cloudinaryService.preloadImages(imageUrls);
    }
  }

  /**
   * Obtiene un premio por su símbolo
   * @param symbol - Símbolo del premio
   * @returns Premio encontrado o null
   */
  getPrizeBySymbol(symbol: string): Premio | null {
    return this.activePrizes.find(prize => prize.display === symbol) || null;
  }

  /**
   * Verifica si una URL es una imagen
   * @param url - URL a verificar
   * @returns true si es una URL de imagen
   */
  private isImageUrl(url: string): boolean {
    return url.includes('cloudinary.com') || url.includes('prizes/') || url.includes('http');
  }
}