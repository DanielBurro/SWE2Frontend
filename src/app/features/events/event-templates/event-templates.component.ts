import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventService } from '../../../core/services/event.service';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-event-templates',
  standalone: true,
  imports: [CommonModule, NzIconModule],
  template: `
    <div class="templates-grid">
      @for (template of templates; track template.id) {
        <div class="template-card">
          <div class="template-preview">
            <span nz-icon [nzType]="template.icon" class="template-icon"></span>
          </div>
          <div class="template-info">
            <div class="template-name">{{ template.name }}</div>
            <button class="btn-select" (click)="selectTemplate(template)">Auswählen</button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .templates-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      padding: 10px 0;
    }
    .template-card {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(201, 169, 110, 0.15);
      border-radius: 12px;
      overflow: hidden;
      transition: all 0.3s;
      &:hover {
        border-color: #c9a96e;
        transform: translateY(-4px);
      }
    }
    .template-preview {
      height: 120px;
      background: rgba(201, 169, 110, 0.05);
      display: flex;
      align-items: center;
      justify-content: center;
      .template-icon {
        font-size: 40px;
        color: #c9a96e;
      }
    }
    .template-info {
      padding: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .template-name {
      color: #e8e4dc;
      font-weight: 600;
    }
    .btn-select {
      background: transparent;
      border: 1px solid #c9a96e;
      color: #c9a96e;
      padding: 4px 12px;
      border-radius: 6px;
      font-size: 12px;
      cursor: pointer;
      &:hover {
        background: #c9a96e;
        color: #0a0a0f;
      }
    }
  `]
})
export class EventTemplatesComponent {
  private eventService = inject(EventService);
  private modal = inject(NzModalService);

  templates = [
    { id: 'birthday', name: 'Geburtstag', icon: 'gift' },
    { id: 'wedding', name: 'Hochzeit', icon: 'heart' },
    { id: 'party', name: 'Party', icon: 'customer-service' },
    { id: 'dinner', name: 'Dinner', icon: 'coffee' }
  ];

  selectTemplate(template: any) {
    this.modal.confirm({
      nzTitle: 'Template anwenden?',
      nzContent: 'Dein aktuelles Layout wird dabei überschrieben.',
      nzOkText: 'Ja, überschreiben',
      nzCancelText: 'Abbrechen',
      nzOnOk: () => {
        this.eventService.applyTemplate(template.id);
      }
    });
  }
}
