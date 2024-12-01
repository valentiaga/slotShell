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

  agInit(params: any): void {
    this.params = params;
    this.checked = params.data.is_active;
  }

  onChange(event: Event) {    
    const checkbox = event.target as HTMLInputElement;
    const newValue = checkbox.checked;

    // Llama al evento de cambio en el padre
    if (this.params && this.params.colDef?.field) {
      this.params.data[this.params.colDef.field] = newValue;
      this.params.api.refreshCells({ rowNodes: [this.params.node], force: true });

      // Notifica al componente principal sobre el cambio
      this.params.context.componentParent.onCellValueChanged({
        data: this.params.data,
        colDef: this.params.colDef,
        rowIndex: this.params.data.id_prize,
        oldValue: this.params.value,
        newValue: newValue,
      });
    }
  }
}
