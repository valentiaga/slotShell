import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { NgClass, NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DiasCellRendererComponent } from '../dias-cell-renderer/dias-cell-renderer.component';
import { ImagesService } from '../../services/images/images.service';
import { CloudinaryService } from '../../services/cloudinary/cloudinary.service';
import { ToastService } from '../../services/toast/toast.service';
import { CloudinaryImage } from '../../interfaces/image';

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
  @Input() existingPrizes: any[] = [];

  private readonly _imagesService = inject(ImagesService);
  private readonly _cloudinaryService = inject(CloudinaryService);
  private readonly _toastService = inject(ToastService);

  isSpinDuplicate = false;
  prizeId = -1;
  isChecked = true;
  images: CloudinaryImage[] = [];
  showImageSelector = true;
  selectedImageName: string = '';
  prizeType: 'monetario' | 'no_monetario' = 'monetario';
  isUploadingImage: boolean = false;

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

  /**
   * Inicializa el componente cargando las imágenes disponibles
   */
  ngOnInit(): void {
    this.loadImages();
  }

  /**
   * Procesa el envío del formulario preparando los datos según el tipo de premio
   * @param form - Formulario con los datos del premio
   */
  onSubmit(form: any): void {
    const submitData = this.prepareSubmitData();
    this.formSubmit.emit(submitData);
  }

  /**
   * Prepara los datos para enviar según el tipo de premio
   * @returns Datos del premio preparados para envío
   */
  private prepareSubmitData(): any {
    const submitData = { ...this.formData };
    
    if (this.prizeType === 'no_monetario') {
      submitData['amount'] = null;
    } else {
      submitData['description'] = null;
    }
    
    return submitData;
  }

  /**
   * Maneja el cambio de tipo de premio limpiando los campos correspondientes
   */
  onTipoChange(): void {
    this.clearFieldsByPrizeType();
  }

  /**
   * Limpia los campos del formulario según el tipo de premio seleccionado
   */
  private clearFieldsByPrizeType(): void {
    if (this.prizeType === 'monetario') {
      this.formData['description'] = '';
    } else {
      this.formData['amount'] = '';
    }
  }

  /**
   * Abre el widget de Cloudinary para subir una nueva imagen
   */
  openCloudinaryUpload(): void {
    this.isUploadingImage = true;
    
    this._cloudinaryService.openUploadWidget(
      (result) => this.handleUploadSuccess(result),
      (error) => this.handleUploadError(error)
    );
  }

  /**
   * Maneja el éxito de la subida de imagen
   * @param result - Resultado de la subida de Cloudinary
   */
  private handleUploadSuccess(result: any): void {
    const imageData = this.createImageData(result);

    this._imagesService.saveImage(imageData).subscribe({
      next: () => {
        this._toastService.showToast('success', 'Imagen subida exitosamente');
        this.selectUploadedImage(result);
        this.loadImages();
        this.isUploadingImage = false;
      },
      error: () => {
        this._toastService.showToast('error', 'Error al guardar imagen en BD');
        this.isUploadingImage = false;
      }
    });
  }

  /**
   * Crea el objeto de datos de imagen desde el resultado de Cloudinary
   * @param result - Resultado de la subida de Cloudinary
   * @returns Objeto con los datos de la imagen
   */
  private createImageData(result: any): any {
    return {
      name_img: result.original_filename,
      url_img: result.secure_url,
      public_id: result.public_id,
      is_new: true
    };
  }

  /**
   * Selecciona la imagen recién subida en el formulario
   * @param result - Resultado de la subida de Cloudinary
   */
  private selectUploadedImage(result: any): void {
    this.formData['display'] = result.secure_url;
    this.selectedImageName = result.original_filename;
  }

  /**
   * Maneja los errores durante la subida de imagen
   * @param error - Error ocurrido durante la subida
   */
  private handleUploadError(error: any): void {
    this._toastService.showToast('error', 'Error al subir imagen');
    this.isUploadingImage = false;
  }

  /**
   * Alterna la selección de una imagen
   * @param image - Imagen a seleccionar/deseleccionar
   */
  toggleImageSelection(image: any): void {
    const isCurrentlySelected = this.formData['display'] === image.url_img;
    
    if (isCurrentlySelected) {
      this.clearSelection();
    } else {
      this.selectImage(image.url_img, image.name_img);
    }
  }

  /**
   * Selecciona una imagen específica
   * @param imageUrl - URL de la imagen
   * @param imageName - Nombre de la imagen
   */
  private selectImage(imageUrl: string, imageName: string): void {
    this.formData['display'] = imageUrl;
    this.selectedImageName = imageName;
  }

  /**
   * Alterna la visibilidad del selector de imágenes
   */
  toggleSelector(): void {
    this.showImageSelector = !this.showImageSelector;
    this.formData['display'] = ''; 
  }

  /**
   * Limpia la selección de imagen actual
   */
  clearSelection(): void {
    this.formData['display'] = ''; 
    this.selectedImageName = '';
  }

  /**
   * Valida si el número de spins ya existe en otro premio
   * @param spins - Número de spins a validar
   */
  validateSpins(spins: number): void {
    const duplicatePrize = this.findPrizeBySpins(spins);
    this.isSpinDuplicate = !!duplicatePrize;
    this.prizeId = duplicatePrize ? duplicatePrize.id_prize : null;
  }

  /**
   * Busca un premio por su número de spins
   * @param spins - Número de spins a buscar
   * @returns Premio encontrado o undefined
   */
  private findPrizeBySpins(spins: number): any {
    return this.existingPrizes.find((prize) => prize.spins === spins);
  }

  /**
   * Actualiza los días activos seleccionados
   * @param selectedDays - String con los días seleccionados
   */
  onSelectedDays(selectedDays: any): void {
    this.formData['active_days'] = selectedDays;
  }

  /**
   * Cierra el modal emitiendo el evento de cierre
   */
  onClose(): void {
    this.close.emit(null);
  }

  /**
   * Valida si el formulario es válido
   * @returns true si el formulario es válido, false en caso contrario
   */
  get isFormValid(): boolean {
    const baseValidation = this.validateBaseFields();
    return this.validateByPrizeType(baseValidation);
  }

  /**
   * Valida los campos base del formulario
   * @returns true si los campos base son válidos
   */
  private validateBaseFields(): boolean {
    return !!(this.formData['title'] &&
      this.formData['display'] &&
      this.formData['spins'] &&
      !this.isSpinDuplicate);
  }

  /**
   * Valida campos específicos según el tipo de premio
   * @param baseValidation - Resultado de la validación base
   * @returns true si la validación completa es exitosa
   */
  private validateByPrizeType(baseValidation: boolean): boolean {
    if (this.prizeType === 'monetario') {
      return baseValidation && !!this.formData['amount'];
    } else {
      return baseValidation && !!this.formData['description'];
    }
  }

  /**
   * Maneja el cambio de estado de un checkbox
   * @param event - Evento del checkbox
   * @param key - Clave del campo en formData
   */
  onCheckboxChange(event: Event, key: string): void {
    const inputElement = event.target as HTMLInputElement;
    this.formData[key] = inputElement.checked;
  }

  /**
   * Carga la lista de imágenes disponibles desde el servicio
   */
  loadImages(): void {
    this._imagesService.getimages().subscribe({
      next: (response) => {
        this.images = response.body;
      },
      error: () => {
        this._toastService.showToast('error', 'Ocurrió un error al cargar las imágenes');
      }
    });
  }

}