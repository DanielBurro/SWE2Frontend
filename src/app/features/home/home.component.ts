import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EventService } from '../../core/services/event.service';
import { Event } from '../../core/models/event.model';
import { HeaderComponent } from '../../shared/header/header.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, HeaderComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  private eventService = inject(EventService);

  events: Event[] = [];
  filteredEvents: Event[] = [];
  activeTab = 'alle';
  isLoading = true;

  tabs = [
    { key: 'alle', label: 'Alle' },
    { key: 'offen', label: 'Offen' },
    { key: 'geplant', label: 'Geplant' },
  ];

  ngOnInit(): void {
    this.eventService.getAll().subscribe({
      next: (events) => {
        this.events = events;
        this.filteredEvents = events;
        this.isLoading = false;
      },
      error: () => {
        this.events = this.getDemoEvents();
        this.filteredEvents = this.events;
        this.isLoading = false;
      },
    });
  }

  setTab(tab: string): void {
    this.activeTab = tab;
    this.filteredEvents =
      tab === 'alle'
        ? this.events
        : this.events.filter((e) => e.status.toLowerCase() === tab);
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('de-DE', {
      day: 'numeric',
      month: 'short',
    });
  }

  getGradient(index: number): string {
    const gradients = [
      'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      'linear-gradient(135deg, #0d1f12 0%, #1a3a24 50%, #2d5a3d 100%)',
      'linear-gradient(135deg, #1f0d0d 0%, #3a1a1a 50%, #5a2d2d 100%)',
      'linear-gradient(135deg, #1a1a0d 0%, #2e2e0d 50%, #4a4a1a 100%)',
    ];
    return gradients[index % gradients.length];
  }

  getAvatarStyle(index: number): string {
    const colors = [
      { bg: 'rgba(201,169,110,0.15)', text: '#c9a96e' },
      { bg: 'rgba(76,175,130,0.15)', text: '#4caf82' },
      { bg: 'rgba(201,90,110,0.15)', text: '#c95a6e' },
      { bg: 'rgba(90,130,201,0.15)', text: '#5a82c9' },
    ];
    const c = colors[index % colors.length];
    return `background:${c.bg};color:${c.text}`;
  }

  getInitials(name: string): string {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  }

  private getDemoEvents(): Event[] {
    return [
      { id: 1, title: 'Rooftop Vernissage — Frühjahr 2026', description: '', date: '2026-04-12T18:00:00Z', status: 'offen', hostName: 'Laura Huber', locationName: 'Heidelberg' },
      { id: 2, title: 'Gartenparty im Weinberg', description: '', date: '2026-04-19T15:00:00Z', status: 'geplant', hostName: 'Thomas Maier', locationName: 'Heilbronn' },
      { id: 3, title: 'Firmen-Sommerfest 2026', description: '', date: '2026-05-03T12:00:00Z', status: 'offen', hostName: 'Sarah Weber', locationName: 'Neckarsulm' },
    ];
  }
}