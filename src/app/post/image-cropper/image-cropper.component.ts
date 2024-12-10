import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ImageCroppedEvent,
  ImageCropperComponent as ImageCropper,
} from 'ngx-image-cropper';

@Component({
  selector: 'app-image-cropper',
  standalone: true,
  templateUrl: './image-cropper.component.html',
  styleUrls: ['./image-cropper.component.css'],
  imports: [CommonModule, ImageCropper],
})
export class ImageCropperComponent {
  @Input() imageChangedEvent: Event | null = null;
  @Output() imageCropped = new EventEmitter<string>();
  @Output() cropCancelled = new EventEmitter<void>();
  @Output() cropSaved = new EventEmitter<void>();
  croppedImage: string | undefined = undefined;

  format = 'png';
  maintainAspectRatio = true;
  aspectRatio = 1;
  resizeToWidth = 256;
  roundCropper = false;
  showCropperCross = true;
  canvasRotation = 0;

  onImageCropped(event: ImageCroppedEvent): void {
    if (event.base64) {
      this.croppedImage = event.base64;
    } else if (event.blob) {
      this.convertBlobToBase64(event.blob)
        .then((base64) => {
          this.croppedImage = base64;
        })
        .catch((error) => {
          console.error('Failed to convert blob to base64:', error);
        });
    } else {
      console.warn('No base64 image available');
    }
  }

  saveCroppedImage(): void {
    if (!this.croppedImage) {
      console.warn('No cropped image available');
      return;
    }
    this.imageCropped.emit(this.croppedImage);
    this.cropSaved.emit();
  }

  cancelCropper(): void {
    this.cropCancelled.emit();
  }

  private convertBlobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}
