import { NgClass, NgFor } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-dias-cell-renderer',
  standalone: true,
  imports: [NgClass, NgFor],
  templateUrl: './dias-cell-renderer.component.html',
  styleUrl: './dias-cell-renderer.component.css'
})
export class DiasCellRendererComponent {
  @Input() diasModal: string = '';
  @Input() isModal: boolean = false;
  @Output() selectedDays = new EventEmitter<string>();
  
  public dias: number[] = [];
  public readonly diasMap = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  private params: any; 

  /**
   * Inicializa el componente con los parámetros de ag-Grid
   * @param params - Parámetros de la celda
   */
  agInit(params: any): void {
    this.params = params;
    this.dias = this.daysToArray(params.data.active_days);
  }

  /**
   * Inicializa el componente cuando se usa en modo modal
   */
  ngOnInit(): void {
    if (this.isModal) {
      this.dias = this.daysToArray(this.diasModal); 
    }
  }

  /**
   * Convierte un string de días a un array de números
   * @param diasStr - String con los días (ej: '1111111')
   * @returns Array de números representando los días
   */
  daysToArray(diasStr: string): number[] {
    return diasStr.split('').map(char => parseInt(char, 10));
  }

  /**
   * Alterna el estado de un día específico
   * @param index - Índice del día a alternar
   */
  toggleDia(index: number): void {
    this.dias[index] = this.dias[index] === 1 ? 0 : 1;
    this.emitSelectedDays();
  }

  /**
   * Emite los días seleccionados como string
   */
  emitSelectedDays(): void {
    const diasString = this.dias.join('');
    this.selectedDays.emit(diasString);

    if (this.params?.onDaysChanged) {
      this.params.onDaysChanged(diasString, this.params);
    }
  }
}
