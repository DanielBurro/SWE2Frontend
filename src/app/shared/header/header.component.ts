import { ChangeDetectorRef, Component, effect, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDropdownDirective, NzDropdownMenuComponent, NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzMenuDirective, NzMenuDividerDirective } from 'ng-zorro-antd/menu';
import { User } from '../../core/models/user.model';
import { AuthService } from '../../core/services/auth.service';
import { SearchService } from '../../core/services/search.service';
import { UserService } from '../../core/services/user.service';

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
    NzDropdownDirective,
    NzDropdownMenuComponent,
    NzMenuDividerDirective,
    NzMenuDirective,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private cdr = inject(ChangeDetectorRef);
  private searchService = inject(SearchService);

  isLoggedIn = this.authService.isAuthenticated;
  searchQuery = '';
  currentUser: User | null = null;

  constructor() {
    effect(() => {
      const isLoggedIn = this.isLoggedIn();
      const sessionUser = this.authService.currentUser();

      if (!isLoggedIn) {
        this.currentUser = null;
        this.cdr.detectChanges();
        return;
      }

      if (sessionUser) {
        this.currentUser = sessionUser;
        this.cdr.detectChanges();
        return;
      }

      this.userService.getMe().subscribe({
        next: (user) => {
          this.authService.updateCurrentUser(user);
          this.currentUser = user;
          this.cdr.detectChanges();
        },
        error: () => {
          this.currentUser = null;
          this.cdr.detectChanges();
        },
      });
    });
  }

  getInitials(): string {
    if (!this.currentUser) {
      return '?';
    }

    const first = this.currentUser.firstName?.charAt(0) ?? '';
    const last = this.currentUser.lastName?.charAt(0) ?? '';
    return (first + last).toUpperCase();
  }

  onHomeClick(): void {
    this.searchQuery = '';
    this.searchService.query.set('');
    this.searchService.isSearching.set(false);
  }

  onSearch(): void {
    const value = this.searchQuery.trim();
    this.searchService.query.set(value);
    this.searchService.isSearching.set(!!value);
  }

  onLogout(): void {
    this.authService.logout();
  }
}
