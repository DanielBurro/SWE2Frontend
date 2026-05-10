import { Component,  inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventService } from '../../../core/services/event.service';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-event-preview',
  standalone: true,
  imports: [CommonModule, NzIconModule],
  template: `
    <div class="preview-container">
      <div class="preview-badge">VORSCHAU-MODUS</div>

      <div class="preview-content">
        <h1 class="preview-title">{{ eventService.eventTitle() || 'Unbenanntes Event' }}</h1>

        <div class="preview-list">
          @for (element of eventService.builderElements(); track element.id) {
            <div class="preview-element">
              @switch (element.type) {
                @case ('text') { <p class="text-view">{{ element.data.text }}</p> }
                @case ('heading') {
                  @if (element.data.level === 1) { <h1>{{ element.data.text }}</h1> }
                  @else if (element.data.level === 2) { <h2>{{ element.data.text }}</h2> }
                  @else { <h3>{{ element.data.text }}</h3> }
                }
                @case ('image') {
                  @if (element.data.url) {
                    <img [src]="element.data.url" class="image-view"  alt="image"/>
                  } @else {
                    <div class="image-placeholder-view">Kein Bild ausgewählt</div>
                  }
                }
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .preview-container {
      background: #fff;
      color: #333;
      min-height: 500px;
      padding: 40px;
      border-radius: 8px;
      position: relative;
    }

    .preview-badge {
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      background: #ff4d4f;
      color: #fff;
      padding: 4px 12px;
      font-size: 10px;
      font-weight: 800;
      border-radius: 0 0 8px 8px;
      letter-spacing: 1px;
    }

    .preview-title {
      font-size: 3rem;
      font-weight: 800;
      margin-bottom: 40px;
      text-align: center;
    }

    .preview-list {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .preview-element {
      min-height: 20px;
    }

    .text-view {
      font-size: 16px;
      line-height: 1.6;
      white-space: pre-wrap;
    }

    .image-view {
      width: 100%;
      border-radius: 12px;
      display: block;
    }

    .image-placeholder-view {
      height: 100px;
      background: #f0f0f0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #999;
      border-radius: 12px;
    }
  `]
})
export class EventPreviewComponent {
  public eventService = inject(EventService);
}
