import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../auth/auth';
import { HeaderComponent } from '../../../shared/header/header.component';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    HeaderComponent,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzIconModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private router = inject(Router);
  private authService = inject(AuthService);
  private message = inject(NzMessageService);

  form = { email: '', password: '' };
  isSubmitting = false;
  passwordVisible = false;

  submit(): void {
    if (!this.form.email || !this.form.password) {
      this.message.warning('Bitte fuelle alle Felder aus.');
      return;
    }

    this.isSubmitting = true;

    this.authService.login(this.form).subscribe({
      next: () => {
        this.completeSubmit(() => this.router.navigate(['/']));
      },
      error: (err) => {
        this.completeSubmit(() => this.showLoginError(err));
      },
    });
  }

  private completeSubmit(callback?: () => void): void {
    setTimeout(() => {
      this.isSubmitting = false;
      callback?.();
    });
  }

  private showLoginError(error: unknown): void {
    if (error instanceof HttpErrorResponse && error.status === 404) {
      this.message.error('Login-Route nicht erreichbar: POST /api/auth/login liefert 404.');
      return;
    }

    if (error instanceof HttpErrorResponse && error.status === 0) {
      this.message.error('Backend nicht erreichbar. Bitte pruefe, ob der API-Server laeuft.');
      return;
    }

    const backendMessage =
      error instanceof HttpErrorResponse
        ? error.error?.message ?? error.error?.error
        : null;

    this.message.error(backendMessage ?? 'Anmeldung fehlgeschlagen.');
  }
}
