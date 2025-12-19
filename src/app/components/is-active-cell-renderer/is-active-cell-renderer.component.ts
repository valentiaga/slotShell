import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'app-is-active-cell-renderer',
  templateUrl: './is-active-cell-renderer.component.html',
  styleUrls: ['./is-active-cell-renderer.component.css']
})
export class IsActiveCellRendererComponent {
  private params: any;
  checked = false;

  /**
   * Inicializa el componente con los parámetros de ag-Grid
   * @param params - Parámetros de la celda
   */
  agInit(params: any): void {
    this.params = params;
    this.checked = params.data.is_active;
  }

  /**
   * Maneja el cambio de estado del checkbox
   * @param event - Evento del checkbox
   */
  onChange(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const newValue = checkbox.checked;

    if (this.params && this.params.colDef?.field) {
      this.updateCellData(newValue);
      this.notifyParentComponent(newValue);
    }
  }

  /**
   * Actualiza los datos de la celda
   * @param newValue - Nuevo valor del checkbox
   */
  private updateCellData(newValue: boolean): void {
    this.params.data[this.params.colDef.field] = newValue;
    this.params.api.refreshCells({ rowNodes: [this.params.node], force: true });
  }

  /**
   * Notifica al componente padre sobre el cambio
   * @param newValue - Nuevo valor del checkbox
   */
  private notifyParentComponent(newValue: boolean): void {
    this.params.context.componentParent.onCellValueChanged({
      data: this.params.data,
      colDef: this.params.colDef,
      rowIndex: this.params.data.id_prize,
      oldValue: this.params.value,
      newValue: newValue,
    });
  }
}
