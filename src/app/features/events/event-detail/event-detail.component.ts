import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EventService } from '../../../core/services/event.service';
import { InvitationService } from '../../../core/services/invitation.service';
import { Event } from '../../../core/models/event.model';
import { Invitation } from '../../../core/models/invitation.model';
import { HeaderComponent } from '../../../shared/header/header.component';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    HeaderComponent,
    NzButtonModule,
    NzTagModule,
    NzAvatarModule,
    NzDividerModule,
    NzIconModule,
    NzSkeletonModule,
    NzEmptyModule,
    NzModalModule,
    NzSelectModule,
  ],
  templateUrl: './event-detail.component.html',
  styleUrl: './event-detail.component.scss',
})
export class EventDetailComponent implements OnInit {
  private route             = inject(ActivatedRoute);
  private eventService      = inject(EventService);
  private invitationService = inject(InvitationService);
  private message           = inject(NzMessageService);
  private cdr               = inject(ChangeDetectorRef);

  event: Event | null = null;
  invitations: Invitation[] = [];
  isLoading = true;
  isInviteModalOpen = false;
  selectedGuestId: number | null = null;

  // Aktueller User — TODO: AuthService
  currentUserId = 1;
  isHost = false;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadEvent(id);
    this.loadInvitations(id);
  }

  loadEvent(id: number): void {
    this.eventService.getAll().subscribe({
      next: (events) => {
        this.event = events.find((e) => e.id === id) ?? null;
        this.isHost = this.event?.hostName === 'Laura Huber'; // TODO: echte Auth
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.event = {
          id, title: 'Rooftop Vernissage — Frühjahr 2026',
          description: 'Eine exklusive Vernissage auf dem Rooftop mit Blick über die Stadt. Kunstwerke lokaler Künstler, Fingerfood und gute Gespräche.',
          date: '2026-04-12T18:00:00Z', status: 'offen',
          hostName: 'Laura Huber', locationName: 'Rooftop Heidelberg',
        };
        this.isHost = true;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  loadInvitations(eventId: number): void {
    this.invitationService.getByEvent(eventId).subscribe({
      next: (inv) => (this.invitations = inv),
      error: () => {
        this.invitations = [
          { id: 1, eventId, eventTitle: '', guestId: 2, guestName: 'Thomas Maier', status: 'ACCEPTED', plusOnes: 1, sentAt: '2026-03-20T10:00:00Z' },
          { id: 2, eventId, eventTitle: '', guestId: 3, guestName: 'Sarah Weber', status: 'PENDING', plusOnes: 0, sentAt: '2026-03-21T09:00:00Z' },
          { id: 3, eventId, eventTitle: '', guestId: 4, guestName: 'Max Kuster', status: 'DECLINED', plusOnes: 0, sentAt: '2026-03-22T11:00:00Z' },
        ];
      },
    });
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('de-DE', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
  }

  formatTime(dateStr: string): string {
    return new Date(dateStr).toLocaleTimeString('de-DE', {
      hour: '2-digit', minute: '2-digit',
    });
  }

  getEventStatusColor(status: string): string {
    const map: Record<string, string> = {
      ACTIVE: '#4caf82',
      PLANNED: '#c9a96e',
      CANCELLED: '#e86464',
      DONE: '#5a82c9',
    };
    return map[status] ?? '#888';
  }

  getEventStatusLabel(status: string): string {
    const map: Record<string, string> = {
      ACTIVE: 'Aktiv',
      PLANNED: 'Geplant',
      CANCELLED: 'Abgesagt',
      DONE: 'Beendet',
    };
    return map[status] ?? status;
}

  getStatusColor(status: string): string {
    const map: Record<string, string> = {
      ACCEPTED: '#4caf82',
      PENDING:  '#c9a96e',
      DECLINED: '#e86464',
    };
    return map[status] ?? '#888';
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      ACCEPTED: 'Zugesagt',
      PENDING:  'Ausstehend',
      DECLINED: 'Abgelehnt',
    };
    return map[status] ?? status;
  }

  getInitials(name: string): string {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  }

  get acceptedCount(): number {
    return this.invitations.filter((i) => i.status === 'ACCEPTED').length;
  }

  get pendingCount(): number {
    return this.invitations.filter((i) => i.status === 'PENDING').length;
  }

  // RSVP (Gast-Sicht)
  rsvp(status: 'ACCEPTED' | 'DECLINED'): void {
    const myInvitation = this.invitations.find((i) => i.guestId === this.currentUserId);
    if (!myInvitation) return;
    this.invitationService.updateStatus(myInvitation.id, { status, plusOnes: 0 }).subscribe({
      next: (updated) => {
        const idx = this.invitations.findIndex((i) => i.id === myInvitation.id);
        if (idx !== -1) this.invitations[idx] = updated;
        this.message.success(status === 'ACCEPTED' ? 'Du hast zugesagt!' : 'Du hast abgelehnt.');
      },
      error: () => this.message.error('Fehler beim Antworten.'),
    });
  }

  get myInvitation(): Invitation | undefined {
    return this.invitations.find((i) => i.guestId === this.currentUserId);
  }
}