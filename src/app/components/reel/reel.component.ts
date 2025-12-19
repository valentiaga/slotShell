import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { SymbolsService } from '../../services/symbols.service';
import { CloudinaryService } from '../../services/cloudinary/cloudinary.service';

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
  @Input() duration: number = 1000;
  @Input() targetSymbol?: string | null;
  @Output() stop = new EventEmitter<void>();
  @Input() index: number = -1;

  currentSymbol: string = this.symbolsService.getRandomSymbol();
  spinning: boolean = false;
  intervalId?: any;
  blink: boolean = false;
  imageLoaded: boolean = false;

  constructor(
    private readonly symbolsService: SymbolsService,
    private readonly cloudinaryService: CloudinaryService
  ) {}

  /**
   * Inicializa el componente con un símbolo aleatorio
   */
  ngOnInit(): void {
    this.currentSymbol = this.symbolsService.getRandomSymbol();
    this.preloadCurrentImage();
  }

  /**
   * Pre-carga la imagen del símbolo actual
   */
  private preloadCurrentImage(): void {
    if (!this.isImageUrl(this.currentSymbol)) {
      return;
    }

    const cached = this.cloudinaryService.getFromCache(this.currentSymbol);
    
    if (cached) {
      this.imageLoaded = true;
    } else {
      this.cloudinaryService.preloadImages([this.currentSymbol]);
    }
  }

  /**
   * Inicia el giro del reel con el símbolo objetivo
   * @param symbol - Símbolo objetivo final
   */
  startSpinning(symbol: string): void {
    this.initializeSpinning();
    this.startSpinAnimation();
    this.scheduleStop(symbol);
  }

  /**
   * Inicializa el estado del giro
   */
  private initializeSpinning(): void {
    this.spinning = true;
    this.blink = false;
    this.imageLoaded = false;
  }

  /**
   * Inicia la animación de giro
   */
  private startSpinAnimation(): void {
    let intervalTime = 100;
    let speedUp = true;
  
    this.intervalId = setInterval(() => {
      this.updateSymbol();
      
      if (speedUp && intervalTime > 50) {
        intervalTime -= 10;
      }
  
      if (!speedUp && intervalTime < 150) {
        intervalTime += 30;
      }
  
      if (intervalTime <= 50) {
        speedUp = false;
      }
  
      clearInterval(this.intervalId);
      this.intervalId = setInterval(() => this.updateSymbol(), intervalTime);
    }, intervalTime);
  }

  /**
   * Actualiza el símbolo actual durante el giro
   */
  private updateSymbol(): void {
    const newSymbol = this.symbolsService.getRandomSymbol();
    this.currentSymbol = newSymbol;
    
    if (this.isImageUrl(newSymbol)) {
      this.cloudinaryService.preloadImages([newSymbol]);
    }
  }

  /**
   * Programa la parada del giro con el símbolo final
   * @param symbol - Símbolo final
   */
  private scheduleStop(symbol: string): void {
    setTimeout(() => {
      this.currentSymbol = symbol;
      
      if (this.isImageUrl(symbol)) {
        this.ensureImageLoaded(symbol);
      }
      
      this.stopSpinning();
    }, this.duration);
  }

  /**
   * Asegura que la imagen esté cargada antes de mostrar
   * @param imageUrl - URL de la imagen
   */
  private ensureImageLoaded(imageUrl: string): void {
    const cached = this.cloudinaryService.getFromCache(imageUrl);
    
    if (cached) {
      this.imageLoaded = true;
    } else {
      this.loadImageDirectly(imageUrl);
    }
  }

  /**
   * Carga una imagen directamente
   * @param imageUrl - URL de la imagen
   */
  private loadImageDirectly(imageUrl: string): void {
    const img = new Image();
    img.onload = () => {
      this.imageLoaded = true;
    };
    img.src = this.getOptimizedImageUrl(imageUrl);
  }

  /**
   * Verifica si una URL es una imagen
   * @param url - URL a verificar
   * @returns true si es una URL de imagen
   */
  isImageUrl(url: string): boolean {
    return url != null && (url.includes('cloudinary.com') || url.includes('prizes/') || url.includes('http'));
  }

  /**
   * Detiene el giro del reel
   */
  stopSpinning(): void {
    this.playStopAudio();
    this.clearSpinInterval();
    this.applyStopAnimation();
    this.stop.emit();
  }

  /**
   * Reproduce el audio de parada
   */
  private playStopAudio(): void {
    const audio = document.getElementById('audio_stop') as HTMLAudioElement;
    audio?.play();
  }

  /**
   * Limpia el intervalo de giro
   */
  private clearSpinInterval(): void {
    clearInterval(this.intervalId);
    this.spinning = false;
  }

  /**
   * Aplica la animación de parada al reel
   */
  private applyStopAnimation(): void {
    const reelElement = document.querySelectorAll('.reel .content')[this.index];
    
    if (reelElement) {
      reelElement.classList.add('stop-shake');
      setTimeout(() => reelElement.classList.remove('stop-shake'), 500);
    }
  }

  /**
   * Obtiene la URL optimizada de una imagen
   * @param url - URL original
   * @returns URL optimizada si es de Cloudinary, o la original
   */
  getOptimizedImageUrl(url: string): string {
    if (url.includes('cloudinary.com')) {
      return this.cloudinaryService.getOptimizedUrl(url, 512, 512);
    }
    return url;
  }
}