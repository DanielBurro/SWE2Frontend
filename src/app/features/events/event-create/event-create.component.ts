import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { EventService } from '../../../core/services/event.service';
import { LocationService } from '../../../core/services/location.service';
import { Location } from '../../../core/models/location.model';
import { HeaderComponent } from '../../../shared/header/header.component';

@Component({
  selector: 'app-event-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, HeaderComponent],
  templateUrl: './event-create.component.html',
  styleUrl: './event-create.component.scss',
})
export class EventCreateComponent implements OnInit {
  private eventService = inject(EventService);
  private locationService = inject(LocationService);
  private router = inject(Router);

  locations: Location[] = [];
  isSubmitting = false;
  error = '';

  form = {
    title: '',
    description: '',
    date: '',
    time: '',
    hostId: 1,
    locationId: 0,
  };

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

  submit(): void {
    if (!this.form.title || !this.form.date || !this.form.locationId) {
      this.error = 'Bitte fuelle alle Pflichtfelder aus.';
      return;
    }
    this.isSubmitting = true;
    this.error = '';

    const dateTime = `${this.form.date}T${this.form.time || '18:00'}:00.000Z`;

    this.eventService.create({
      title: this.form.title,
      description: this.form.description,
      date: dateTime,
      hostId: this.form.hostId,
      locationId: this.form.locationId,
    }).subscribe({
      next: (event) => this.router.navigate(['/events', event.id]),
      error: () => {
        this.error = 'Fehler beim Erstellen. Bitte versuche es erneut.';
        this.isSubmitting = false;
      },
    });
  }
}