import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
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

@Component({
  selector: 'app-event-create',
  standalone: true,
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
  ],
  templateUrl: './event-create.component.html',
  styleUrl: './event-create.component.scss',
})
export class EventCreateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private eventService = inject(EventService);
  private locationService = inject(LocationService);
  private router = inject(Router);
  private message = inject(NzMessageService);

  locations: Location[] = [];
  isSubmitting = false;

  form: FormGroup = this.fb.group({
    title:       ['', [Validators.required]],
    description: [''],
    date:        [null, [Validators.required]],
    time:        [null],
    locationId:  [null, [Validators.required]],
  });

  ngOnInit(): void {
    this.locationService.getAll().subscribe({
      next: (locs) => (this.locations = locs),
      error: () => {
        this.locations = [
          { id: 1, name: 'Event Hall Neckarsulm', street: 'Hauptstrasse', houseNumber: '1', zipCode: '74172', city: 'Neckarsulm', capacity: 200 },
          { id: 2, name: 'Rooftop Heidelberg', street: 'Bergstrasse', houseNumber: '12', zipCode: '69117', city: 'Heidelberg', capacity: 80 },
        ];
      },
    });
  }

  disablePastDates = (current: Date): boolean => {
    return current < new Date(new Date().setHours(0, 0, 0, 0));
  };

  getControl(name: string) { return this.form.get(name); }

  submit(): void {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach((c) => {
        c.markAsDirty();
        c.updateValueAndValidity();
      });
      return;
    }

    this.isSubmitting = true;
    const { title, description, date, time, locationId } = this.form.value;

    const d = new Date(date);
    if (time) {
      d.setHours(new Date(time).getHours(), new Date(time).getMinutes());
    }

    this.eventService.create({
      title,
      description,
      date: d.toISOString(),
      hostId: 1, // TODO: AuthService
      locationId,
    }).subscribe({
      next: (event) => {
        this.message.success('Event erfolgreich erstellt!');
        this.router.navigate(['/events', event.id]);
      },
      error: () => {
        this.message.error('Fehler beim Erstellen. Bitte versuche es erneut.');
        this.isSubmitting = false;
      },
    });
  }
}