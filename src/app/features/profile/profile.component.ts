import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { InvitationService } from '../../core/services/invitation.service';
import { EventService } from '../../core/services/event.service';
import { User } from '../../core/models/user.model';
import { Invitation } from '../../core/models/invitation.model';
import { Event } from '../../core/models/event.model';
import { HeaderComponent } from '../../shared/header/header.component';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { CtaBanner } from '../../components/cta-banner/cta-banner';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, HeaderComponent, NzButtonModule, CtaBanner],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  private userService = inject(UserService);
  private invitationService = inject(InvitationService);
  private eventService = inject(EventService);

  currentUserId = 14; // aktuell hart coded
  user: User | null = null;
  invitations: Invitation[] = [];
  myEvents: Event[] = [];
  editMode = false;
  editForm = { username: '', firstName: '', lastName: '', email: '', bio: '' };

  ngOnInit(): void {
    this.loadUser();
    //this.loadInvitations();
    //this.loadMyEvents();
  }

  loadUser(): void {
    this.userService.getById(this.currentUserId).subscribe({
      next: (user) => {
        this.user = user;
        this.editForm = {
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          bio: '',
        };
      },
      error: () => {
        console.log('Login nicht erfolgreich, weiter mit Mockdaten');
        this.user = {
          id: 1,
          username: 'maxkuster',
          firstName: 'Max',
          lastName: 'Kuster',
          email: 'max.kuster@example.com',
          createdAt: '2026-01-15',
        };
        this.editForm = {
          username: 'maxkuster',
          firstName: 'Max',
          lastName: 'Kuster',
          email: 'max.kuster@example.com',
          bio: 'Event-Enthusiast aus Neckarsulm 🎉',
        };
      },
    });
  }

  loadInvitations(): void {
    this.invitationService.getByUser(this.currentUserId).subscribe({
      next: (inv) => (this.invitations = inv),
      error: () => {
        this.invitations = [
          {
            id: 1,
            eventId: 2,
            eventTitle: 'Gartenparty im Weinberg',
            guestId: 1,
            guestName: 'Max Kuster',
            status: 'PENDING',
            plusOnes: 0,
            sentAt: '2026-03-20T10:00:00Z',
          },
          {
            id: 2,
            eventId: 3,
            eventTitle: 'Firmen-Sommerfest 2026',
            guestId: 1,
            guestName: 'Max Kuster',
            status: 'ACCEPTED',
            plusOnes: 1,
            sentAt: '2026-03-18T09:00:00Z',
          },
        ];
      },
    });
  }

  loadMyEvents(): void {
    this.eventService.getByHost(this.currentUserId).subscribe({
      next: (events) => (this.myEvents = events),
      error: () => {
        this.myEvents = [
          {
            id: 1,
            title: 'Rooftop Vernissage — Frühjahr 2026',
            description: '',
            date: '2026-04-12T18:00:00Z',
            status: 'offen',
            hostName: 'Max Kuster',
            locationName: 'Heidelberg',
          },
        ];
      },
    });
  }

  getInitials(): string {
    if (!this.user) return '??';
    return `${this.user.firstName[0]}${this.user.lastName[0]}`.toUpperCase();
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      PENDING: 'Ausstehend',
      ACCEPTED: 'Zugesagt',
      DECLINED: 'Abgelehnt',
    };
    return map[status] ?? status;
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      PENDING: 'status-pending',
      ACCEPTED: 'status-accepted',
      DECLINED: 'status-declined',
    };
    return map[status] ?? '';
  }

  respondToInvitation(invId: number, status: 'ACCEPTED' | 'DECLINED'): void {
    this.invitationService.updateStatus(invId, { status, plusOnes: 0 }).subscribe({
      next: (updated) => {
        const idx = this.invitations.findIndex((i) => i.id === invId);
        if (idx !== -1) this.invitations[idx] = updated;
      },
      error: () => {
        // Demo: lokal updaten wenn Backend nicht erreichbar
        const idx = this.invitations.findIndex((i) => i.id === invId);
        if (idx !== -1) this.invitations[idx] = { ...this.invitations[idx], status };
      },
    });
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('de-DE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  navigateToCreateEvent(): void {}
}
