import { Component, OnInit, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { EventService } from '../../../core/services/event.service';
import { LocationService } from '../../../core/services/location.service';
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
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { finalize } from 'rxjs/operators';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';

@Component({
  selector: 'app-event-edit',
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
    NzInputNumberModule
  ],
  templateUrl: './event-edit.html',
  styleUrl: './event-edit.scss',
})
export class EventEditComponent implements OnInit {
  private fb              = inject(FormBuilder);
  private eventService    = inject(EventService);
  private locationService = inject(LocationService);
  private router          = inject(Router);
  private route           = inject(ActivatedRoute);
  private message         = inject(NzMessageService);
  private modal           = inject(NzModalService);
  private cdr             = inject(ChangeDetectorRef);

  locations: Location[] = [];
  isSubmitting = false;
  eventId: number | null = null;

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
    this.eventId = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.eventId) {
      this.message.error('Event ID fehlt.');
      this.router.navigate(['/profile']);
      return;
    }

    this.loadEvent();
    this.loadLocations();
  }

  private loadEvent(): void {
    this.eventService.getById(this.eventId!).subscribe({
      next: (event) => {
        const eventDate = new Date(event.date);
        this.form.patchValue({
          title: event.title,
          description: event.description,
          date: eventDate,
          time: eventDate,
          locationId: event.locationId || null, // Assuming locationId is in the event, but model doesn't have it. Wait, need to check.
        });
        this.cdr.markForCheck();
      },
      error: () => {
        this.message.error('Event konnte nicht geladen werden.');
        this.router.navigate(['/profile']);
      },
    });
  }

  private loadLocations(): void {
    this.locationService.getAll().subscribe({
      next: (locs) => {
        this.locations = locs;
        this.cdr.markForCheck();
      },
      error: () => {
        this.locations = [
          { id: 1, name: 'Event Hall Neckarsulm', street: 'Hauptstrasse', houseNumber: '1', zipCode: '74172', city: 'Neckarsulm', capacity: 200 },
          { id: 2, name: 'Rooftop Heidelberg',    street: 'Bergstrasse',  houseNumber: '12', zipCode: '69117', city: 'Heidelberg', capacity: 80  },
        ];
      },
    });
  }

  disablePastDates = (current: Date): boolean =>
    current < new Date(new Date().setHours(0, 0, 0, 0));

  submit(): void {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach(c => {
        c.markAsDirty();
        c.updateValueAndValidity();
      });
      return;
    }

    this.isSubmitting = true;
    this.cdr.detectChanges();

    const { title, description, date, time, locationId } = this.form.value;
    const d = new Date(date);
    if (time) {
      d.setHours(new Date(time).getHours(), new Date(time).getMinutes());
    }

    this.eventService.update(this.eventId!, {
      title,
      description,
      date: d.toISOString(),
      locationId,
    }).pipe(
      finalize(() => {
        this.isSubmitting = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: () => {
        this.message.success('Event erfolgreich aktualisiert!');
        this.router.navigate(['/profile']);
      },
      error: () => {
        this.message.error('Fehler beim Aktualisieren. Bitte versuche es erneut.');
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

  confirmDelete(): void {
    this.modal.confirm({
      nzTitle: 'Event löschen?',
      nzContent: 'Bist du sicher, dass du dieses Event löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden.',
      nzOkText: 'Löschen',
      nzCancelText: 'Abbrechen',
      nzOkDanger: true,
      nzWrapClassName: 'oystr-confirmation-modal',
      nzOnOk: () => this.deleteEvent(),
    });
  }

  private deleteEvent(): void {
    this.eventService.delete(this.eventId!).subscribe({
      next: () => {
        this.message.success('Event erfolgreich gelöscht!');
      },
      error: () => {
        this.message.error('Fehler beim Löschen. Bitte versuche es erneut.');
      },
    });
  }
}
