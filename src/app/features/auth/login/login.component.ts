import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../auth/auth';
import { HeaderComponent } from '../../../shared/header/header.component';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,        // ← für ngModel
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
  private router      = inject(Router);
  private authService = inject(AuthService);
  private message     = inject(NzMessageService);

  form = { email: '', password: '' };
  isSubmitting = false;
  passwordVisible = false;

  submit(): void {
    if (!this.form.email || !this.form.password) {
      this.message.warning('Bitte fülle alle Felder aus.');
      return;
    }

    this.isSubmitting = true;

    this.authService.login(this.form).pipe(
      finalize(() => this.isSubmitting = false)   // ← immer ausgeführt
    ).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.message.error(err?.error?.message ?? 'Anmeldung fehlgeschlagen.');
      },
    });
  }
}