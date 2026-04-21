import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import * as bcrypt from 'bcryptjs';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { HeaderComponent } from '../../../shared/header/header.component';

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
  private message = inject(NzMessageService);
  private cdr    = inject(ChangeDetectorRef);

  isSubmitting   = false;
  passwordVisible = false;

  form: FormGroup = this.fb.group({
    email:    ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  getControl(name: string) { return this.form.get(name); }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach((c) => {
        c.markAsDirty();
        c.updateValueAndValidity();
      });
      return;
    }

    this.isSubmitting = true;
    this.cdr.detectChanges();

    const { email, password } = this.form.value;

    try {
      const salt           = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // TODO: ersetzen durch echten AuthService wenn Backend /api/auth/login hat
      // Aktuell: gehashtes Passwort ans Backend schicken
      //console.log('Login mit:', { email, password: hashedPassword });
      this.message.success('Erfolgreich angemeldet!');
      this.router.navigate(['/']);
    } catch {
      this.message.error('Login fehlgeschlagen.');
    } finally {
      this.isSubmitting = false;
      this.cdr.detectChanges();
    }
  }
}