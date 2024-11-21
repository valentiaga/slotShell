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
  @Output() close = new EventEmitter();
  @Output() formSubmit = new EventEmitter<any>();
  @Output() addFormula = new EventEmitter<any>();
  @Input() isToggled: boolean = false;
  isChecked = true;
  showFileInput = false;
  displayDisabled = false;
  formData: { [key: string]: any } = {
    title: '',
    amount: '',
    display: '',
    file: '',
    frequency: 1,
    is_active: true,
    spins: '',
    start_time: '00:00',
    end_time: '23:59',
    active_days: '1111111'
  };

  toggleFileInput() {
    this.showFileInput = !this.showFileInput;
    this.displayDisabled = !this.displayDisabled;
  }

  onSubmit(form: any) {
    console.log(this.formData);
    this.formSubmit.emit(this.formData);
  }

  onSelectedDays(selectedDays: any) {    
    this.formData['active_days'] = selectedDays;
  }

  onClose() {
    this.close.emit(null);
  }

  get isFormValid(): boolean {
    return this.formData['title'] && this.formData['amount'] && (this.formData['display'] || this.formData['file']) && this.formData['spins'];
  }

  onCheckboxChange(event: Event, key: string) {
    const inputElement = event.target as HTMLInputElement;
    this.formData[key] = inputElement.checked;
  }

  onFileSelected(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const file = inputElement.files?.[0];
  
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        alert('Debe seleccionar un archivo valido (.jpeg, .jpg, .png).');
        return;
      }
  
      this.formData['file'] = file;
      console.log('Archivo seleccionado:', file);
    }
  }
}
