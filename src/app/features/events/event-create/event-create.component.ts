import { Component, OnInit, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { EventService } from '../../../core/services/event.service';
import { LocationService } from '../../../core/services/location.service';
import { UserService } from '../../../core/services/user.service';
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
    NzInputNumberModule 
  ],
  templateUrl: './event-create.component.html',
  styleUrl: './event-create.component.scss',
})
export class EventCreateComponent implements OnInit {
  private fb              = inject(FormBuilder);
  private eventService    = inject(EventService);
  private locationService = inject(LocationService);
  private userService     = inject(UserService);
  private router          = inject(Router);
  private message         = inject(NzMessageService);
  private cdr             = inject(ChangeDetectorRef);

  locations: Location[] = [];
  isSubmitting = false;
  hostId: number | null = null;

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

    this.userService.getMe().subscribe({
      next:  (user) => (this.hostId = user.id),
      error: () => this.message.warning('Nutzer konnte nicht geladen werden.'),
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

    const tzoffset = d.getTimezoneOffset() * 60000; // Offset in Millisekunden
    const localISOTime = new Date(d.getTime() - tzoffset).toISOString().slice(0, -1);

    this.eventService.create({
      title,
      description,
      date: localISOTime,
      hostId: this.hostId,
      locationId,
    }).pipe(
      finalize(() => {
        this.isSubmitting = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (event) => {
        this.message.success('Event erfolgreich erstellt!');
        this.router.navigate(['/events', event.id]);
      },
      error: (err) => {
        this.message.error(err?.error?.error ?? 'Fehler beim Erstellen. Bitte versuche es erneut.');
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
}