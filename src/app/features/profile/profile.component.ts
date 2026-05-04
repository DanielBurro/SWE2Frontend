import { Component, OnInit, inject, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InvitationService } from '../../core/services/invitation.service';
import { EventService } from '../../core/services/event.service';
import { Invitation } from '../../core/models/invitation.model';
import { Event } from '../../core/models/event.model';
import { HeaderComponent } from '../../shared/header/header.component';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { CtaBanner } from '../../components/cta-banner/cta-banner';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';
import { NzTabComponent, NzTabsComponent } from 'ng-zorro-antd/tabs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HeaderComponent,
    NzButtonModule,
    CtaBanner,
    NzTabComponent,
    NzTabsComponent,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  private invitationService = inject(InvitationService);
  private eventService = inject(EventService);
  protected authService = inject(AuthService); // Zugriff auf currentUser()

  // Quelle der Wahrheit: Das Signal aus dem AuthService
  readonly user = this.authService.currentUser;

  // Verwandte Daten bleiben lokale Signals
  invitations = signal<Invitation[]>([]);
  myEvents = signal<Event[]>([]);

  // Computed für die Initialen
  initials = computed(() => {
    const u = this.user();
    if (!u) return '??';
    return `${u.firstName[0]}${u.lastName[0]}`.toUpperCase();
  });

  editForm = { username: '', firstName: '', lastName: '', email: '', bio: '' };

  constructor() {
    // Optional: Ein Effect, der das Formular automatisch füllt, sobald der User geladen ist
    effect(() => {
      const u = this.user();
      if (u) {
        this.syncEditForm(u);
      }
    });
  }

  ngOnInit(): void {
    const u = this.user();
    if (u) {
      this.loadRelatedData(u.id);
    } else {
      // Falls wir im Profil landen, aber kein User da ist -> Redirect
      this.authService.logout();
    }
  }

  private loadRelatedData(userId: number): void {
    // Hier laden wir nur noch das, was NICHT im AuthService steckt
    this.invitationService.getByUser(userId).subscribe((inv) => this.invitations.set(inv));
    this.eventService.getByHost(userId).subscribe((ev) => this.myEvents.set(ev));
  }

  private syncEditForm(user: User): void {
    this.editForm = {
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      bio: user.bio || '',
    };
  }

  protected saveProfile() {
    // Hier würdest du den UserService nutzen, um die Daten ans Backend zu senden
    // Danach nicht vergessen: authService.refreshUser() aufrufen,
    // damit der Header und das Profil die neuen Daten zeigen!
    console.log('Speichere:', this.editForm);
  }
}
