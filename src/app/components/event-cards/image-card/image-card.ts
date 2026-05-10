import { Component, EventEmitter, Input, Output, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-image-card',
  standalone: true,
  imports: [CommonModule, NzIconModule],
  template: `
    <div class="image-card-container" [class.has-image]="url" [class.is-loading]="isLoading">
      @if (!url && !isLoading) {
        <div class="image-placeholder" (click)="triggerUpload()">
          <div class="placeholder-content">
            <span nz-icon nzType="picture" class="placeholder-icon"></span>
            <span class="placeholder-text">Bild hinzufügen</span>
          </div>
        </div>
      } @else if (isLoading) {
        <div class="loading-state">
          <span nz-icon nzType="loading" class="loading-icon"></span>
        </div>
      } @else {
        <div class="image-wrapper">
          <img [src]="url" alt="Event Image" class="event-image" (load)="onImageLoad()" />
          <div class="image-overlay">
            <button class="btn-change-image" (click)="triggerUpload()">
              <span nz-icon nzType="edit"></span>
              Bild ändern
            </button>
          </div>
        </div>
      }
      <input type="file" #fileInput (change)="onFileSelected($event)" style="display: none" accept="image/*" />
    </div>
  `,
  styles: [`
    .image-card-container {
      width: 100%;
      height: 100%;
      min-height: 200px;
      background: rgba(201, 169, 110, 0.03);
      border-radius: 8px;
      overflow: hidden;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      border: 1px dashed rgba(201, 169, 110, 0.15);

      &:hover {
        background: rgba(201, 169, 110, 0.06);
        border-color: rgba(201, 169, 110, 0.3);
      }

      &.has-image {
        background: transparent;
        border: none;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
      }

      &.is-loading {
        background: rgba(201, 169, 110, 0.05);
      }
    }

    .image-placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      cursor: pointer;
      color: rgba(232, 228, 220, 0.4);

      .placeholder-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        transition: transform 0.3s ease;
      }

      &:hover .placeholder-content {
        transform: scale(1.05);
        color: #c9a96e;
      }

      .placeholder-icon {
        font-size: 40px;
        margin-bottom: 12px;
        opacity: 0.6;
      }

      .placeholder-text {
        font-size: 14px;
        font-weight: 500;
        letter-spacing: 0.5px;
      }
    }

    .loading-state {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #c9a96e;

      .loading-icon {
        font-size: 32px;
      }
    }

    .image-wrapper {
      width: 100%;
      height: 100%;
      position: relative;
      opacity: 0;
      animation: fadeIn 0.6s forwards;

      &:hover .image-overlay {
        opacity: 1;
      }
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: scale(0.98); }
      to { opacity: 1; transform: scale(1); }
    }

    .event-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      border-radius: 8px;
    }

    .image-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s ease;
      backdrop-filter: blur(2px);
    }

    .btn-change-image {
      background: #c9a96e;
      color: #0a0a0f;
      border: none;
      padding: 10px 20px;
      border-radius: 20px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.4);
      transform: translateY(10px);
      transition: all 0.3s ease;

      &:hover {
        background: #d4b87a;
        transform: translateY(0) scale(1.05);
      }
    }

    .image-wrapper:hover .btn-change-image {
      transform: translateY(0);
    }
  `]
})
export class ImageCard {
  @Input() url: string = '';
  @Output() urlChange = new EventEmitter<string>();

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  isLoading = false;

  triggerUpload() {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.isLoading = true;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.url = e.target.result as string;
        this.urlChange.emit(this.url);
        // isLoading is set to false in onImageLoad
      };
      reader.readAsDataURL(file);
    }
  }

  onImageLoad() {
    this.isLoading = false;
  }
}
