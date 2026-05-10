import { CommonModule } from '@angular/common';
import { Component, OnInit, effect, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AuthService } from '../../core/services/auth.service';
import { UpdateUserDto, User } from '../../core/models/user.model';
import { UserService } from '../../core/services/user.service';
import { HeaderComponent } from '../../shared/header/header.component';

function trimmedRequired(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  return typeof value === 'string' && value.trim().length > 0 ? null : { required: true };
}

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    HeaderComponent,
    NzButtonModule,
    NzFormModule,
    NzIconModule,
    NzInputModule,
  ],
  templateUrl: './profile-edit.component.html',
  styleUrl: './profile-edit.component.scss',
})
export class ProfileEditComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private router = inject(Router);
  private message = inject(NzMessageService);

  readonly user = this.authService.currentUser;
  isSaving = false;

  profileForm = this.fb.nonNullable.group({
    firstName: ['', [trimmedRequired]],
    lastName: ['', [trimmedRequired]],
    username: ['', [trimmedRequired, Validators.minLength(3)]],
    email: ['', [trimmedRequired, Validators.email]],
    bio: ['', [Validators.maxLength(280)]],
  });

  constructor() {
    effect(() => {
      const user = this.user();
      if (!user) {
        return;
      }

      this.syncForm(user);
    });
  }

  ngOnInit(): void {
    if (!this.user()) {
      this.authService.logout();
    }
  }

  protected getControl(name: keyof typeof this.profileForm.controls) {
    return this.profileForm.controls[name];
  }

  protected get bioLength(): number {
    return this.profileForm.controls.bio.value.length;
  }

  protected resetForm(): void {
    const user = this.user();
    if (user) {
      this.syncForm(user);
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

    this.isSaving = true;
    this.userService
      .update(user.id, this.buildUpdatePayload())
      .pipe(finalize(() => (this.isSaving = false)))
      .subscribe({
        next: (updatedUser) => {
          this.authService.updateCurrentUser(updatedUser);
          this.syncForm(updatedUser);
          this.message.success('Profildetails wurden gespeichert.');
          this.router.navigate(['/profile']);
        },
        error: (error) => {
          this.message.error(error?.error?.error ?? 'Profil konnte nicht aktualisiert werden.');
        },
      });
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

  private syncForm(user: User): void {
    this.profileForm.reset({
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      username: user.username ?? '',
      email: user.email ?? '',
      bio: user.bio ?? '',
    });
  }
}
