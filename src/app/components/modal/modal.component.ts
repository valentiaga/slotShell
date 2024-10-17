import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ModalContent } from '../../interfaces/modal';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [NgIf, NgClass, NgFor, FormsModule],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css'
})
export class ModalComponent {
  @Input() showFormulaButton: boolean = false;

  @Output() close = new EventEmitter();
  @Output() formSubmit = new EventEmitter<any>();
  @Output() addFormula = new EventEmitter<any>();
  formData: { [key: string]: any } = {};
  @Input() isToggled: boolean = false;

  onSubmit(form: any) {
    console.log(this.formData);
    this.formSubmit.emit(this.formData);
  }

  disableAddFormulaButton() {
    // const campo = MODAL_ESTRUCTURA.PRODUCTO.rows[0].options[0].value;
    return false;
  }

  onAddFormula() {
    console.log(
      '🚀 ~ ModalComponent ~ onAddFormula ~ this.formData:',
      this.formData
    );
    this.addFormula.emit(this.formData);
  }

  onClose() {
    this.close.emit(null);
  }

  onCheckboxChange(event: Event, key: string) {
    const inputElement = event.target as HTMLInputElement;
    this.formData[key] = inputElement.checked;
  }

  // ngOnInit(): void {
  //   this.content.rows.forEach((row) => {
  //     row.options.forEach((option) => {
  //       if (option.preset) {
  //         this.formData[option.value] = option.preset;
  //       }
  //     });
  //   });
  // }
}
