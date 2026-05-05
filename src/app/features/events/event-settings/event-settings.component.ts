import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-event-settings',
  standalone: true,
  imports: [CommonModule, NzSwitchModule, NzButtonModule, NzDividerModule],
  template: `
    <div class="settings-modal-content">
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

  onDelete() {
    this.message.warning('Löschen-Funktion kommt bald.');
  }
}
