import { Component, OnInit, ChangeDetectionStrategy, inject, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { EventBuilder } from '../event-builder/event-builder';
import { EventService } from '../../../core/services/event.service';
import { LayoutService } from '../../../core/services/layout.service';
import { Subscription } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { EventSettingsComponent } from '../event-settings/event-settings.component';

@Component({
  selector: 'app-event-edit',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    NzButtonModule,
    NzIconModule,
    NzModalModule,
    EventBuilder,
  ],
  templateUrl: './event-edit.html',
  styleUrl: './event-edit.scss',
})
export class EventEditComponent implements OnInit, OnDestroy {
  @ViewChild(EventBuilder) eventBuilder!: EventBuilder;

  private modal = inject(NzModalService);
  private message = inject(NzMessageService);
  private layoutService = inject(LayoutService);
  private eventService = inject(EventService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  private subs = new Subscription();
  eventId: number | null = null;

  ngOnInit() {
    this.eventId = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.eventId) {
      this.message.error('Event ID fehlt.');
      this.router.navigate(['/profile']);
      return;
    }

    this.loadEvent();

    this.subs.add(this.layoutService.settingsRequested$.subscribe(() => this.showSettings()));
    this.subs.add(this.layoutService.templatesRequested$.subscribe(() => this.showTemplates()));
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  private loadEvent(): void {
    this.eventService.getById(this.eventId!).subscribe({
      next: (event) => {
        console.log('Event Edit - Loaded Data:', event);
        this.eventService.currentEventId.set(event.id);
        this.eventService.eventTitle.set(event.title);
        
        if (event.date) {
            this.eventService.eventDate.set(new Date(event.date));
        } else {
            this.eventService.eventDate.set(null);
        }

        if (event.locationId) {
            this.eventService.eventLocationId.set(event.locationId);
            this.eventService.eventLocation.set(event.locationName);
        }

        if (event.description) {
            try {
                const parsed = JSON.parse(event.description);
                this.eventService.eventContent.set(parsed);
            } catch(e) {
                console.warn('Event Edit - Failed to parse description JSON, using fallback', e);
                // Legacy / Fallback
                this.eventService.eventContent.set({
                    time: new Date().getTime(),
                    blocks: [
                      {
                        type: "paragraph",
                        data: {
                          text: event.description || ''
                        }
                      }
                    ],
                    version: "2.30.2"
                });
            }
        }
        
        this.cdr.markForCheck();
      },
      error: () => {
        this.message.error('Event konnte nicht geladen werden.');
        this.router.navigate(['/profile']);
      },
    });
  }

  showPreview(): void {
    if (this.eventBuilder) {
      this.eventBuilder.onPreview();
    }
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
}