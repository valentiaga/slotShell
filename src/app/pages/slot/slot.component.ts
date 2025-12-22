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
import { Premio } from '../../interfaces/premio';
import { PremiosService } from '../../services/premios/premios.service';

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

  stationId!: number;
  activePrizes: Premio[] = [];
  displayPrizes: string[] = [];
  randomSymbols: string[] = ['', '', ''];
  spinning: boolean[] = new Array<boolean>(3).fill(false);
  totalSpinCount: number = 0;
  targetSymbol?: string | null;

  private backAudio?: HTMLAudioElement;
  private winAudio?: HTMLAudioElement;
  private spinStartMs: number = 0;

  socketService = inject(SocketService);

  islandName: string = '';
  baseDuration = 3200;
  winningPrize: string = '';
  showWinningMessage: boolean = false;
  isTestMode: boolean = false;
  isSpinDelayed: boolean = false;
  showIslandPlaying: boolean = true;

  getReelDuration(index: number): number {
    const offsets = [0, 250, 500];
    return this.baseDuration + (offsets[index] ?? 0);
  }

  constructor(
    private readonly symbolsService: SymbolsService,
    private readonly counterService: CounterService,
    private readonly route: ActivatedRoute,
    private readonly confettiService: ConfettiService,
    private readonly premiosService: PremiosService
  ) { }

  /**
   * Inicializa el componente configurando la estación, premios y socket
   */
  async ngOnInit(): Promise<void> {
    await this.setStation();
    this.getActivePrizes();
    this.counterService.getCounter();
    this.createSocket();
    this.checkTestMode();
  }

  /**
   * Verifica si el componente está en modo de prueba
   */
  private checkTestMode(): void {
    const url = this.route.snapshot.url.map(segment => segment.path).join('/');
    this.isTestMode = url.includes('test');

    if (this.isTestMode) {
      this.islandName = 'Isla Test';
    }
  }

  /**
   * Carga los símbolos y elementos de audio
   */
  private loadSymbols(): void {
    this.loadAudioElements();
    this.initialRandomSymbols();
  }

  /**
   * Carga los elementos de audio del DOM
   */
  private loadAudioElements(): void {
    this.backAudio = document.getElementById('audio_back') as HTMLAudioElement;
    this.winAudio = document.getElementById('audio_win') as HTMLAudioElement;
  }

  /**
   * Obtiene los premios activos para la estación actual
   */
  private getActivePrizes(): void {
    this.premiosService.getActivePrizes(this.stationId).subscribe((response) => {
      this.displayPrizes = response.body.map(prize => prize.display);
      this.activePrizes = response.body;
      this.loadSymbols();
    });
  }

  /**
   * Configura la estación actual desde los datos de la ruta
   */
  private async setStation(): Promise<void> {
    this.stationId = this.route.snapshot.data['id'];
    localStorage.setItem('idAuth', this.stationId.toString());
    this.logStationSelection();
  }

  /**
   * Registra en consola la estación seleccionada
   */
  private logStationSelection(): void {
    const stationNames: { [key: number]: string } = {
      1: 'Garay',
      2: 'Matheu',
      3: 'Roca'
    };

    const stationName = stationNames[this.stationId] || 'no válida';
    console.log(`Estación ${stationName} seleccionada`);
  }

  /**
   * Crea la conexión de socket y configura los listeners
   */
  private createSocket(): void {
    this.socketService.joinRoom(this.stationId.toString());
    this.setupSocketListeners();
  }

  /**
   * Configura los listeners del socket para eventos de ruleta
   */
  private setupSocketListeners(): void {
    this.socketService.onRuletaAccionada((data) => {
      if (this.canSpin(data)) {
        this.setIslandNameByPin(data.pinData);
        this.generateRandomSymbols();
      }
    });
  }

  /**
   * Verifica si se puede realizar un giro
   * @param data - Datos del evento de socket
   * @returns true si se puede girar
   */
  private canSpin(data: any): boolean {
    return data.pinState === "LOW" && !this.isSpinning() && !this.isSpinDelayed;
  }

  /**
   * Establece el nombre de la isla según el pin activado
   * @param pinData - Número del pin activado
   */
  private setIslandNameByPin(pinData: number): void {
    const islandMap: { [key: number]: string } = {
      0: 'Isla 1',
      5: 'Isla 2',
      6: 'Isla 3',
      13: 'Isla 4',
      19: 'Isla 5',
      26: 'Isla 6'
    };

    this.islandName = islandMap[pinData] || this.islandName;
  }

  /**
   * Verifica si algún reel está girando
   * @returns true si al menos un reel está girando
   */
  private isSpinning(): boolean {
    return this.spinning.some(reel => reel === true);
  }

  /**
   * Genera los símbolos aleatorios iniciales
   */
  private initialRandomSymbols(): void {
    this.symbolsService.updateSymbolsAndSpins(this.activePrizes).subscribe((hasEnough) => {
      if (hasEnough) {
        this.setInitialRandomSymbols();
      } else {
        alert('Asegúrese de tener al menos 3 premios activos');
      }
    });
  }

  /**
   * Establece los símbolos aleatorios iniciales en los reels
   */
  private setInitialRandomSymbols(): void {
    for (let i = 0; i < 3; i++) {
      this.randomSymbols[i] = this.symbolsService.getRandomSymbol();
    }
  }

  /**
   * Genera símbolos aleatorios y ejecuta el giro de los reels
   */
  public generateRandomSymbols(): void {
    this.symbolsService.updateSymbolsAndSpins(this.activePrizes).subscribe((hasEnough) => {
      if (!hasEnough) {
        alert('Asegúrese de tener al menos 3 premios activos');
        return;
      }

      this.startOptimisticSpin();
      this.incrementCounterAndFinalizeSpin();
    });
  }

  /**
   * Incrementa el contador y ejecuta el giro
   */
  private startOptimisticSpin(): void {
    this.spinning.fill(true);
    this.spinStartMs = performance.now();
    this.playBackgroundAudio();

    // Arranca el giro inmediato (sin símbolo final) para que no se perciba el lag del backend.
    this.reels.forEach((reel) => {
      reel.startSpinningWithoutFinal();
    });
  }

  private incrementCounterAndFinalizeSpin(): void {
    this.counterService.incrementCounter(this.stationId).subscribe({
      next: (response) => {
        const globalCounterValue = response.body.globalCounterValue;
        this.finalizeSpin(globalCounterValue);
      },
      error: (err) => {
        console.error('Hubo un error al incrementar el contador:', err);

        // Si falla el backend, detenemos el giro para no dejar la UI “colgada”.
        this.reels.forEach((reel) => reel.stopSpinning());
      }
    });
  }

  /**
   * Ejecuta el giro de los reels con los símbolos determinados
   * @param globalCounterValue - Valor del contador global
   */
  private finalizeSpin(globalCounterValue: number): void {
    this.targetSymbol = this.symbolsService.checkTargetSymbol(globalCounterValue);
    const symbols = this.determineSymbols();

    const elapsedMs = Math.max(0, performance.now() - this.spinStartMs);

    this.reels.forEach((reel, index) => {
      const totalMs = this.getReelDuration(index);
      const remainingMs = totalMs - elapsedMs;
      reel.finishSpin(symbols[index], remainingMs);
    });
  }

  /**
   * Determina los símbolos para el giro actual
   * @returns Array de símbolos para cada reel
   */
  private determineSymbols(): string[] {
    if (this.targetSymbol === null || this.targetSymbol === undefined) {
      return this.generateNonMatchingSymbols();
    } else {
      return [this.targetSymbol, this.targetSymbol, this.targetSymbol];
    }
  }

  /**
   * Genera símbolos que no coincidan todos
   * @returns Array de símbolos no coincidentes
   */
  private generateNonMatchingSymbols(): string[] {
    let symbols: string[];
    do {
      symbols = [
        this.symbolsService.getRandomSymbol(),
        this.symbolsService.getRandomSymbol(),
        this.symbolsService.getRandomSymbol()
      ];
    } while (symbols[0] === symbols[1] && symbols[1] === symbols[2]);
    return symbols;
  }

  /**
   * Reproduce el audio de fondo y pausa el audio de victoria
   */
  private playBackgroundAudio(): void {
    this.backAudio?.play();
    this.winAudio?.pause();
  }

  /**
   * Inicia el giro de todos los reels
   * @param symbols - Array de símbolos para cada reel
   */
  private startReelsSpinning(symbols: string[]): void {
    this.reels.forEach((reel, index) => {
      reel.startSpinning(symbols[index]);
    });
  }

  /**
   * Maneja el evento de parada de un reel
   * @param index - Índice del reel que se detuvo
   */
  onReelStop(index: number): void {
    this.spinning[index] = false;

    if (!this.spinning.includes(true)) {
      this.handleAllReelsStopped();
    }
  }

  /**
   * Maneja el evento cuando todos los reels se han detenido
   */
  private handleAllReelsStopped(): void {
    this.backAudio?.pause();

    if (this.checkForMatch()) {
      this.handleWin();
    }
  }

  /**
   * Verifica si todos los reels muestran el mismo símbolo
   * @returns true si hay coincidencia
   */
  private checkForMatch(): boolean {
    return this.reels.toArray().every((reel, index, array) => {
      return reel.currentSymbol === array[0].currentSymbol;
    });
  }

  /**
   * Maneja la lógica cuando se gana un premio
   */
  private handleWin(): void {
    this.winAudio?.play();

    const symbol = this.reels.first.currentSymbol;
    this.showPrizeMessage(symbol);
    this.activateReelBlink();
    this.confettiService.launchConfetti();
    this.setSpinDelay();
  }

  /**
   * Activa el efecto de parpadeo en todos los reels
   */
  private activateReelBlink(): void {
    this.reels.forEach((reel) => {
      reel.blink = true;
    });
  }

  /**
   * Establece un delay temporal para evitar giros inmediatos
   */
  private setSpinDelay(): void {
    this.isSpinDelayed = true;
    setTimeout(() => {
      this.isSpinDelayed = false;
    }, 10000);
  }

  /**
   * Muestra el mensaje del premio ganado
   * @param symbol - Símbolo del premio ganado
   */
  private showPrizeMessage(symbol: any): void {
    const prize = this.symbolsService.getPrizeBySymbol(symbol);

    if (prize) {
      const { prizeDisplay, prizeValue } = this.getPrizeDisplayInfo(prize);
      this.winningPrize = `🎉 ¡Has ganado ${prizeDisplay.toLowerCase()} en ${this.islandName}! 🎉`;
      this.emitPrizeWon(prize, prizeValue);
    }

    this.displayWinningMessage();
  }

  /**
   * Obtiene la información de visualización del premio
   * @param prize - Premio ganado
   * @returns Objeto con la visualización y valor del premio
   */
  private getPrizeDisplayInfo(prize: Premio): { prizeDisplay: string; prizeValue: number } {
    if (prize.amount && prize.amount > 0) {
      return {
        prizeDisplay: `$${prize.amount}`,
        prizeValue: prize.amount
      };
    } else if (prize.description) {
      return {
        prizeDisplay: prize.description,
        prizeValue: 0
      };
    } else {
      return {
        prizeDisplay: prize.title,
        prizeValue: 0
      };
    }
  }

  /**
   * Emite el evento de premio ganado al socket
   * @param prize - Premio ganado
   * @param prizeValue - Valor del premio
   */
  private emitPrizeWon(prize: Premio, prizeValue: number): void {
    const data = {
      valor: prizeValue,
      descripcion: prize.description || null,
      isla: this.islandName,
      estacion: this.stationId
    };

    this.socketService.emit('premioGanado', data);
  }

  /**
   * Muestra el mensaje de victoria temporalmente
   */
  private displayWinningMessage(): void {
    this.showWinningMessage = true;
    this.showIslandPlaying = false;

    setTimeout(() => {
      this.hideWinningMessage();
    }, 6000);
  }

  /**
   * Oculta el mensaje de victoria
   */
  private hideWinningMessage(): void {
    this.showWinningMessage = false;
    this.winningPrize = '';
    this.showIslandPlaying = true;
  }
}
