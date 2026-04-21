import { Component, inject, computed, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { AuthService } from '../../auth/auth';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/user.model';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    NzLayoutModule,
    NzButtonModule,
    NzInputModule,
    NzIconModule,
    NzDropDownModule,
    NzAvatarModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  private router      = inject(Router);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private cdr =         inject(ChangeDetectorRef);

  // direkt vom AuthService-Signal ableiten — kein localStorage-Zugriff nötig
  isLoggedIn = this.authService.isAuthenticated;

  searchQuery = '';
  currentUser: User | null = null;

  constructor() {
    // Userdaten laden, sobald eingeloggt
    if (this.isLoggedIn()) {
      this.userService.getMe().subscribe({
        next: (user) => (this.currentUser = user),
        error: () => (this.currentUser = null),
      });
    }
  }

  getInitials(): string {
    if (!this.currentUser) return '?';
    const first = this.currentUser.firstName?.charAt(0) ?? '';
    const last  = this.currentUser.lastName?.charAt(0) ?? '';
    return (first + last).toUpperCase();
  }

  onSearch(): void {
    if (!this.searchQuery.trim()) return;
    this.router.navigate(['/events'], {
      queryParams: { q: this.searchQuery.trim() },
    });
  }

  onLogout(): void {
    this.authService.logout();
    this.currentUser = null; 
    this.cdr.detectChanges();
  }
}