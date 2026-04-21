import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import * as bcrypt from 'bcryptjs';
import { UserService } from '../../../core/services/user.service';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzUploadModule, NzUploadFile } from 'ng-zorro-antd/upload';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzMessageService } from 'ng-zorro-antd/message';
import { HeaderComponent } from '../../../shared/header/header.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    HeaderComponent,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzIconModule,
    NzUploadModule,
    NzAvatarModule,
    NzDividerModule,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private router = inject(Router);
  private message = inject(NzMessageService);

  isSubmitting = false;
  passwordVisible = false;
  confirmVisible = false;
  avatarUrl: string | null = null;

  form: FormGroup = this.fb.group({
    firstName: ['', [Validators.required]],
    lastName:  ['', [Validators.required]],
    username:  ['', [Validators.required, Validators.minLength(3)]],
    email:     ['', [Validators.required, Validators.email]],
    password:  ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
    bio: [''],
  }, { validators: this.passwordMatchValidator });

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const pw      = control.get('password')?.value;
    const confirm = control.get('confirmPassword')?.value;
    return pw && confirm && pw !== confirm ? { passwordMismatch: true } : null;
  }

  beforeUpload = (file: NzUploadFile): boolean => {
    const isImage = file.type?.startsWith('image/');
    if (!isImage) { this.message.error('Nur Bilddateien erlaubt.'); return false; }
    const isLt2M = (file.size ?? 0) / 1024 / 1024 < 2;
    if (!isLt2M) { this.message.error('Bild muss kleiner als 2MB sein.'); return false; }
    const reader = new FileReader();
    reader.onload = (e) => (this.avatarUrl = e.target?.result as string);
    reader.readAsDataURL(file as unknown as File);
    return false;
  };

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
    const { firstName, lastName, username, email, password } = this.form.value;

    // Passwort hashen vor dem Senden
    const salt           = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    this.userService.register({
      firstName,
      lastName,
      username,
      email,
      password: hashedPassword,
    }).subscribe({
      next: () => {
        this.message.success('Konto erfolgreich erstellt!');
        this.router.navigate(['/']);
      },
      error: () => {
        this.message.error('Registrierung fehlgeschlagen. Bitte versuche es erneut.');
        this.isSubmitting = false;
      },
    });
  }
}