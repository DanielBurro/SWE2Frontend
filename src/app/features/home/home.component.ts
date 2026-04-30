import { Component, OnInit, inject, computed, signal, ChangeDetectorRef  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EventService } from '../../core/services/event.service';
import { Event } from '../../core/models/event.model';
import { HeaderComponent } from '../../shared/header/header.component';
import { AuthService } from '../../auth/auth';
import { SearchService } from '../../core/services/search.service';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzEmptyModule } from 'ng-zorro-antd/empty';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    HeaderComponent,
    NzButtonModule,
    NzCardModule,
    NzTagModule,
    NzAvatarModule,
    NzSkeletonModule,
    NzIconModule,
    NzDividerModule,
    NzEmptyModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  private eventService  = inject(EventService);
  private searchService = inject(SearchService);
  private authService   = inject(AuthService);
  private cdr           = inject(ChangeDetectorRef);

  isLoggedIn = this.authService.isAuthenticated;
  isSearching = this.searchService.isSearching;

  private allEvents = signal<Event[]>([]);
  activeTab = signal<string>('alle');
  isLoading = true;
  skeletonParagraph = { rows: 3 };

  tabs = [
    { key: 'alle',    label: 'Alle' },
    { key: 'ACTIVE',   label: 'Aktiv' },
    { key: 'PLANNED', label: 'Geplant' },
  ];

  filteredEvents = computed(() => {
    const q   = this.searchService.query().toLowerCase();
    const tab = this.activeTab();
    let events = this.allEvents();

    if (tab !== 'alle') {
      events = events.filter(e => e.status === tab);
    }

    if (q) {
      events = events.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q)
      );
    }

    return events;
  });

  ngOnInit(): void {
    if (!this.isLoggedIn()) return;

    this.eventService.getAll().subscribe({
      next: (events) => {
        this.allEvents.set(events);
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.allEvents.set(this.getDemoEvents());
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  setTab(tab: string): void {
    this.activeTab.set(tab);
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('de-DE', {
      day: 'numeric', month: 'short',
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

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getAvatarColor(index: number): string {
    const colors = ['#c9a96e', '#4caf82', '#c95a6e', '#5a82c9'];
    return colors[index % colors.length];
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'ACTIVE': return '#4caf82';     // grün
      case 'PLANNED': return '#c9a96e';    // gold
      case 'CANCELLED': return '#c95a6e';  // rot
      case 'DONE': return '#5a82c9';       // blau
      default: return '#999';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'Aktiv';
      case 'PLANNED': return 'Geplant';
      case 'CANCELLED': return 'Abgesagt';
      case 'DONE': return 'Beendet';
      default: return status;
    }
  }

  private getDemoEvents(): Event[] {
    return [
      { id: 1, title: 'Rooftop Vernissage — Frühjahr 2026', description: '', date: '2026-04-12T18:00:00Z', status: 'offen',   hostName: 'Laura Huber', hostId: 1, locationName: 'Heidelberg', locationId: 2 },
      { id: 2, title: 'Gartenparty im Weinberg',            description: '', date: '2026-04-19T15:00:00Z', status: 'geplant', hostName: 'Thomas Maier', hostId: 2, locationName: 'Heilbronn',  locationId: 1 },
      { id: 3, title: 'Firmen-Sommerfest 2026',             description: '', date: '2026-05-03T12:00:00Z', status: 'offen',   hostName: 'Sarah Weber',   hostId: 3, locationName: 'Neckarsulm', locationId: 1 },
      { id: 1, title: 'Rooftop Vernissage — Frühjahr 2026', description: '', date: '2026-04-12T18:00:00Z', status: 'ACTIVE',   hostName: 'Laura Huber',   locationName: 'Heidelberg' },
      { id: 2, title: 'Gartenparty im Weinberg',            description: '', date: '2026-04-19T15:00:00Z', status: 'PLANNEND', hostName: 'Thomas Maier', locationName: 'Heilbronn'  },
      { id: 3, title: 'Firmen-Sommerfest 2026',             description: '', date: '2026-05-03T12:00:00Z', status: 'PLANNEND',   hostName: 'Sarah Weber',   locationName: 'Neckarsulm' },
    ];
  }
}
