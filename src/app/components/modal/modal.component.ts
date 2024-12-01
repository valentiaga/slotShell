import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgClass, NgIf} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DiasCellRendererComponent } from '../dias-cell-renderer/dias-cell-renderer.component';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [NgIf, NgClass, FormsModule, DiasCellRendererComponent],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css'
})
export class ModalComponent {
  @Output() close = new EventEmitter();
  @Output() formSubmit = new EventEmitter<any>();
  @Output() addFormula = new EventEmitter<any>();
  @Input() existingPrizes: any[] = [];
  isSpinDuplicate = false;
  id_prize = -1;
  isChecked = true;
  formData: { [key: string]: any } = {
    title: '',
    amount: '',
    display: '',
    frequency: 1,
    is_active: true,
    spins: '',
    start_time: '00:00',
    end_time: '23:59',
    active_days: '1111111'
  };

  onSubmit(form: any) {
    this.formSubmit.emit(this.formData);
  }

  validateSpins(spins: number) {
    const duplicatePrize = this.existingPrizes.find((premio) => premio.spins === spins);
    this.isSpinDuplicate = !!duplicatePrize;
    this.id_prize = duplicatePrize ? duplicatePrize.id_prize : null;
  }

  onSelectedDays(selectedDays: any) {    
    this.formData['active_days'] = selectedDays;
  }

  onClose() {
    this.close.emit(null);
  }

  get isFormValid(): boolean {
    return this.formData['title'] 
      && this.formData['amount'] 
      && this.formData['display'] 
      && this.formData['spins']
      && !this.isSpinDuplicate;
  }

  onCheckboxChange(event: Event, key: string) {
    const inputElement = event.target as HTMLInputElement;
    this.formData[key] = inputElement.checked;
  }
}
