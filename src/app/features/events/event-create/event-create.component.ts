import { Component, OnInit, ChangeDetectionStrategy, inject, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LocationService } from '../../../core/services/location.service';
import { UserService } from '../../../core/services/user.service';
import { Location } from '../../../core/models/location.model';
import { HeaderComponent } from '../../../shared/header/header.component';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { EventService } from '../../../core/services/event.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { finalize } from 'rxjs/operators';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { EventBuilder } from '../event-builder/event-builder';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { LayoutService } from '../../../core/services/layout.service';
import { EventSettingsComponent } from '../event-settings/event-settings.component';

@Component({
  selector: 'app-event-create',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzIconModule,
    NzModalModule,
    NzSwitchModule,
    EventBuilder,
    NzInputNumberModule,
    NzSkeletonModule,
  ],
  templateUrl: './event-create.component.html',
  styleUrl: './event-create.component.scss',
})
export class EventCreateComponent implements OnInit, OnDestroy {

  @ViewChild(EventBuilder) eventBuilder!: EventBuilder;

  private fb              = inject(FormBuilder);
  private route           = inject(ActivatedRoute);
  private eventService    = inject(EventService);
  private locationService = inject(LocationService);
  private userService     = inject(UserService);
  private layoutService = inject(LayoutService)
  private router          = inject(Router);
  private message         = inject(NzMessageService);
  private cdr             = inject(ChangeDetectorRef);
  private modal = inject(NzModalService);
  private subs = new Subscription();

  locations: Location[] = [];
  eventId: number | null = null;
  isEditMode = false;
  isInitialLoading = false;
  hostId: number | null = null;
  private pendingEvent: Event | null = null;


  ngOnInit() {
    this.eventService.resetBuilder();
    this.subs.add(this.layoutService.settingsRequested$.subscribe(() => this.showSettings()));
    this.subs.add(this.layoutService.templatesRequested$.subscribe(() => this.showTemplates()));
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
  disablePastDates = (current: Date): boolean =>
    current < new Date(new Date().setHours(0, 0, 0, 0));

  protected getEyebrow(): string {
    return this.isEditMode ? 'Event bearbeiten' : 'Neues Event';
  }

  protected getPageTitle(): string {
    return this.isEditMode ? 'Passe dein Event an' : 'Was planst du?';
  }

  protected getSubmitLabel(): string {
    return this.isEditMode ? 'Event speichern →' : 'Event erstellen →';
  }

  protected navigateBack(domEvent?: MouseEvent): void {
    domEvent?.preventDefault();

    if (this.isEditMode && this.eventId !== null) {
      this.router.navigate(['/events', this.eventId], {
        state: this.pendingEvent ? { event: this.pendingEvent } : undefined,
      });
      return;
    }

    this.router.navigate(['/']);
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

  deleteEvent(): void {
    this.message.warning('Event löschen ist noch nicht implementiert.');
  }


}
