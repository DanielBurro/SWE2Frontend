import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private router = inject(Router);

  form = { identifier: '', password: '' };
  isSubmitting = false;
  error = '';

  submit(): void {
    if (!this.form.identifier || !this.form.password) {
      this.error = 'Bitte fülle alle Felder aus.';
      return;
    }
    this.isSubmitting = true;
    // TODO: AuthService.login() wenn Backend /api/auth/login bereitstellt
    setTimeout(() => this.router.navigate(['/']), 800);
  }
}