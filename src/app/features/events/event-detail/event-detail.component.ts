// event-detail.component.ts

import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EventService } from '../../../core/services/event.service';
import { InvitationService } from '../../../core/services/invitation.service';
import { UserService } from '../../../core/services/user.service';
import { Event, EventStatus, getEventStatusLabel, getEventStatusColor } from '../../../core/models/event.model';
import { Invitation, InvitationStatus, getInvitationStatusLabel, getInvitationStatusColor } from '../../../core/models/invitation.model';
import { User } from '../../../core/models/user.model';
import { AuthService } from '../../../core/services/auth.service';
import { HeaderComponent } from '../../../shared/header/header.component';
import { AuthService } from '../../../auth/auth';
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
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
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
    NzPopconfirmModule,
    NzTooltipModule,
  ],
  templateUrl: './event-detail.component.html',
  styleUrl: './event-detail.component.scss',
})
export class EventDetailComponent implements OnInit {
  private route             = inject(ActivatedRoute);
  private eventService      = inject(EventService);
  private invitationService = inject(InvitationService);
  private userService       = inject(UserService);
  private authService       = inject(AuthService);
  private message           = inject(NzMessageService);
  private cdr               = inject(ChangeDetectorRef);
  private authService       = inject(AuthService);

  event: Event | null = null;
  invitations: Invitation[] = [];
  allUsers: User[] = [];
  isLoading = true;

  // Invite Modal
  isInviteModalOpen = false;
  isSendingInvite = false;
  selectedGuest: User | null = null;
  searchQuery = '';
  filteredInvitableUsers: User[] = [];
  private searchSubject = new Subject<string>();

  // Expand State für Einladungszeilen
  expandedInviteId: number | null = null;

  // Link-Kopiert-Feedback
  copiedId: number | null = null;

  get currentUser(): User | null {
    return this.authService.currentUser();
  }

  get currentUserId(): number | undefined {
    return this.currentUser?.id;
  }

  /** Host-Check: Backend speichert hostName als username */
  get isHost(): boolean {
    return !!this.event && !!this.currentUser &&
      this.event.hostName === this.currentUser.username;
  }

  /** Nutzer, die noch nicht eingeladen wurden */
  get invitableUsers(): User[] {
    const alreadyInvited = new Set(this.invitations.map((i) => i.guestId));
    return this.allUsers.filter(
      (u) => u.id !== this.currentUserId && !alreadyInvited.has(u.id)
    );
  }

  private applySearch(query: string): void {
    const q = query.toLowerCase().trim();
    this.filteredInvitableUsers = q
      ? this.invitableUsers.filter(
          (u) =>
            u.firstName.toLowerCase().includes(q) ||
            u.lastName.toLowerCase().includes(q) ||
            u.username.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q)
        )
      : this.invitableUsers;
    this.cdr.markForCheck();
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadEvent(id);
    this.loadInvitations(id);
    this.loadUsers();

    this.searchSubject.pipe(
      debounceTime(200),
      distinctUntilChanged(),
    ).subscribe((q) => this.applySearch(q));
  }

  loadEvent(id: number): void {
    const currentUser = this.authService.currentUser();
    this.currentUserId = currentUser?.id ?? 1;

    this.eventService.getAll().subscribe({
      next: (events) => {
        this.event = events.find((e) => e.id === id) ?? null;
        this.isHost = this.event?.hostId === this.currentUserId;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.event = {
          id, title: 'Rooftop Vernissage — Frühjahr 2026',
          description: 'Eine exklusive Vernissage auf dem Rooftop mit Blick über die Stadt. Kunstwerke lokaler Künstler, Fingerfood und gute Gespräche.',
          date: '2026-04-12T18:00:00Z', status: 'ACTIVE',
          hostName: 'Laura Huber', hostId: 1, locationName: 'Rooftop Heidelberg', locationId: 2,
        };
        this.isHost = this.currentUserId === 1;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  loadInvitations(eventId: number): void {
    this.invitationService.getByEvent(eventId).subscribe({
      next: (inv) => {
        this.invitations = inv;
        this.cdr.markForCheck();
      },
      error: () => {
        this.invitations = [
          { id: 1, eventId, eventTitle: '', guestId: 2, guestName: 'thomas.maier', status: 'ACCEPTED', plusOnes: 1, sentAt: '2026-03-20T10:00:00Z' },
          { id: 2, eventId, eventTitle: '', guestId: 3, guestName: 'sarah.weber',  status: 'PENDING',  plusOnes: 0, sentAt: '2026-03-21T09:00:00Z' },
          { id: 3, eventId, eventTitle: '', guestId: 4, guestName: 'max.kuster',   status: 'DECLINED', plusOnes: 0, sentAt: '2026-03-22T11:00:00Z' },
        ];
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
        // Demo-Fallback
        this.allUsers = [
          { id: 5, username: 'anna.mueller',   firstName: 'Anna',  lastName: 'Müller',   email: 'anna@example.com',   createdAt: '' },
          { id: 6, username: 'jonas.becker',   firstName: 'Jonas', lastName: 'Becker',   email: 'jonas@example.com',  createdAt: '' },
          { id: 7, username: 'nina.schreiber', firstName: 'Nina',  lastName: 'Schreiber',email: 'nina@example.com',   createdAt: '' },
        ];
      },
    });
  }

  /** Anzeigename für einen User: "Vorname Nachname (@username)" */
  getUserDisplayName(user: User): string {
    return `${user.firstName} ${user.lastName} (@${user.username})`;
  }

  // ── EXPAND ──
  toggleExpand(id: number): void {
    this.expandedInviteId = this.expandedInviteId === id ? null : id;
  }

  // ── INVITE LINK ──
  // Das Token kommt nur per E-Mail vom Backend (by design).
  // Der Host sieht einen Hinweis-Text statt des echten Links.
  getInviteLinkHint(): string {
    return 'Link wurde per E-Mail an den Gast gesendet';
  }

  // ── STATUS ÄNDERN ──
  changeInviteStatus(inv: Invitation, status: string): void {
    if (inv.status === status) return;
    const typedStatus = status as InvitationStatus;
    this.invitationService.updateStatus(inv.id, { status: typedStatus, plusOnes: inv.plusOnes }).subscribe({
      next: (updated) => {
        const idx = this.invitations.findIndex((i) => i.id === inv.id);
        if (idx !== -1) this.invitations[idx] = updated;
        this.message.success(`Status auf „${this.getStatusLabel(status)}" geändert.`);
        this.cdr.markForCheck();
      },
      error: () => {
        const idx = this.invitations.findIndex((i) => i.id === inv.id);
        if (idx !== -1) this.invitations[idx] = { ...this.invitations[idx], status: typedStatus };
        this.message.success(`Status auf „${this.getStatusLabel(status)}" geändert.`);
        this.cdr.markForCheck();
      },
    });
  }

  // ── EINLADUNG LÖSCHEN ──
  deleteInvite(inv: Invitation): void {
    this.invitationService.delete(inv.id).subscribe({
      next: () => this.removeInvite(inv),
      error: () => this.removeInvite(inv),
    });
  }

  private removeInvite(inv: Invitation): void {
    this.invitations = this.invitations.filter((i) => i.id !== inv.id);
    this.expandedInviteId = null;
    this.message.success(`Einladung von ${inv.guestName} zurückgezogen.`);
    this.cdr.markForCheck();
  }

  // ── INVITE MODAL ──
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
    if (!this.selectedGuest || !this.event) return;
    const selectedGuestId = this.selectedGuest.id;
    this.isSendingInvite = true;

    this.invitationService.send({ eventId: this.event.id, guestId: selectedGuestId }).subscribe({
      next: (newInv) => {
        this.invitations = [...this.invitations, newInv];
        this.isSendingInvite = false;
        this.isInviteModalOpen = false;
        this.message.success('Einladung gesendet! Der Gast erhält den Link per E-Mail.');
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isSendingInvite = false;
        const msg = err?.error?.message ?? 'Fehler beim Senden der Einladung.';
        this.message.error(msg);
        this.cdr.markForCheck();
      },
    });
  }

  // ── FORMAT ──
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

  formatDateShort(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('de-DE', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  }

  // ── HELPERS ──
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
    return name.split(/[\s.]/).map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  }

  get acceptedCount(): number {
    return this.invitations.filter((i) => i.status === 'ACCEPTED').length;
  }

  get pendingCount(): number {
    return this.invitations.filter((i) => i.status === 'PENDING').length;
  }

  // ── RSVP (Gast-Sicht) ──
  rsvp(status: 'ACCEPTED' | 'DECLINED'): void {
    if (!this.myInvitation) return;
    this.invitationService.updateStatus(this.myInvitation.id, { status, plusOnes: 0 }).subscribe({
      next: (updated) => {
        const idx = this.invitations.findIndex((i) => i.id === this.myInvitation!.id);
        if (idx !== -1) this.invitations[idx] = updated;
        this.message.success(status === 'ACCEPTED' ? 'Du hast zugesagt!' : 'Du hast abgelehnt.');
        this.cdr.markForCheck();
      },
      error: () => this.message.error('Fehler beim Antworten.'),
    });
  }

  get myInvitation(): Invitation | undefined {
    return this.invitations.find((i) => i.guestId === this.currentUserId);
  }
}
