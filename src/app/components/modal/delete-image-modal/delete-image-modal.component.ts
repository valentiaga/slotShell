import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-delete-image-modal',
  standalone: true,
  imports: [NgIf, NgFor],
  templateUrl: './delete-image-modal.component.html'
})
export class DeleteImageModalComponent {
  @Input() prizesUsingPendingImage: any[] = [];
  @Input() isDeletingImage: boolean = false;

  @Output() cancel = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();
}
