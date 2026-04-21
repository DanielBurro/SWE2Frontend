import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';

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
  isLoggedIn = false;
  searchQuery = '';

  getInitials(): string {
    return 'MK'; // TODO: AuthService
  }

  onSearch(): void {
    // TODO: Router navigate to /events?q=searchQuery
    console.log('Suche:', this.searchQuery);
  }
}