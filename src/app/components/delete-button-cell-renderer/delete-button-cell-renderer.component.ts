import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-delete-button-cell-renderer',
  standalone: true,
  imports: [],
  templateUrl: './delete-button-cell-renderer.component.html',
  styleUrl: './delete-button-cell-renderer.component.css'
})
export class DeleteButtonCellRendererComponent {
  @Input() params: any;
  @Output() delete = new EventEmitter<number>();

  agInit(params: any): void {
    this.params = params;
  }

  onDelete() {
    const rowId = this.params.data.id_prize;

    if (this.params?.onDelete) {
      this.params.onDelete(rowId);
    }
  }
}
