import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private userService = inject(UserService);
  private router = inject(Router);

  form = { firstName: '', lastName: '', username: '', email: '', password: '', passwordConfirm: '' };
  isSubmitting = false;
  error = '';

  submit(): void {
    if (this.form.password !== this.form.passwordConfirm) {
      this.error = 'Passwörter stimmen nicht überein.';
      return;
    }
    if (!this.form.email || !this.form.username || !this.form.password) {
      this.error = 'Bitte fülle alle Pflichtfelder aus.';
      return;
    }
    this.isSubmitting = true;
    this.error = '';

    this.userService.register({
      firstName: this.form.firstName,
      lastName: this.form.lastName,
      username: this.form.username,
      email: this.form.email,
      password: this.form.password,
    }).subscribe({
      next: () => this.router.navigate(['/']),
      error: () => {
        this.error = 'Registrierung fehlgeschlagen. Bitte versuche es erneut.';
        this.isSubmitting = false;
      },
    });
  }
}