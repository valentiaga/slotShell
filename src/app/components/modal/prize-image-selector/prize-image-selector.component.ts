import { Component, EventEmitter, Input, Output, Signal } from '@angular/core';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { CloudinaryImage } from '../../../interfaces/image';

@Component({
  selector: 'app-prize-image-selector',
  standalone: true,
  imports: [NgIf, NgFor, NgClass],
  templateUrl: './prize-image-selector.component.html',
  styleUrl: './prize-image-selector.component.css'
})
export class PrizeImageSelectorComponent {
  @Input() images: CloudinaryImage[] = [];
  @Input() selectedUrl: string = '';
  @Input() selectedImageName: string = '';
  @Input() existingPrizes: any[] = [];
  @Input() isUploadingImage!: Signal<boolean>;

  @Output() refresh = new EventEmitter<void>();
  @Output() upload = new EventEmitter<void>();
  @Output() clearSelection = new EventEmitter<void>();
  @Output() toggleImageSelection = new EventEmitter<CloudinaryImage>();
  @Output() deleteImageRequested = new EventEmitter<CloudinaryImage>();

  isImageInUse(image: CloudinaryImage): boolean {
    if (!image?.url_img) {
      return false;
    }
    return (this.existingPrizes || []).some((p) => p?.display === image.url_img);
  }

  requestDeleteImage(image: CloudinaryImage, event: MouseEvent): void {
    event.stopPropagation();
    this.deleteImageRequested.emit(image);
  }
}
