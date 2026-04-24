import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';

export interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
  bio?: string;
  profilePicUrl?: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';

  #token = signal<string | null>(localStorage.getItem(this.TOKEN_KEY));
  #user = signal<User | null>(this.getInitialUser());

  isAuthenticated = computed(() => !!this.#token());
  currentToken = computed(() => this.#token());
  currentUser = computed(() => this.#user());

  private getInitialUser(): User | null {
    const savedUser = localStorage.getItem(this.USER_KEY);
    return savedUser ? JSON.parse(savedUser) : null;
  }

  login(credentials: unknown) {
    return this.http.post<AuthResponse>('/api/auth/login', credentials).pipe(
      tap((response) => {
        this.setSession(response.token, response.user);
      }),
    );
  }

  private setSession(token: string, user: User) {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));

    this.#token.set(token);
    this.#user.set(user);
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);

    this.#token.set(null);
    this.#user.set(null);
    this.router.navigate(['/auth/login']);
  }

  refreshUser() {
    return this.http
      .get<User>('/api/users/me')
      .pipe(
        tap((user) => {
          this.#user.set(user);
          localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        }),
      )
      .subscribe();
  }
}
