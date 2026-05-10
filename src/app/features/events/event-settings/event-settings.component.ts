import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { EventService } from '../../../core/services/event.service';
import { LocationService } from '../../../core/services/location.service';
import { UserService } from '../../../core/services/user.service';
import { InvitationService } from '../../../core/services/invitation.service';
import { User } from '../../../core/models/user.model';
import { Location } from '../../../core/models/location.model';

@Component({
  selector: 'app-event-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, NzButtonModule, NzDividerModule, NzSelectModule, NzIconModule],
  template: `
    <div class="settings-modal-content">
      <div class="setting-item-column">
        <div class="setting-info">
          <div class="setting-label">Datum & Uhrzeit</div>
          <div class="setting-desc">Wann findet das Event statt?</div>
        </div>
        <input type="datetime-local" class="custom-input" [ngModel]="getFormattedDate()" (ngModelChange)="onDateChange($event)" />
      </div>

      <nz-divider></nz-divider>

      <div class="setting-item-column">
        <div class="setting-info">
          <div class="setting-label">Ort</div>
          <div class="setting-desc">Wo findet das Event statt?</div>
        </div>
        
        @if (eventService.eventLocationId()) {
          <div class="location-display">
            {{ eventService.eventLocation() || ('Ort erfolgreich hinterlegt. (ID: ' + eventService.eventLocationId() + ')') }}
          </div>
          <button nz-button nzType="link" (click)="resetLocation()" style="color: #ff4d4f; padding-left: 0; align-self: flex-start;">Ort ändern / löschen</button>
        } @else {
          <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 8px;">
            <nz-select
              nzShowSearch
              nzAllowClear
              nzPlaceHolder="Bestehende Location auswählen"
              [(ngModel)]="selectedLocationId"
              (ngModelChange)="onSelectExistingLocation($event)"
              class="custom-select"
              style="flex: 1;"
            >
              @for (loc of existingLocations; track loc.id) {
                <nz-option [nzValue]="loc.id" [nzLabel]="loc.name + ' — ' + loc.city"></nz-option>
              }
            </nz-select>
            <button nz-button type="button" nzSize="large" (click)="toggleNewLocationForm()" title="Neue Location erstellen" style="background: #111118; border-color: rgba(201, 169, 110, 0.3); color: #c9a96e; border-radius: 8px; height: 40px; display: flex; align-items: center; justify-content: center;">
              <span nz-icon [nzType]="showNewLocationForm ? 'minus' : 'plus'"></span>
            </button>
          </div>

          @if (showNewLocationForm) {
            <div class="new-location-form">
              <input type="text" class="custom-input" style="margin-bottom: 8px;" placeholder="Name (z.B. Rooftop Bar)" [(ngModel)]="locName" />
              <input type="text" class="custom-input" style="margin-bottom: 8px;" placeholder="Straße" [(ngModel)]="locStreet" />
              <input type="text" class="custom-input" style="margin-bottom: 8px;" placeholder="Hausnummer" [(ngModel)]="locHouseNumber" />
              <input type="text" class="custom-input" style="margin-bottom: 8px;" placeholder="PLZ" [(ngModel)]="locZipCode" />
              <input type="text" class="custom-input" style="margin-bottom: 8px;" placeholder="Stadt" [(ngModel)]="locCity" />
              <input type="number" class="custom-input" style="margin-bottom: 8px;" placeholder="Kapazität" [(ngModel)]="locCapacity" />
              <button nz-button nzBlock class="btn-gold-outline" (click)="saveLocation()" [nzLoading]="isSavingLoc">Ort speichern</button>
            </div>
          }
        }
      </div>

      <nz-divider></nz-divider>

      <div class="setting-item-column">
        <div class="setting-info">
          <div class="setting-label">Mitglieder einladen</div>
          <div class="setting-desc">Lade Freunde und Gäste ein.</div>
        </div>
        
        @if (!eventService.currentEventId()) {
          <p style="color: #c9a96e; font-size: 13px; font-weight: 500;">Bitte veröffentliche das Event zuerst, um Gäste einzuladen.</p>
        } @else {
          <nz-select
            nzShowSearch
            nzAllowClear
            nzPlaceHolder="Benutzer auswählen"
            [(ngModel)]="selectedUserId"
            class="custom-select"
            style="width: 100%; margin-bottom: 8px;"
          >
            @for (user of users; track user.id) {
              <nz-option [nzValue]="user.id" [nzLabel]="user.firstName + ' ' + user.lastName"></nz-option>
            }
          </nz-select>
          <button nz-button nzBlock class="btn-gold-outline" (click)="inviteUser()" [nzLoading]="isInviting">Benutzer einladen</button>
        }
      </div>

      <nz-divider></nz-divider>

      <div class="danger-zone">
        <div class="danger-label">Gefahrenzone</div>
        <p class="danger-desc">Diese Aktionen können nicht rückgängig gemacht werden.</p>
        <button nz-button nzType="primary" nzDanger nzBlock (click)="onDelete()" style="border-radius: 8px; height: 40px; font-weight: 500;">Event löschen</button>
      </div>
    </div>
  `,
  styles: [`
    .settings-modal-content {
      padding: 10px 0;
    }
    .setting-item-column {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 16px;
    }
    .location-display {
      background: rgba(76, 175, 130, 0.1);
      border: 1px solid rgba(76, 175, 130, 0.3);
      color: #4caf82;
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
    }
    .new-location-form {
      display: flex;
      flex-direction: column;
      padding: 12px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      margin-bottom: 8px;
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
    .btn-danger-solid {
      background-color: #e86464;
      border-color: #e86464;
      color: #ffffff;
      border-radius: 8px;
    }
    .btn-danger-solid:hover {
      background-color: #ff4d4f;
      border-color: #ff4d4f;
      color: #ffffff;
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
    ::ng-deep .custom-select .ant-select-selector {
      background-color: #111118 !important;
      border: 1px solid rgba(201, 169, 110, 0.3) !important;
      color: #e8e4dc !important;
      border-radius: 8px !important;
      height: 40px !important;
      display: flex;
      align-items: center;
    }
    ::ng-deep .custom-select.ant-select-focused .ant-select-selector {
      border-color: #c9a96e !important;
      box-shadow: 0 0 0 2px rgba(201, 169, 110, 0.2) !important;
    }
    ::ng-deep .ant-select-dropdown {
      background-color: #1a1a22 !important;
      border: 1px solid rgba(201, 169, 110, 0.3) !important;
    }
    ::ng-deep .ant-select-item {
      color: #e8e4dc !important;
    }
    ::ng-deep .ant-select-item-option-active:not(.ant-select-item-option-disabled) {
      background-color: rgba(201, 169, 110, 0.1) !important;
    }
    ::ng-deep .ant-select-item-option-selected:not(.ant-select-item-option-disabled) {
      background-color: rgba(201, 169, 110, 0.2) !important;
      color: #c9a96e !important;
    }
    ::ng-deep .ant-empty-description {
      color: rgba(232,228,220,0.3) !important;
    }
  `]
})
export class EventSettingsComponent implements OnInit {
  private message = inject(NzMessageService);
  public eventService = inject(EventService);
  private locationService = inject(LocationService);
  private userService = inject(UserService);
  private invitationService = inject(InvitationService);

  // Location Form
  existingLocations: Location[] = [];
  selectedLocationId: number | null = null;
  showNewLocationForm = false;
  
  locName = '';
  locStreet = '';
  locHouseNumber = '';
  locZipCode = '';
  locCity = '';
  locCapacity: number | null = null;
  isSavingLoc = false;

  // Invite Form
  users: User[] = [];
  selectedUserId: number | null = null;
  isInviting = false;

  ngOnInit() {
    this.userService.getAll().subscribe({
      next: (users) => this.users = users,
      error: () => console.error('Could not fetch users')
    });
    
    this.locationService.getAll().subscribe({
      next: (locs) => this.existingLocations = locs,
      error: () => {
        // Fallback demo data
        this.existingLocations = [
          { id: 1, name: 'Event Hall Neckarsulm', street: 'Hauptstrasse', houseNumber: '1', zipCode: '74172', city: 'Neckarsulm', capacity: 200 },
          { id: 2, name: 'Rooftop Heidelberg',    street: 'Bergstrasse',  houseNumber: '12', zipCode: '69117', city: 'Heidelberg', capacity: 80  },
        ];
      }
    });
  }

  getFormattedDate(): string {
    const d = this.eventService.eventDate();
    if (!d) return '';
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

  toggleNewLocationForm() {
    this.showNewLocationForm = !this.showNewLocationForm;
    if (this.showNewLocationForm) {
      this.selectedLocationId = null;
    }
  }

  onSelectExistingLocation(locId: number | null) {
    if (locId) {
      const loc = this.existingLocations.find(l => l.id === locId);
      if (loc) {
        this.eventService.eventLocationId.set(loc.id);
        this.eventService.eventLocation.set(loc.name);
      }
    }
  }

  saveLocation() {
    if (!this.locName || !this.locStreet || !this.locCity) {
      this.message.error('Bitte fülle mindestens Name, Straße und Stadt aus.');
      return;
    }

    this.isSavingLoc = true;
    this.locationService.create({
      name: this.locName,
      street: this.locStreet,
      houseNumber: this.locHouseNumber,
      zipCode: this.locZipCode,
      city: this.locCity,
      capacity: this.locCapacity || 0
    }).subscribe({
      next: (loc) => {
        this.message.success('Ort erfolgreich gespeichert!');
        this.existingLocations.push(loc);
        this.eventService.eventLocationId.set(loc.id);
        this.eventService.eventLocation.set(loc.name);
        this.isSavingLoc = false;
        this.showNewLocationForm = false;
      },
      error: () => {
        // Mock successful save for demo if endpoint fails
        const mockLoc = {
          id: Math.floor(Math.random() * 1000) + 10,
          name: this.locName,
          street: this.locStreet,
          houseNumber: this.locHouseNumber,
          zipCode: this.locZipCode,
          city: this.locCity,
          capacity: this.locCapacity || 0
        };
        this.existingLocations.push(mockLoc);
        this.eventService.eventLocationId.set(mockLoc.id);
        this.eventService.eventLocation.set(mockLoc.name);
        this.message.success('Ort erfolgreich gespeichert!');
        this.isSavingLoc = false;
        this.showNewLocationForm = false;
      }
    });
  }

  resetLocation() {
    this.eventService.eventLocationId.set(null);
    this.eventService.eventLocation.set('');
    this.selectedLocationId = null;
  }

  inviteUser() {
    const eventId = this.eventService.currentEventId();
    if (!eventId) {
      this.message.error('Bitte veröffentliche das Event zuerst.');
      return;
    }
    if (!this.selectedUserId) {
      this.message.warning('Bitte wähle einen Benutzer aus.');
      return;
    }

    this.isInviting = true;
    this.invitationService.send({ eventId, guestId: this.selectedUserId }).subscribe({
      next: () => {
        this.message.success('Benutzer erfolgreich eingeladen!');
        this.selectedUserId = null;
        this.isInviting = false;
      },
      error: () => {
        this.message.error('Fehler beim Einladen des Benutzers.');
        this.isInviting = false;
      }
    });
  }

  private router = inject(Router);

  onDelete() {
    const eventId = this.eventService.currentEventId();
    if (!eventId) {
      this.message.warning('Dieses Event wurde noch nicht veröffentlicht.');
      return;
    }

    this.eventService.delete(eventId).subscribe({
      next: () => {
        this.message.success('Event erfolgreich gelöscht!');
        this.router.navigate(['/profile']);
      },
      error: () => {
        this.message.error('Fehler beim Löschen des Events.');
      }
    });
  }
}
