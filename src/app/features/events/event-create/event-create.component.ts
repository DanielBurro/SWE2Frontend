import { Component, OnInit, ChangeDetectionStrategy, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { EventBuilder } from '../event-builder/event-builder';
import { EventService } from '../../../core/services/event.service';
import { LayoutService } from '../../../core/services/layout.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { EventPreviewComponent } from '../event-preview/event-preview.component';
import { EventSettingsComponent } from '../event-settings/event-settings.component';

@Component({
  selector: 'app-event-create',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzButtonModule,
    NzIconModule,
    NzModalModule,
    NzSwitchModule,
    EventBuilder,
  ],
  templateUrl: './event-create.component.html',
  styleUrl: './event-create.component.scss',
})
export class EventCreateComponent implements OnInit, OnDestroy {
  private modal = inject(NzModalService);
  private message = inject(NzMessageService);
  private layoutService = inject(LayoutService);
  private router = inject(Router);

  private subs = new Subscription();

  ngOnInit() {
    this.subs.add(this.layoutService.settingsRequested$.subscribe(() => this.showSettings()));
    this.subs.add(this.layoutService.templatesRequested$.subscribe(() => this.showTemplates()));
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  showPreview(): void {
    this.modal.create({
      nzTitle: undefined,
      nzContent: EventPreviewComponent,
      nzFooter: null,
      nzWidth: '1000px',
      nzCentered: true,
      nzClassName: 'preview-modal-wrap dark-modal',
      nzStyle: { top: '20px' }
    });
  }

  showSettings(): void {
    this.modal.create({
      nzTitle: 'Event Einstellungen',
      nzContent: EventSettingsComponent,
      nzFooter: null,
      nzCentered: true,
      nzClassName: 'dark-modal'
    });
  }

  showTemplates(): void {
    this.router.navigate(['/events/templates']);
  }

  deleteEvent(): void {
    this.message.warning('Event löschen ist noch nicht implementiert.');
  }
}
