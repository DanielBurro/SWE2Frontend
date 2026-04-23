// header.component.ts

import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/auth';
import { NzDropdownDirective, NzDropdownMenuComponent } from 'ng-zorro-antd/dropdown';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzMenuDirective, NzMenuItemComponent } from 'ng-zorro-antd/menu';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    NzButtonComponent,
    NzDropdownDirective,
    NzDropdownMenuComponent,
    NzMenuDirective,
    NzMenuItemComponent,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  private authService = inject(AuthService);

  // Wir greifen direkt auf die Signals des Services zu
  isLoggedIn = this.authService.isAuthenticated;
  currentUser = this.authService.currentUser;

  // Berechnete Initialen (Reagiert automatisch auf Änderungen am User)
  initials = computed(() => {
    const user = this.currentUser();
    if (!user) return '';

    const firstInitial = user.firstName?.charAt(0) || '';
    const lastInitial = user.lastName?.charAt(0) || '';

    return (firstInitial + lastInitial).toUpperCase();
  });

  protected logout() {
    this.authService.logout();
  }
}
