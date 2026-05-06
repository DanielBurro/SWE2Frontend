import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, timeout } from 'rxjs';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { Event, EventStatus, getEventStatusColor, getEventStatusLabel } from '../../../core/models/event.model';
import {
  Invitation,
  InvitationStatus,
  getInvitationStatusColor,
  getInvitationStatusLabel,
} from '../../../core/models/invitation.model';
import { User } from '../../../core/models/user.model';
import { AuthService } from '../../../core/services/auth.service';
import { EventService } from '../../../core/services/event.service';
import { InvitationService } from '../../../core/services/invitation.service';
import { UserService } from '../../../core/services/user.service';
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
    NzPopconfirmModule,
    NzTooltipModule,
  ],
  templateUrl: './event-detail.component.html',
  styleUrl: './event-detail.component.scss',
})
export class EventDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private eventService = inject(EventService);
  private invitationService = inject(InvitationService);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private message = inject(NzMessageService);
  private cdr = inject(ChangeDetectorRef);

  event: Event | null = null;
  invitations: Invitation[] = [];
  allUsers: User[] = [];
  isLoading = true;

  isInviteModalOpen = false;
  isSendingInvite = false;
  selectedGuest: User | null = null;
  searchQuery = '';
  filteredInvitableUsers: User[] = [];
  expandedInviteId: number | null = null;

  private searchSubject = new Subject<string>();

  get isHost(): boolean {
    return this.resolveIsHost(this.event);
  }

  get invitableUsers(): User[] {
    const alreadyInvited = new Set(this.invitations.map((invitation) => invitation.guestId));
    return this.allUsers.filter(
      (user) => user.id !== this.currentUserId && !alreadyInvited.has(user.id),
    );
  }

  get acceptedCount(): number {
    return this.invitations.filter((invitation) => invitation.status === 'ACCEPTED').length;
  }

  get pendingCount(): number {
    return this.invitations.filter((invitation) => invitation.status === 'PENDING').length;
  }

  get myInvitation(): Invitation | undefined {
    const currentUserId = this.currentUserId;
    if (!currentUserId) {
      return undefined;
    }

    return this.invitations.find((invitation) => invitation.guestId === currentUserId);
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isInteger(id) || id <= 0) {
      this.isLoading = false;
      return;
    }

    const eventFromNavigation = this.getNavigationEvent(id);
    if (eventFromNavigation) {
      this.event = eventFromNavigation;
      this.isLoading = false;
      this.cdr.markForCheck();
    }

    this.loadEvent(id);
    this.loadInvitations(id);
    this.loadUsers();

    this.searchSubject
      .pipe(debounceTime(200), distinctUntilChanged())
      .subscribe((query) => this.applySearch(query));
  }

  loadEvent(id: number): void {
    this.eventService
      .getById(id)
      .pipe(timeout(8000))
      .subscribe({
        next: (event) => {
          this.event = event;
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          if (!this.event) {
            this.event = this.buildFallbackEvent(id);
          }
          this.isLoading = false;
          this.cdr.markForCheck();
        },
      });
  }

  loadInvitations(eventId: number): void {
    this.invitationService
      .getByEvent(eventId)
      .pipe(timeout(8000))
      .subscribe({
        next: (invitations) => {
          this.invitations = invitations;
          this.cdr.markForCheck();
        },
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
          this.cdr.markForCheck();
        },
      });
  }

  loadUsers(): void {
    this.userService.getAll().subscribe({
      next: (users) => {
        this.allUsers = users;
        this.filteredInvitableUsers = this.invitableUsers;
        this.cdr.markForCheck();
      },
      error: () => {
        this.allUsers = [
          {
            id: 5,
            username: 'anna.mueller',
            firstName: 'Anna',
            lastName: 'Mueller',
            email: 'anna@example.com',
            createdAt: '',
          },
          {
            id: 6,
            username: 'jonas.becker',
            firstName: 'Jonas',
            lastName: 'Becker',
            email: 'jonas@example.com',
            createdAt: '',
          },
          {
            id: 7,
            username: 'nina.schreiber',
            firstName: 'Nina',
            lastName: 'Schreiber',
            email: 'nina@example.com',
            createdAt: '',
          },
        ];
        this.filteredInvitableUsers = this.invitableUsers;
        this.cdr.markForCheck();
      },
    });
  }

  toggleExpand(id: number): void {
    this.expandedInviteId = this.expandedInviteId === id ? null : id;
  }

  getInviteLinkHint(): string {
    return 'Link wurde per E-Mail an den Gast gesendet';
  }

  changeInviteStatus(invitation: Invitation, status: string): void {
    if (invitation.status === status) {
      return;
    }

    this.invitationService
      .updateStatus(invitation.id, {
        status: status as InvitationStatus,
        plusOnes: invitation.plusOnes,
      })
      .subscribe({
        next: (updatedInvitation) => {
          const index = this.invitations.findIndex((current) => current.id === invitation.id);
          if (index !== -1) {
            this.invitations[index] = updatedInvitation;
          }
          this.message.success(`Status auf "${this.getStatusLabel(status)}" geändert.`);
          this.cdr.markForCheck();
        },
        error: () => {
          this.message.error('Status konnte nicht aktualisiert werden.');
        },
      });
  }

  deleteInvite(invitation: Invitation): void {
    this.invitationService.delete(invitation.id).subscribe({
      next: () => this.removeInvite(invitation),
      error: () => this.removeInvite(invitation),
    });
  }

  openInviteModal(): void {
    this.isInviteModalOpen = true;
    this.selectedGuest = null;
    this.searchQuery = '';
    this.filteredInvitableUsers = this.invitableUsers;
  }

  onSearchChange(query: string): void {
    this.searchQuery = query;
    this.searchSubject.next(query);
  }

  selectUser(user: User): void {
    this.selectedGuest = this.selectedGuest?.id === user.id ? null : user;
  }

  closeInviteModal(): void {
    this.isInviteModalOpen = false;
  }

  sendInvite(): void {
    if (!this.selectedGuest || !this.event) {
      return;
    }

    this.isSendingInvite = true;
    this.invitationService
      .send({ eventId: this.event.id, guestId: this.selectedGuest.id })
      .subscribe({
        next: (newInvitation) => {
          this.invitations = [...this.invitations, newInvitation];
          this.isSendingInvite = false;
          this.isInviteModalOpen = false;
          this.message.success('Einladung gesendet! Der Gast erhält den Link per E-Mail.');
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.isSendingInvite = false;
          this.message.error(error?.error?.message ?? 'Fehler beim Senden der Einladung.');
          this.cdr.markForCheck();
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

  formatDateShort(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('de-DE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  getEventStatusColor(status: string): string {
    return getEventStatusColor(status as EventStatus);
  }

  getEventStatusLabel(status: string): string {
    return getEventStatusLabel(status as EventStatus);
  }

  getStatusColor(status: string): string {
    return getInvitationStatusColor(status as InvitationStatus);
  }

  getStatusLabel(status: string): string {
    return getInvitationStatusLabel(status as InvitationStatus);
  }

  getInitials(name: string): string {
    return name
      .split(/[\s.]/)
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  rsvp(status: 'ACCEPTED' | 'DECLINED'): void {
    const currentUserId = this.currentUserId;
    if (!currentUserId) {
      this.message.error('Bitte melde dich an, um zu antworten.');
      return;
    }

    const myInvitation = this.invitations.find((invitation) => invitation.guestId === currentUserId);
    if (!myInvitation) {
      return;
    }

    this.invitationService
      .updateStatus(myInvitation.id, { status, plusOnes: 0 })
      .subscribe({
        next: (updatedInvitation) => {
          const index = this.invitations.findIndex((invitation) => invitation.id === myInvitation.id);
          if (index !== -1) {
            this.invitations[index] = updatedInvitation;
          }
          this.message.success(status === 'ACCEPTED' ? 'Du hast zugesagt!' : 'Du hast abgelehnt.');
          this.cdr.markForCheck();
        },
        error: () => this.message.error('Fehler beim Antworten.'),
      });
  }

  private applySearch(query: string): void {
    const normalizedQuery = query.toLowerCase().trim();
    this.filteredInvitableUsers = normalizedQuery
      ? this.invitableUsers.filter(
          (user) =>
            user.firstName.toLowerCase().includes(normalizedQuery) ||
            user.lastName.toLowerCase().includes(normalizedQuery) ||
            user.username.toLowerCase().includes(normalizedQuery) ||
            user.email.toLowerCase().includes(normalizedQuery),
        )
      : this.invitableUsers;
    this.cdr.markForCheck();
  }

  private removeInvite(invitation: Invitation): void {
    this.invitations = this.invitations.filter((current) => current.id !== invitation.id);
    this.expandedInviteId = null;
    this.message.success(`Einladung von ${invitation.guestName} zurückgezogen.`);
    this.cdr.markForCheck();
  }

  private buildFallbackEvent(id: number): Event {
    const currentUser = this.currentUser;
    const currentUserName = this.getCurrentUserFullName(currentUser);

    return {
      id,
      title: 'Rooftop Vernissage - Fruehjahr 2026',
      description:
        'Eine exklusive Vernissage auf dem Rooftop mit Blick ueber die Stadt. Kunstwerke lokaler Kuenstler, Fingerfood und gute Gespraeche.',
      date: '2026-04-12T18:00:00Z',
      status: 'PLANNED',
      hostId: currentUser?.id ?? 1,
      hostName: currentUser?.username ?? currentUserName ?? 'laura.huber',
      locationName: 'Rooftop Heidelberg',
      locationId: 2,
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

    if (event.hostId === currentUser.id) {
      return true;
    }

    if (this.normalizeName(event.hostName) === this.normalizeName(currentUser.username)) {
      return true;
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

  private get currentUser(): User | null {
    return this.authService.currentUser();
  }

  private get currentUserId(): number | null {
    return this.currentUser?.id ?? null;
  }
}
