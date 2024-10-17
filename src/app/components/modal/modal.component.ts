import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ModalContent } from '../../interfaces/modal';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DiasCellRendererComponent } from '../dias-cell-renderer/dias-cell-renderer.component';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [NgIf, NgClass, NgFor, FormsModule, DiasCellRendererComponent],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css'
})
export class ModalComponent {
  @Input() showFormulaButton: boolean = false;
  isChecked = true;
  @Output() close = new EventEmitter();
  @Output() formSubmit = new EventEmitter<any>();
  @Output() addFormula = new EventEmitter<any>();
  formData: { [key: string]: any } = {};
  @Input() isToggled: boolean = false;
  showFileInput = false;
  displayDisabled = false;

  toggleFileInput() {
    this.showFileInput = !this.showFileInput;
    this.displayDisabled = !this.displayDisabled;
  }

  onSubmit(form: any) {
    console.log(this.formData);
    this.formSubmit.emit(this.formData);
  }

  onClose() {
    this.close.emit(null);
  }

  onCheckboxChange(event: Event, key: string) {
    const inputElement = event.target as HTMLInputElement;
    this.formData[key] = inputElement.checked;
  }
}
