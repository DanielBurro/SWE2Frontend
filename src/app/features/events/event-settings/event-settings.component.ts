import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzMessageService } from 'ng-zorro-antd/message';
import { EventService } from '../../../core/services/event.service';

@Component({
  selector: 'app-event-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, NzSwitchModule, NzButtonModule, NzDividerModule],
  template: `
    <div class="settings-modal-content">
      <div class="setting-item-column">
        <div class="setting-info">
          <div class="setting-label">Datum & Uhrzeit</div>
          <div class="setting-desc">Wann findet das Event statt?</div>
        </div>
        <input type="datetime-local" class="custom-input" [ngModel]="getFormattedDate()" (ngModelChange)="onDateChange($event)" />
      </div>

      <div class="setting-item-column">
        <div class="setting-info">
          <div class="setting-label">Ort</div>
          <div class="setting-desc">Wo findet das Event statt?</div>
        </div>
        <input type="text" class="custom-input" placeholder="Z.B. Berlin, Musterstraße 1" [ngModel]="eventService.eventLocation()" (ngModelChange)="eventService.eventLocation.set($event)" />
      </div>

      <nz-divider></nz-divider>

      <div class="setting-item">
        <div class="setting-info">
          <div class="setting-label">Sichtbarkeit</div>
          <div class="setting-desc">Bestimme, wer dein Event sehen kann.</div>
        </div>
        <nz-switch nzCheckedChildren="Öffentlich" nzUnCheckedChildren="Privat"></nz-switch>
      </div>

      <div class="setting-item">
        <div class="setting-info">
          <div class="setting-label">Mitglieder verwalten</div>
          <div class="setting-desc">Lade Freunde und Gäste ein.</div>
        </div>
        <button nz-button nzBlock class="btn-gold-outline">Mitglieder einladen</button>
      </div>

      <nz-divider></nz-divider>

      <div class="danger-zone">
        <div class="danger-label">Gefahrenzone</div>
        <p class="danger-desc">Diese Aktionen können nicht rückgängig gemacht werden.</p>
        <button nz-button nzDanger nzBlock (click)="onDelete()">Event löschen</button>
      </div>
    </div>
  `,
  styles: [`
    .settings-modal-content {
      padding: 10px 0;
    }
    .setting-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    .setting-item-column {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 24px;
    }
    .custom-input {
      background: #111118;
      border: 1px solid rgba(201, 169, 110, 0.3);
      color: #e8e4dc;
      padding: 8px 12px;
      border-radius: 8px;
      font-family: inherit;
      width: 100%;
      box-sizing: border-box;
      outline: none;
      transition: border-color 0.2s;
    }
    .custom-input:focus {
      border-color: #c9a96e;
    }
    .custom-input[type="datetime-local"]::-webkit-calendar-picker-indicator {
      filter: invert(1);
      cursor: pointer;
    }
    .setting-label {
      font-weight: 600;
      font-size: 16px;
      color: #e8e4dc;
    }
    .setting-desc {
      color: rgba(232, 228, 220, 0.5);
      font-size: 13px;
    }
    .btn-gold-outline {
      border-color: #c9a96e;
      color: #c9a96e;
      background: transparent;
      &:hover {
        background: rgba(201, 169, 110, 0.1);
        border-color: #d4b87a;
        color: #d4b87a;
      }
    }
    .danger-zone {
      margin-top: 10px;
    }
    .danger-label {
      color: #ff4d4f;
      font-weight: 600;
      font-size: 16px;
      margin-bottom: 4px;
    }
    .danger-desc {
      color: rgba(232, 228, 220, 0.5);
      font-size: 12px;
      margin-bottom: 12px;
    }
  `]
})
export class EventSettingsComponent {
  private message = inject(NzMessageService);
  public eventService = inject(EventService);

  getFormattedDate(): string {
    const d = this.eventService.eventDate();
    if (!d) return '';
    // Format to YYYY-MM-DDTHH:mm
    const tzOffset = d.getTimezoneOffset() * 60000;

    return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
  }

  onDateChange(val: string) {
    if (val) {
      this.eventService.eventDate.set(new Date(val));
    } else {
      this.eventService.eventDate.set(null);
    }
  }

  onDelete() {
    this.message.warning('Löschen-Funktion kommt bald.');
  }
}
