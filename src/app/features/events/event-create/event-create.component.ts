import { Component, OnInit, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EventService } from '../../../core/services/event.service';
import { LocationService } from '../../../core/services/location.service';
import { UserService } from '../../../core/services/user.service';
import { Event } from '../../../core/models/event.model';
import { Location } from '../../../core/models/location.model';
import { HeaderComponent } from '../../../shared/header/header.component';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzTimePickerModule } from 'ng-zorro-antd/time-picker';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { timeout } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { ArrowLeftOutline, PlusOutline } from '@ant-design/icons-angular/icons';
import { provideNzIcons } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-event-create',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    HeaderComponent,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzIconModule,
    NzSelectModule,
    NzDatePickerModule,
    NzTimePickerModule,
    NzDividerModule,
    NzModalModule,
    NzInputNumberModule,
    NzSkeletonModule,
  ],
  templateUrl: './event-create.component.html',
  styleUrl: './event-create.component.scss',
})
export class EventCreateComponent implements OnInit {
  private fb              = inject(FormBuilder);
  private route           = inject(ActivatedRoute);
  private eventService    = inject(EventService);
  private locationService = inject(LocationService);
  private userService     = inject(UserService);
  private router          = inject(Router);
  private message         = inject(NzMessageService);
  private cdr             = inject(ChangeDetectorRef);

  locations: Location[] = [];
  eventId: number | null = null;
  isEditMode = false;
  isInitialLoading = false;
  isSubmitting = false;
  hostId: number | null = null;
  private pendingEvent: Event | null = null;

  // Modal
  showLocationModal = false;
  isCreatingLocation = false;
  locationForm: FormGroup = this.fb.group({
    name:        ['', Validators.required],
    street:      ['', Validators.required],
    houseNumber: ['', Validators.required],
    zipCode:     ['', Validators.required],
    city:        ['', Validators.required],
    capacity:    [1, [Validators.required, Validators.min(1)]],
  });

  form: FormGroup = this.fb.group({
    title:       ['', [Validators.required]],
    description: [''],
    date:        [null, [Validators.required]],
    time:        [null],
    locationId:  [null, [Validators.required]],
  });

  ngOnInit(): void {
    const routeEventIdParam = this.route.snapshot.paramMap.get('id');
    const routeEventId =
      routeEventIdParam !== null ? Number(routeEventIdParam) : null;
    this.isEditMode =
      routeEventId !== null && Number.isInteger(routeEventId) && routeEventId > 0;
    this.eventId = this.isEditMode ? routeEventId : null;

    if (this.eventId !== null) {
      const eventFromNavigation = this.getNavigationEvent(this.eventId);
      if (eventFromNavigation) {
        this.applyEventToForm(eventFromNavigation);
      } else {
        this.isInitialLoading = true;
      }

      this.loadEventForEdit(this.eventId);
    }

    this.locationService.getAll().subscribe({
      next: (locs) => {
        this.locations = locs;
        this.syncLocationSelection();
        this.cdr.markForCheck(); 
      },
      error: () => {
        this.locations = [
          { id: 1, name: 'Event Hall Neckarsulm', street: 'Hauptstrasse', houseNumber: '1', zipCode: '74172', city: 'Neckarsulm', capacity: 200 },
          { id: 2, name: 'Rooftop Heidelberg',    street: 'Bergstrasse',  houseNumber: '12', zipCode: '69117', city: 'Heidelberg', capacity: 80  },
        ];
        this.syncLocationSelection();
        this.cdr.markForCheck();
      },
    });

    this.userService.getMe().subscribe({
      next:  (user) => (this.hostId = user.id),
      error: () => this.message.warning('Nutzer konnte nicht geladen werden.'),
    });
  }

  disablePastDates = (current: Date): boolean =>
    current < new Date(new Date().setHours(0, 0, 0, 0));

  protected getBackRoute(): Array<string | number> {
    return this.isEditMode && this.eventId !== null ? ['/events', this.eventId] : ['/'];
  }

  protected getEyebrow(): string {
    return this.isEditMode ? 'Event bearbeiten' : 'Neues Event';
  }

  protected getPageTitle(): string {
    return this.isEditMode ? 'Passe dein Event an' : 'Was planst du?';
  }

  protected getSubmitLabel(): string {
    return this.isEditMode ? 'Event speichern →' : 'Event erstellen →';
  }

  submit(): void {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach(c => {
        c.markAsDirty();
        c.updateValueAndValidity();
      });
      return;
    }

    if (!this.hostId) {
      this.message.error('Nutzer nicht geladen. Bitte Seite neu laden.');
      return;
    }

    this.isSubmitting = true;
    this.cdr.detectChanges();  // ← NG0100 Fix

    const { title, description, date, time, locationId } = this.form.value;
    const d = new Date(date);
    if (time) {
      d.setHours(new Date(time).getHours(), new Date(time).getMinutes());
    }

    const payload = {
      title,
      description,
      date: d.toISOString(),
      hostId: this.hostId,
      locationId,
    };

    const request$ =
      this.isEditMode && this.eventId !== null
        ? this.eventService.update(this.eventId, payload)
        : this.eventService.create(payload);

    request$
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (event) => {
          this.message.success(
            this.isEditMode
              ? 'Event erfolgreich aktualisiert!'
              : 'Event erfolgreich erstellt!',
          );
          this.router.navigate(['/events', event.id], { state: { event } });
        },
        error: () => {
          this.message.error(
            this.isEditMode
              ? 'Fehler beim Aktualisieren. Bitte versuche es erneut.'
              : 'Fehler beim Erstellen. Bitte versuche es erneut.',
          );
        },
      });
  }

  // ── Location Modal ────────────────────────────────────────────
  openLocationModal(): void {
    this.locationForm.reset();
    this.showLocationModal = true;
  }

  cancelLocationModal(): void {
    this.showLocationModal = false;
  }

  submitLocation(): void {
    if (this.locationForm.invalid) {
      Object.values(this.locationForm.controls).forEach(c => {
        c.markAsDirty();
        c.updateValueAndValidity();
      });
      return;
    }

    this.isCreatingLocation = true;
    this.locationService.create(this.locationForm.value).pipe(
      finalize(() => (this.isCreatingLocation = false))
    ).subscribe({
      next: (loc) => {
        this.locations = [...this.locations, loc];
        this.form.patchValue({ locationId: loc.id });
        this.showLocationModal = false;
        this.message.success(`Location „${loc.name}" erstellt!`);
      },
      error: () => this.message.error('Location konnte nicht erstellt werden.'),
    });
  }

  private loadEventForEdit(eventId: number): void {
    this.eventService
      .getById(eventId)
      .pipe(timeout(8000))
      .subscribe({
        next: (event) => {
          this.applyEventToForm(event);
          this.isInitialLoading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.isInitialLoading = false;
          this.cdr.markForCheck();

          if (!this.pendingEvent) {
            this.message.error('Event konnte nicht geladen werden.');
            this.router.navigate(['/events', eventId]);
          }
        },
      });
  }

  private applyEventToForm(event: Event): void {
    this.pendingEvent = event;

    if (event.hostId !== undefined) {
      this.hostId = event.hostId;
    }

    const eventDate = new Date(event.date);
    this.form.patchValue({
      title: event.title,
      description: event.description || '',
      date: eventDate,
      time: eventDate,
      locationId: this.resolveLocationId(event),
    });
  }

  private syncLocationSelection(): void {
    if (!this.pendingEvent) {
      return;
    }

    const locationId = this.resolveLocationId(this.pendingEvent);
    if (locationId && this.form.value.locationId !== locationId) {
      this.form.patchValue({ locationId });
    }
  }

  private resolveLocationId(event: Event): number | null {
    if (event.locationId !== undefined) {
      return event.locationId;
    }

    const matchingLocation = this.locations.find(
      (location) => this.normalize(location.name) === this.normalize(event.locationName),
    );

    return matchingLocation?.id ?? null;
  }

  private getNavigationEvent(id: number): Event | null {
    const stateEvent = history.state?.event;
    if (!stateEvent || typeof stateEvent !== 'object') {
      return null;
    }

    return Number(stateEvent.id) === id ? (stateEvent as Event) : null;
  }

  private normalize(value: string | null | undefined): string {
    return value?.trim().toLowerCase() ?? '';
  }
}
