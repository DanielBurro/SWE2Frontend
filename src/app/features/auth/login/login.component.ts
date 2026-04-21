import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../auth/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    HeaderComponent,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzIconModule,
    NzDividerModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private fb     = inject(FormBuilder);
  private router = inject(Router);

  private authService = inject(AuthService);

  form = { email: '', password: '' };
  isSubmitting = false;
  error = '';

  submit(): void {
    if (!this.form.email || !this.form.password) {
      this.error = 'Bitte fülle alle Felder aus.';
      return;
    }

    this.isSubmitting = true;
    this.authService.login(this.form).subscribe();
    setTimeout(() => this.router.navigate(['/']), 800);
  }
}
