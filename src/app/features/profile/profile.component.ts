import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzTabComponent, NzTabsComponent } from 'ng-zorro-antd/tabs';
import { CtaBanner } from '../../components/cta-banner/cta-banner';
import { Event } from '../../core/models/event.model';
import { Invitation } from '../../core/models/invitation.model';
import { UpdateUserDto, User } from '../../core/models/user.model';
import { AuthService } from '../../core/services/auth.service';
import { EventService } from '../../core/services/event.service';
import { InvitationService } from '../../core/services/invitation.service';
import { UserService } from '../../core/services/user.service';
import { HeaderComponent } from '../../shared/header/header.component';

function trimmedRequired(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  return typeof value === 'string' && value.trim().length > 0 ? null : { required: true };
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    HeaderComponent,
    NzButtonModule,
    NzDividerModule,
    NzFormModule,
    NzIconModule,
    NzInputModule,
    NzSkeletonModule,
    NzAvatarModule,
    NzTabsComponent,
    NzTabComponent,
    CtaBanner,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private invitationService = inject(InvitationService);
  private eventService = inject(EventService);
  private userService = inject(UserService);
  private message = inject(NzMessageService);
  protected authService = inject(AuthService);
  private lastLoadedUserId: number | null = null;

  readonly user = this.authService.currentUser;

  invitations = signal<Invitation[]>([]);
  myEvents = signal<Event[]>([]);
  invitationsLoading = signal(true);
  myEventsLoading = signal(true);
  myEventsError = signal(false);
  profileSaving = signal(false);

  profileForm = this.fb.nonNullable.group({
    firstName: ['', [trimmedRequired]],
    lastName: ['', [trimmedRequired]],
    username: ['', [trimmedRequired, Validators.minLength(3)]],
    email: ['', [trimmedRequired, Validators.email]],
    bio: ['', [Validators.maxLength(280)]],
  });

  initials = computed(() => {
    const user = this.user();
    if (!user) {
      return '??';
    }

    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  });

  constructor() {
    effect(() => {
      const user = this.user();
      if (user) {
        this.syncProfileForm(user);

        if (this.lastLoadedUserId !== user.id) {
          this.lastLoadedUserId = user.id;
          this.loadRelatedData(user.id);
        }
        return;
      }

      this.lastLoadedUserId = null;
      this.invitations.set([]);
      this.myEvents.set([]);
      this.invitationsLoading.set(false);
      this.myEventsLoading.set(false);
      this.myEventsError.set(false);
      this.profileForm.reset({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        bio: '',
      });
    });
  }

  ngOnInit(): void {
    if (!this.user()) {
      this.authService.logout();
    }
  }

  protected reloadMyEvents(): void {
    const user = this.user();
    if (user) {
      this.loadMyEvents(user.id);
    }
  }

  protected resetProfileForm(): void {
    const user = this.user();
    if (user) {
      this.syncProfileForm(user);
    }
  }

  protected saveProfile(): void {
    const user = this.user();
    if (!user) {
      this.authService.logout();
      return;
    }

    if (this.profileForm.invalid) {
      Object.values(this.profileForm.controls).forEach((control) => {
        control.markAsDirty();
        control.updateValueAndValidity();
      });
      return;
    }

    this.profileSaving.set(true);
    this.userService
      .update(user.id, this.buildUpdatePayload())
      .pipe(finalize(() => this.profileSaving.set(false)))
      .subscribe({
        next: (updatedUser) => {
          this.authService.updateCurrentUser(updatedUser);
          this.syncProfileForm(updatedUser);
          this.message.success('Profildetails wurden gespeichert.');
        },
        error: (error) => {
          this.message.error(error?.error?.error ?? 'Profil konnte nicht aktualisiert werden.');
        },
      });
  }

  protected getControl(name: keyof typeof this.profileForm.controls) {
    return this.profileForm.controls[name];
  }

  protected formatEventDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('de-DE', {
      day: 'numeric',
      month: 'short',
    });
  }

  protected getGradient(index: number): string {
    const gradients = [
      'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      'linear-gradient(135deg, #0d1f12 0%, #1a3a24 50%, #2d5a3d 100%)',
      'linear-gradient(135deg, #1f0d0d 0%, #3a1a1a 50%, #5a2d2d 100%)',
      'linear-gradient(135deg, #1a1a0d 0%, #2e2e0d 50%, #4a4a1a 100%)',
    ];
    return gradients[index % gradients.length];
  }

  protected getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'offen':
      case 'planned':
        return '#c9a96e';
      case 'active':
      case 'accepted':
        return '#4caf82';
      case 'abgesagt':
      case 'cancelled':
      case 'declined':
        return '#e86464';
      case 'done':
        return '#5a82c9';
      default:
        return '#c9a96e';
    }
  }

  protected getHostInitials(name: string | null | undefined): string {
    if (!name?.trim()) {
      return this.initials();
    }

    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  protected get bioLength(): number {
    return this.profileForm.controls.bio.value.length;
  }

  private buildUpdatePayload(): UpdateUserDto {
    const value = this.profileForm.getRawValue();

    return {
      firstName: value.firstName.trim(),
      lastName: value.lastName.trim(),
      username: value.username.trim(),
      email: value.email.trim(),
      bio: value.bio.trim(),
    };
  }

  private loadRelatedData(userId: number): void {
    this.loadInvitations(userId);
    this.loadMyEvents(userId);
  }

  private loadInvitations(userId: number): void {
    this.invitationsLoading.set(true);
    this.invitationService
      .getByUser(userId)
      .pipe(finalize(() => this.invitationsLoading.set(false)))
      .subscribe({
        next: (invitations) => this.invitations.set(invitations),
        error: () => this.invitations.set([]),
      });
  }

  private loadMyEvents(userId: number): void {
    this.myEventsLoading.set(true);
    this.myEventsError.set(false);
    this.eventService
      .getByHost(userId)
      .pipe(finalize(() => this.myEventsLoading.set(false)))
      .subscribe({
        next: (events) => this.myEvents.set(events),
        error: () => {
          this.myEvents.set([]);
          this.myEventsError.set(true);
        },
      });
  }

  private syncProfileForm(user: User): void {
    this.profileForm.reset({
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      username: user.username ?? '',
      email: user.email ?? '',
      bio: user.bio ?? '',
    });
  }
}
