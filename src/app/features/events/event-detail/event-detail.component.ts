import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { timeout } from 'rxjs';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { AuthService, User } from '../../../auth/auth';
import { Event } from '../../../core/models/event.model';
import { Invitation } from '../../../core/models/invitation.model';
import { EventService } from '../../../core/services/event.service';
import { InvitationService } from '../../../core/services/invitation.service';
import { HeaderComponent } from '../../../shared/header/header.component';

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
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private eventService = inject(EventService);
  private invitationService = inject(InvitationService);
  private authService = inject(AuthService);
  private message = inject(NzMessageService);

  event: Event | null = null;
  invitations: Invitation[] = [];
  isLoading = true;
  isInviteModalOpen = false;
  selectedGuestId: number | null = null;
  isHost = false;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (Number.isNaN(id)) {
      this.isLoading = false;
      return;
    }

    const eventFromNavigation = this.getNavigationEvent(id);
    if (eventFromNavigation) {
      this.event = eventFromNavigation;
      this.isHost = this.resolveIsHost(eventFromNavigation);
      this.isLoading = false;
    }

    this.loadEvent(id);
    this.loadInvitations(id);
  }

  loadEvent(id: number): void {
    this.eventService
      .getById(id)
      .pipe(timeout(8000))
      .subscribe({
      next: (event) => {
        this.event = event;
        this.isHost = this.resolveIsHost(event);
        this.isLoading = false;
      },
      error: () => {
        if (!this.event) {
          this.event = this.buildFallbackEvent(id);
        }
        this.isHost = this.resolveIsHost(this.event);
        this.isLoading = false;
      },
      });
  }

  loadInvitations(eventId: number): void {
    this.invitationService
      .getByEvent(eventId)
      .pipe(timeout(8000))
      .subscribe({
      next: (inv) => (this.invitations = inv),
      error: () => {
        this.invitations = [
          {
            id: 1,
            eventId,
            eventTitle: '',
            guestId: 2,
            guestName: 'Thomas Maier',
            status: 'ACCEPTED',
            plusOnes: 1,
            sentAt: '2026-03-20T10:00:00Z',
          },
          {
            id: 2,
            eventId,
            eventTitle: '',
            guestId: 3,
            guestName: 'Sarah Weber',
            status: 'PENDING',
            plusOnes: 0,
            sentAt: '2026-03-21T09:00:00Z',
          },
          {
            id: 3,
            eventId,
            eventTitle: '',
            guestId: 4,
            guestName: 'Max Kuster',
            status: 'DECLINED',
            plusOnes: 0,
            sentAt: '2026-03-22T11:00:00Z',
          },
        ];
      },
      });
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('de-DE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  formatTime(dateStr: string): string {
    return new Date(dateStr).toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getStatusColor(status: string): string {
    const map: Record<string, string> = {
      ACCEPTED: '#4caf82',
      PENDING: '#c9a96e',
      DECLINED: '#e86464',
    };
    return map[status] ?? '#888';
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      ACCEPTED: 'Zugesagt',
      PENDING: 'Ausstehend',
      DECLINED: 'Abgelehnt',
    };
    return map[status] ?? status;
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  get acceptedCount(): number {
    return this.invitations.filter((i) => i.status === 'ACCEPTED').length;
  }

  get pendingCount(): number {
    return this.invitations.filter((i) => i.status === 'PENDING').length;
  }

  rsvp(status: 'ACCEPTED' | 'DECLINED'): void {
    const currentUserId = this.currentUserId;
    if (!currentUserId) {
      this.message.error('Bitte melde dich an, um zu antworten.');
      return;
    }

    const myInvitation = this.invitations.find((i) => i.guestId === currentUserId);
    if (!myInvitation) return;

    this.invitationService
      .updateStatus(myInvitation.id, { status, plusOnes: 0 })
      .subscribe({
        next: (updated) => {
          const idx = this.invitations.findIndex((i) => i.id === myInvitation.id);
          if (idx !== -1) this.invitations[idx] = updated;
          this.message.success(
            status === 'ACCEPTED' ? 'Du hast zugesagt!' : 'Du hast abgelehnt.',
          );
        },
        error: () => this.message.error('Fehler beim Antworten.'),
      });
  }

  get myInvitation(): Invitation | undefined {
    const currentUserId = this.currentUserId;
    if (!currentUserId) {
      return undefined;
    }

    return this.invitations.find((i) => i.guestId === currentUserId);
  }

  protected editEvent(): void {
    if (!this.event) {
      return;
    }

    this.router.navigate(['/events', this.event.id, 'edit'], {
      state: { event: this.event },
    });
  }

  private get currentUser(): User | null {
    return this.authService.currentUser();
  }

  private get currentUserId(): number | null {
    return this.currentUser?.id ?? null;
  }

  private buildFallbackEvent(id: number): Event {
    const currentUser = this.currentUser;

    return {
      id,
      title: 'Rooftop Vernissage - Fruehjahr 2026',
      description:
        'Eine exklusive Vernissage auf dem Rooftop mit Blick ueber die Stadt. Kunstwerke lokaler Kuenstler, Fingerfood und gute Gespraeche.',
      date: '2026-04-12T18:00:00Z',
      status: 'offen',
      hostId: currentUser?.id,
      hostName: this.getCurrentUserFullName(currentUser) ?? 'Laura Huber',
      locationName: 'Rooftop Heidelberg',
    };
  }

  private getNavigationEvent(id: number): Event | null {
    const stateEvent = history.state?.event;
    if (!stateEvent || typeof stateEvent !== 'object') {
      return null;
    }

    return Number(stateEvent.id) === id ? (stateEvent as Event) : null;
  }

  private resolveIsHost(event: Event | null): boolean {
    const currentUser = this.currentUser;
    if (!event || !currentUser) {
      return false;
    }

    if (event.hostId !== undefined) {
      return event.hostId === currentUser.id;
    }

    const currentUserName = this.getCurrentUserFullName(currentUser);
    return (
      !!currentUserName &&
      this.normalizeName(event.hostName) === this.normalizeName(currentUserName)
    );
  }

  private getCurrentUserFullName(user: User | null): string | null {
    if (!user) {
      return null;
    }

    const fullName = `${user.firstName} ${user.lastName}`.trim();
    return fullName || null;
  }

  private normalizeName(value: string | null | undefined): string {
    return value?.trim().toLowerCase() ?? '';
  }
}
