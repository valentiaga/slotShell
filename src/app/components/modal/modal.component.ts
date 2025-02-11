import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { NgClass, NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DiasCellRendererComponent } from '../dias-cell-renderer/dias-cell-renderer.component';
import { ImagesService } from '../../services/images/images.service';
import { ToastService } from '../../services/toast/toast.service';
import { Image } from '../../interfaces/image';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [NgIf, NgClass, NgFor, FormsModule, DiasCellRendererComponent],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css'
})
export class ModalComponent implements OnInit {
  @Output() close = new EventEmitter();
  @Output() formSubmit = new EventEmitter<any>();
  @Output() addFormula = new EventEmitter<any>();
  @Input() existingPrizes: any[] = [];

  private _imagesService = inject(ImagesService);
  private _toastService = inject(ToastService);

  isSpinDuplicate = false;
  id_prize = -1;
  isChecked = true;
  images: Image[] = [];
  showImageSelector = false;
  selectedImageName: string = '';


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

  ngOnInit(): void {
    this.loadImages();
  }

  onSubmit(form: any) {
    this.formSubmit.emit(this.formData);
  }

  toggleImageSelection(image: any) {
    if (this.formData['display'] === image.url_img) {
      this.formData['display'] = '';
      this.selectedImageName = '';
    } else {
      this.formData['display'] = image.url_img;
      this.selectedImageName = image.name_img;
    }
  }

  toggleSelector() {
    this.showImageSelector = !this.showImageSelector;
    this.formData['display'] = ''; 
  }

  clearSelection() {
    this.formData['display'] = ''; 
    this.selectedImageName = '';
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

  loadImages() {
    this._imagesService.getimages().subscribe({
      next: (response) => {
        this.images = response.body;
      },
      error: () => {
        this._toastService.showToast('error', 'Ocurrió un error al cargar las imagenes');
      }
    });
  }

  selectImage(imageUrl: string) {
    this.formData['display'] = imageUrl;
  }
}
